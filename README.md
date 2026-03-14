# SmartSoutien — smartschoolproject

Système de gestion intelligente pour école de soutien scolaire (niveau Bac).
Intégration **Vue.js 3 + Firebase + ESP32 NFC + IA Python**.

---

## 🚀 Installation en 5 étapes

### Étape 1 — Cloner et installer les dépendances

```bash
# Cloner le projet
git clone https://github.com/votre-org/smartschoolproject.git
cd smartschoolproject

# Installer les dépendances
npm install
```

### Étape 2 — Créer le projet Firebase

1. Aller sur [https://console.firebase.google.com](https://console.firebase.google.com)
2. Cliquer **"Add project"** → Nom : `smartschoolproject`
3. Activer les services suivants :
   - **Firestore Database** → Mode Test (pour commencer)
   - **Authentication** → Email/Password
   - **Storage**
   - **Hosting**
4. **Project Settings** → **"Add app"** → Web (icône `</>`)
5. Copier la config Firebase

### Étape 3 — Configurer Firebase dans le projet

Ouvrir `src/firebase/config.js` et remplacer les valeurs :

```javascript
const firebaseConfig = {
  apiKey:            "VOTRE_API_KEY",        // ← coller ici
  authDomain:        "smartschoolproject.firebaseapp.com",
  projectId:         "smartschoolproject",
  storageBucket:     "smartschoolproject.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",      // ← coller ici
  appId:             "VOTRE_APP_ID"          // ← coller ici
}
```

### Étape 4 — Créer les premiers utilisateurs Firebase

Dans Firebase Console → **Authentication** → **Add user** :

| Email               | Mot de passe | Rôle    |
|---------------------|-------------|---------|
| admin@soutien.ma    | Admin123!   | admin   |
| prof@soutien.ma     | Prof123!    | teacher |
| parent@soutien.ma   | Parent123!  | parent  |

Ensuite dans **Firestore** → créer la collection `users` :

```
users/
  {uid_admin}/
    name: "Mohammed Alami"
    email: "admin@soutien.ma"
    role: "admin"
  
  {uid_prof}/
    name: "Prof. Benali"
    email: "prof@soutien.ma"
    role: "teacher"
  
  {uid_parent}/
    name: "Hassan Benali"
    email: "parent@soutien.ma"
    role: "parent"
```

### Étape 5 — Lancer le projet

```bash
npm run dev
# → http://localhost:3000
```

---

## 📁 Structure du projet

```
smartschoolproject/
├── src/
│   ├── firebase/
│   │   ├── config.js          ← Configuration Firebase (à compléter)
│   │   └── collections.js     ← Références Firestore centralisées
│   │
│   ├── stores/                ← Pinia stores (état global)
│   │   ├── authStore.js       ← Authentification + rôles
│   │   ├── studentStore.js    ← CRUD étudiants + paiements
│   │   ├── attendanceStore.js ← Présences temps réel
│   │   └── deviceStore.js     ← Monitoring ESP32
│   │
│   ├── views/                 ← Pages principales
│   │   ├── AppLayout.vue      ← Sidebar + Topbar
│   │   ├── LoginView.vue      ← Connexion
│   │   ├── DashboardView.vue  ← Vue d'ensemble
│   │   ├── AttendanceView.vue ← Présences NFC
│   │   ├── StudentsView.vue   ← Liste étudiants
│   │   ├── PaymentsView.vue   ← Paiements + Factures
│   │   ├── DevicesView.vue    ← ESP32 monitoring
│   │   ├── AnalyticsView.vue  ← IA + Rapports
│   │   └── ParentPortalView.vue ← Espace parent
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── StatCard.vue
│   │   │   ├── PresenceWeekChart.vue
│   │   │   └── RevenueSparkline.vue
│   │   └── attendance/
│   │       └── AttendanceLiveList.vue
│   │
│   ├── router/index.js        ← Routes + Auth Guards
│   ├── composables/
│   │   └── useFirestore.js    ← Composables réactifs Firestore
│   ├── locales/
│   │   ├── fr.js              ← Français
│   │   └── ar.js              ← Arabe
│   ├── assets/main.css        ← Styles globaux + Tailwind
│   ├── App.vue
│   └── main.js
│
├── firestore.rules             ← Règles de sécurité Firestore
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 🔌 Intégration ESP32

Le firmware ESP32 (dossier `embedded/`) envoie les scans NFC directement à Firestore via HTTPS.

**Collection cible :** `badges/{UID}` → vérifie l'étudiant → enregistre dans `attendances/`

Voir le code complet dans `embedded/src/main.cpp`

---

## 🤖 Module IA (Python)

Le module analytique (`ml/`) expose une API FastAPI :

```bash
cd ml
pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000/predict
```

---

## 🚢 Déploiement Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
# → https://smartschoolproject.web.app
```

---

## 🛠 Scripts disponibles

```bash
npm run dev      # Serveur de développement (port 3000)
npm run build    # Build de production
npm run preview  # Prévisualiser le build
npm run lint     # Linter ESLint
```

---

## 👥 Équipe

| Membre | Filière | Module |
|--------|---------|--------|
| Étudiant 1 | Ingénierie Logicielle | Vue.js + Firebase |
| Étudiant 2 | Systèmes Embarqués | ESP32 + NFC |
| Étudiant 3 | Data & IA | Python + ML |
