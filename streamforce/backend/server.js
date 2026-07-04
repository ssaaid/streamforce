require('dotenv').config();

// ── Fail fast : variables d'environnement critiques ──────────────
const REQUIRED_ENV = ['JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`\n❌ Variables d'environnement manquantes : ${missing.join(', ')}`);
  console.error('   Définissez-les dans .env (dev) ou dans le dashboard Render (prod).\n');
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('\n❌ JWT_SECRET trop court — minimum 32 caractères.\n');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Init DB
initDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (frontend)
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/admin-panel', express.static(path.join(__dirname, '..', 'admin')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'StreamForce API running 🚀' });
});

// Fallback — serve frontend
app.get('*', (req, res) => {
  if (req.path.startsWith('/admin-panel')) {
    res.sendFile(path.join(__dirname, '..', 'admin', 'index.html'));
  } else {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 StreamForce API démarrée sur http://localhost:${PORT}`);
  console.log(`📺 Frontend: http://localhost:${PORT}`);
  console.log(`🔐 Admin:    http://localhost:${PORT}/admin-panel`);
  console.log(`🔑 Admin login: ${process.env.ADMIN_EMAIL}\n`);
});
