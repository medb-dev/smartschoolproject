# SmartSoutien — Smart School Project

SmartSoutien est un système intelligent de gestion pour école de soutien scolaire.
Il combine une **application web moderne** avec un **système embarqué (ESP32 + NFC)** pour automatiser la gestion des présences et améliorer le suivi des étudiants, **un module d’intelligence artificielle (Python + FastAPI)** pour automatiser la gestion des présences, analyser les données et améliorer le suivi des étudiants.

---

## 🧠 Fonctionnalités principales

* 📶 Scan NFC des étudiants (ESP32)
* 📊 Suivi des présences en temps réel
* 👨‍🏫 Gestion des cours et sessions
* 💰 Gestion des paiements
* 📡 Synchronisation avec Firebase (Firestore)
* 📈 Tableau de bord analytique

---

## 🔧 Architecture du projet

* **Frontend** : Vue.js 3 + TailwindCSS
* **Backend** : Firebase (Firestore, Auth, Hosting)
* **Embedded System** : ESP32 + module NFC
* **AI Module (optionnel)** : Python (FastAPI)

---

## 🔌 Schéma de câblage ESP32

![ESP32 Wiring Schema](https://github.com/medb-dev/smartschoolproject/tree/main/images/schema.png)

---

## 🧪 Prototype du projet

![Project Prototype](https://github.com/medb-dev/smartschoolproject/tree/main/images/project_prototype.jpeg)

---

## 🚀 Installation (résumé)

```bash
git clone https://github.com/<your-repo>/smartschoolproject.git
cd smartschoolproject
npm install
npm run dev
```

---

## ⚙️ Configuration Firebase

1. Créer un projet sur Firebase
2. Activer :

   * Firestore Database
   * Authentication
3. Ajouter votre configuration dans :

```js
src/firebase/config.js
```

⚠️ **Important :**
Ne jamais publier vos clés API ou tokens dans un dépôt public.

---

## 📁 Structure simplifiée

```
src/
├── firebase/        # Configuration Firebase
├── stores/          # Gestion d'état (Pinia)
├── views/           # Pages principales
├── components/      # Composants UI
├── router/          # Navigation
```

---

## 🔌 ESP32 & NFC

Le module ESP32 :

* lit les badges NFC
* vérifie l'utilisateur
* envoie les données à Firestore

👉 Exemple de flux :

```
Scan NFC → Vérification → Enregistrement présence → Cloud
```

---

## 💰 Paiements (Firestore)

Collection recommandée :

```
payments/
  └── autoId
       ├── studentId
       ├── courseId
       ├── amount
       ├── status
       └── timestamp
```

---

## 🛡️ Sécurité

* Ne pas exposer :

  * clés API
  * tokens Firebase
  * identifiants utilisateurs
* Utiliser des règles Firestore sécurisées en production

---

## 🚢 Déploiement

```bash
npm run build
firebase deploy
```

---

## 📌 Remarques

Ce projet est conçu à des fins éducatives et peut être étendu avec :

* contrôle d’accès intelligent
* blocage si paiement non effectué
* dashboard avancé

---

## 👨‍💻 Auteurs

Projet réalisé dans le cadre de Projet (SmartSoutien — Smart School Project) - Master 1er annee (IISE-IDIA-IL) - un système intelligent embarqué et web.
