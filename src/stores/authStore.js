// src/stores/authStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getDoc } from "firebase/firestore";
import { auth } from "@/firebase/config";
import { userDoc } from "@/firebase/collections";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const loading = ref(true);
  const error = ref(null);

  const isAdmin = computed(() => user.value?.role === "admin");
  const isTeacher = computed(() => user.value?.role === "teacher");
  const isParent = computed(() => user.value?.role === "parent");
  const isLoggedIn = computed(() => !!user.value);
  const initials = computed(() => {
    if (!user.value?.name) return "?";
    return user.value.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  });

  async function login(email, password) {
    error.value = null;
    loading.value = true;
    try {
      const { user: fbUser } = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      await fetchUser(fbUser.uid);
    } catch (e) {
      error.value = mapAuthError(e.code);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchUser(uid = null) {
    const id = uid || auth.currentUser?.uid;
    if (!id) return;
    try {
      const snap = await getDoc(userDoc(id));
      if (snap.exists()) {
        user.value = { uid: id, ...snap.data() };
      } else {
        console.warn(
          "users/" + id + " introuvable dans Firestore, fallback Auth"
        );
        user.value = buildFallbackUser(id);
      }
    } catch (e) {
      // Firestore bloqué (AdBlock) ou hors ligne → on laisse quand même entrer
      console.warn("Firestore indisponible:", e.message);
      user.value = buildFallbackUser(id);
    }
  }

  function buildFallbackUser(uid) {
    const email = auth.currentUser?.email || "";
    let role = "admin";
    if (email.startsWith("prof") || email.startsWith("teacher"))
      role = "teacher";
    if (email.startsWith("parent")) role = "parent";
    return { uid, email, role, name: email.split("@")[0] || "Utilisateur" };
  }

  async function logout() {
    await signOut(auth);
    user.value = null;
  }

  function init() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          await fetchUser(fbUser.uid);
        } else {
          user.value = null;
        }
        loading.value = false;
        resolve();
      });
    });
  }

  function mapAuthError(code) {
    const map = {
      "auth/user-not-found": "Adresse email introuvable.",
      "auth/wrong-password": "Mot de passe incorrect.",
      "auth/invalid-credential": "Email ou mot de passe incorrect.",
      "auth/too-many-requests": "Trop de tentatives. Réessayez plus tard.",
      "auth/network-request-failed": "Erreur réseau. Vérifiez votre connexion.",
    };
    return map[code] || "Erreur de connexion. (" + code + ")";
  }

  return {
    user,
    loading,
    error,
    isAdmin,
    isTeacher,
    isParent,
    isLoggedIn,
    initials,
    login,
    fetchUser,
    logout,
    init,
  };
});
