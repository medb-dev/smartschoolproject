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
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCWBMzL_571sfTQlpTzSLdLXGAzoVJLG0Y",
  authDomain: "smartsoutien.firebaseapp.com",
  databaseURL:
    "https://smartsoutien-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "smartsoutien",
  storageBucket: "smartsoutien.firebasestorage.app",
  messagingSenderId: "652719113956",
  appId: "1:652719113956:web:3a884f5dfb291a16468ef1",
  measurementId: "G-P0NRQ7XTTW",
};

// Initialisation FirebaseenableIndexedDbPersistence(db).catch(...)
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
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
