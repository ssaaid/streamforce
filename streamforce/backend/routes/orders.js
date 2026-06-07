const express = require('express');
const router = express.Router();
const { orders, users } = require('../db/database');
const { auth } = require('../middleware/auth');

const PLANS = {
  mensuel: { name: 'Mensuel', price: 9, days: 30, connections: 1 },
  trimestriel: { name: 'Trimestriel', price: 22, days: 90, connections: 2 },
  annuel: { name: 'Annuel', price: 49, days: 365, connections: 4 }
};

// POST /api/orders — créer une commande
router.post('/', auth, (req, res) => {
  try {
    const { plan, paymentMethod } = req.body;

    if (!PLANS[plan])
      return res.status(400).json({ error: 'Plan invalide' });

    if (!paymentMethod)
      return res.status(400).json({ error: 'Méthode de paiement requise' });

    const planInfo = PLANS[plan];
    const order = orders.create({
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      plan,
      planName: planInfo.name,
      price: planInfo.price,
      paymentMethod,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Commande créée — en attente de validation',
      order
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/orders/my — mes commandes
router.get('/my', auth, (req, res) => {
  const myOrders = orders.findByUser(req.user.id);
  res.json(myOrders);
});

module.exports = router;
