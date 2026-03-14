// src/firebase/config.js
// ─────────────────────────────────────────────────────────────────
//  INSTRUCTIONS :
//  1. Aller sur https://console.firebase.google.com
//  2. Créer un projet "smartschoolproject"
//  3. Activer : Firestore, Authentication, Storage, Hosting
//  4. Projet Settings → "Add app" → Web → copier firebaseConfig
//  5. Remplacer les valeurs ci-dessous par vos propres clés
// ─────────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";
// import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCdLCX4OCOVf-D114hWpDFud6EGvxwSynU",
  authDomain: "smartschoolproject.firebaseapp.com",
  projectId: "smartschoolproject",
  storageBucket: "smartschoolproject.firebasestorage.app",
  messagingSenderId: "849172210399",
  appId: "1:849172210399:web:2e9a40ca540d4b26f0ff6a",
};

// Initialisation FirebaseenableIndexedDbPersistence(db).catch(...)
const app = initializeApp(firebaseConfig);

// Services
// export const db = getFirestore(app);
export const db = initializeFirestore(app, {
  cache: persistentLocalCache(),
});
export const auth = getAuth(app);
export const storage = getStorage(app);

// Persistence hors-ligne (synchronisation ESP32 offline)
// enableIndexedDbPersistence(db).catch((err) => {
//   if (err.code === "failed-precondition") {
//     console.warn("Firebase persistence: plusieurs onglets ouverts");
//   } else if (err.code === "unimplemented") {
//     console.warn("Firebase persistence: navigateur non supporté");
//   }
// });

export default app;
