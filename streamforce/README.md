# 🚀 StreamForce — Site IPTV Complet

## Structure du projet

```
streamforce/
├── backend/          ← API Node.js + Express
│   ├── server.js     ← Point d'entrée
│   ├── .env          ← Configuration (à modifier)
│   ├── routes/
│   │   ├── auth.js   ← Inscription / Connexion
│   │   ├── orders.js ← Commandes clients
│   │   ├── contact.js← Formulaire contact
│   │   └── admin.js  ← Routes admin
│   ├── middleware/
│   │   └── auth.js   ← Vérification JWT
│   └── db/
│       ├── database.js ← Gestion données JSON
│       └── users.json  ← Créé automatiquement
├── frontend/
│   └── index.html    ← Site vitrine + espace client
└── admin/
    └── index.html    ← Dashboard administrateur
```

---

## ⚡ Démarrage rapide

### 1. Installer Node.js
Téléchargez Node.js sur https://nodejs.org (version 18+)

### 2. Ouvrir un terminal dans le dossier backend
```bash
cd streamforce/backend
```

### 3. Installer les dépendances
```bash
npm install
```

### 4. (Optionnel) Modifier le fichier .env
```
PORT=3000
JWT_SECRET=changez_cette_valeur_en_production
ADMIN_EMAIL=admin@votresite.com
ADMIN_PASSWORD=VotreMotDePasse123!
```

### 5. Lancer le serveur
```bash
node server.js
```

### 6. Accéder au site
- 🌐 Site client : http://localhost:3000
- 🔐 Admin panel : http://localhost:3000/admin-panel

---

## 🔑 Connexion admin par défaut
- **Email** : admin@streamforce.com
- **Mot de passe** : Admin123!

⚠️ Changez ces identifiants dans le fichier `.env` avant de mettre en production !

---

## 📋 Fonctionnalités

### Site Vitrine
- Page d'accueil avec hero, fonctionnalités, chaînes, tarifs, FAQ
- Formulaire de contact intégré
- Design premium dark mode

### Espace Client
- Inscription / Connexion (JWT sécurisé)
- Dashboard personnel avec statut abonnement
- Historique des commandes
- Commande d'abonnement en ligne

### Dashboard Admin
- Statistiques en temps réel (clients, revenus, commandes)
- Gestion des clients (activer plan, suspendre, supprimer)
- Validation des commandes (confirmer = active automatiquement le plan)
- Lecture des messages de contact

---

## 🌍 Mise en ligne (Hébergement)

### Option 1 — Railway (gratuit pour démarrer)
1. Créez un compte sur https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Uploadez vos fichiers ou connectez votre repo GitHub
4. Ajoutez les variables d'environnement dans Settings
5. Votre site est en ligne !

### Option 2 — VPS OVH / Hetzner
```bash
# Sur le serveur Ubuntu
sudo apt install nodejs npm nginx
cd /var/www && git clone votre-repo
cd streamforce/backend && npm install
node server.js &

# Configurez Nginx pour pointer vers localhost:3000
```

### Option 3 — Render.com (gratuit)
1. render.com → "New Web Service"
2. Connectez votre GitHub
3. Build Command: `cd backend && npm install`
4. Start Command: `cd backend && node server.js`

---

## 🔧 Personnalisation

### Changer les prix
Modifiez dans `backend/routes/orders.js` :
```javascript
const PLANS = {
  mensuel: { name: 'Mensuel', price: 9, days: 30 },
  trimestriel: { name: 'Trimestriel', price: 22, days: 90 },
  annuel: { name: 'Annuel', price: 49, days: 365 }
};
```

### Changer le nom du site
Remplacez "StreamForce" dans les fichiers HTML frontend et admin.

### Ajouter les liens WhatsApp / Telegram
Dans `frontend/index.html`, cherchez "WhatsApp" et "Telegram" dans le footer et ajoutez vos liens.

---

## 📞 Support
Ce projet est prêt à l'emploi. Pour ajouter des fonctionnalités (paiement automatique Stripe, emails, etc.), des améliorations sont possibles.
