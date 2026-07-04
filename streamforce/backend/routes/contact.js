const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { contacts } = require('../db/database');

// 3 messages par IP par heure
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de messages envoyés — réessayez dans une heure.' },
});

// POST /api/contact
router.post('/', contactLimiter, (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message)
      return res.status(400).json({ error: 'Nom, email et message sont obligatoires' });

    const contact = contacts.create({ name, email, subject: subject || 'Demande générale', message });

    res.status(201).json({
      message: 'Message envoyé avec succès ! Nous répondrons sous 24h.',
      id: contact.id
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
