const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// En production, stocker sur le disque persistant Render (/data).
// Si /data n'est pas encore monté (premier déploiement), fallback sur db/ local.
function resolveDbPath() {
  if (process.env.NODE_ENV !== 'production') return path.join(__dirname, '..', 'db');
  try {
    fs.mkdirSync('/data', { recursive: true });
    fs.accessSync('/data', fs.constants.W_OK);
    return '/data';
  } catch {
    console.warn('⚠️  /data non accessible — fallback sur le répertoire local (données non persistantes)');
    return path.join(__dirname, '..', 'db');
  }
}

const DB_PATH = resolveDbPath();

const USERS_FILE    = path.join(DB_PATH, 'users.json');
const ORDERS_FILE   = path.join(DB_PATH, 'orders.json');
const CONTACTS_FILE = path.join(DB_PATH, 'contacts.json');

function initDB() {
  console.log(`📁 Stockage DB : ${DB_PATH}`);

  if (!fs.existsSync(USERS_FILE)) {
    // ADMIN_PASSWORD est garanti non-vide par la vérification dans server.js
    const adminHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
    fs.writeFileSync(USERS_FILE, JSON.stringify([
      {
        id: 1,
        name: 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: adminHash,
        role: 'admin',
        plan: null,
        planExpiry: null,
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ], null, 2));
  }

  if (!fs.existsSync(ORDERS_FILE))   fs.writeFileSync(ORDERS_FILE,   JSON.stringify([], null, 2));
  if (!fs.existsSync(CONTACTS_FILE)) fs.writeFileSync(CONTACTS_FILE, JSON.stringify([], null, 2));

  console.log('✅ Base de données initialisée');
}

function readFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch { return []; }
}

function writeFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function nextId(arr) {
  return arr.length > 0 ? Math.max(...arr.map(i => i.id)) + 1 : 1;
}

const users = {
  all:         ()           => readFile(USERS_FILE),
  findById:    (id)         => readFile(USERS_FILE).find(u => u.id === id),
  findByEmail: (email)      => readFile(USERS_FILE).find(u => u.email === email),
  create: (data) => {
    const arr  = readFile(USERS_FILE);
    const user = { id: nextId(arr), ...data, createdAt: new Date().toISOString() };
    arr.push(user);
    writeFile(USERS_FILE, arr);
    return user;
  },
  update: (id, data) => {
    const arr = readFile(USERS_FILE);
    const idx = arr.findIndex(u => u.id === id);
    if (idx === -1) return null;
    arr[idx] = { ...arr[idx], ...data };
    writeFile(USERS_FILE, arr);
    return arr[idx];
  },
  delete: (id) => {
    const arr = readFile(USERS_FILE).filter(u => u.id !== id);
    writeFile(USERS_FILE, arr);
  }
};

const orders = {
  all:         ()       => readFile(ORDERS_FILE),
  findByUser:  (userId) => readFile(ORDERS_FILE).filter(o => o.userId === userId),
  create: (data) => {
    const arr   = readFile(ORDERS_FILE);
    const order = { id: nextId(arr), ...data, createdAt: new Date().toISOString() };
    arr.push(order);
    writeFile(ORDERS_FILE, arr);
    return order;
  },
  update: (id, data) => {
    const arr = readFile(ORDERS_FILE);
    const idx = arr.findIndex(o => o.id === id);
    if (idx === -1) return null;
    arr[idx] = { ...arr[idx], ...data };
    writeFile(ORDERS_FILE, arr);
    return arr[idx];
  }
};

const contacts = {
  all: () => readFile(CONTACTS_FILE),
  create: (data) => {
    const arr     = readFile(CONTACTS_FILE);
    const contact = { id: nextId(arr), ...data, createdAt: new Date().toISOString(), read: false };
    arr.push(contact);
    writeFile(CONTACTS_FILE, arr);
    return contact;
  },
  markRead: (id) => {
    const arr = readFile(CONTACTS_FILE);
    const idx = arr.findIndex(c => c.id === id);
    if (idx !== -1) { arr[idx].read = true; writeFile(CONTACTS_FILE, arr); }
  }
};

module.exports = { initDB, users, orders, contacts };
