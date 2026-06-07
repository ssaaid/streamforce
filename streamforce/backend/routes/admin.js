const express = require('express');
const router = express.Router();
const { users, orders, contacts } = require('../db/database');
const { adminAuth } = require('../middleware/auth');

const PLANS = {
  mensuel: { days: 30 },
  trimestriel: { days: 90 },
  annuel: { days: 365 }
};

// GET /api/admin/stats
router.get('/stats', adminAuth, (req, res) => {
  const allUsers = users.all().filter(u => u.role !== 'admin');
  const allOrders = orders.all();
  const allContacts = contacts.all();
  const now = new Date();

  res.json({
    totalClients: allUsers.length,
    activeClients: allUsers.filter(u => u.plan && u.planExpiry && new Date(u.planExpiry) > now).length,
    pendingOrders: allOrders.filter(o => o.status === 'pending').length,
    totalRevenue: allOrders.filter(o => o.status === 'confirmed').reduce((s, o) => s + o.price, 0),
    unreadMessages: allContacts.filter(c => !c.read).length
  });
});

// GET /api/admin/users
router.get('/users', adminAuth, (req, res) => {
  const allUsers = users.all().map(({ password, ...u }) => u);
  res.json(allUsers);
});

// PUT /api/admin/users/:id — modifier un utilisateur (plan, status)
router.put('/users/:id', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const { plan, status, planExpiry } = req.body;

  let updateData = {};
  if (status) updateData.status = status;

  if (plan && PLANS[plan]) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + PLANS[plan].days);
    updateData.plan = plan;
    updateData.planExpiry = planExpiry || expiry.toISOString();
  }

  const updated = users.update(id, updateData);
  if (!updated) return res.status(404).json({ error: 'Utilisateur introuvable' });

  const { password, ...safeUser } = updated;
  res.json({ message: 'Utilisateur mis à jour', user: safeUser });
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.findById(id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  if (user.role === 'admin') return res.status(403).json({ error: 'Impossible de supprimer un admin' });
  users.delete(id);
  res.json({ message: 'Utilisateur supprimé' });
});

// GET /api/admin/orders
router.get('/orders', adminAuth, (req, res) => {
  res.json(orders.all());
});

// PUT /api/admin/orders/:id — valider/refuser une commande
router.put('/orders/:id', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  if (!['confirmed', 'rejected', 'pending'].includes(status))
    return res.status(400).json({ error: 'Statut invalide' });

  const allOrders = orders.all();
  const order = allOrders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Commande introuvable' });

  const updated = orders.update(id, { status });

  // Si confirmée, activer le plan de l'utilisateur
  if (status === 'confirmed' && PLANS[order.plan]) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + PLANS[order.plan].days);
    users.update(order.userId, {
      plan: order.plan,
      planExpiry: expiry.toISOString()
    });
  }

  res.json({ message: `Commande ${status}`, order: updated });
});

// GET /api/admin/contacts
router.get('/contacts', adminAuth, (req, res) => {
  res.json(contacts.all().reverse());
});

// PUT /api/admin/contacts/:id/read
router.put('/contacts/:id/read', adminAuth, (req, res) => {
  contacts.markRead(parseInt(req.params.id));
  res.json({ message: 'Marqué comme lu' });
});

module.exports = router;
