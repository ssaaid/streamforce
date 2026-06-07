require('dotenv').config();
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
  console.log(`🔑 Admin login: ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}\n`);
});
