<!-- src/views/LoginView.vue -->
<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <div class="logo-icon">
          <svg viewBox="0 0 20 20" fill="white" width="24" height="24">
            <path d="M10 2L3 7v11h5v-5h4v5h5V7z"/>
          </svg>
        </div>
        <div>
          <div class="brand-name">SmartSoutien</div>
          <div class="brand-sub font-mono">École de soutien scolaire</div>
        </div>
      </div>

      <h1 class="login-title">Connexion</h1>
      <p class="login-desc">Accédez à votre espace de gestion.</p>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="field">
          <label>Adresse email</label>
          <input
            v-model="email"
            type="email"
            placeholder="admin@smartsoutien.ma"
            required
            autocomplete="email"
          />
        </div>
        <div class="field">
          <label>Mot de passe</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>

        <div v-if="authStore.error" class="error-msg">
          {{ authStore.error }}
        </div>

        <button type="submit" class="login-btn" :disabled="authStore.loading">
          <span v-if="authStore.loading" class="spinner"></span>
          <span v-else>Se connecter</span>
        </button>
      </form>

      <p class="login-hint font-mono">
        admin@test.ma · parent@test.ma · prof@test.ma
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const router    = useRouter()
const email     = ref('')
const password  = ref('')

async function handleLogin() {
  try {
    await authStore.login(email.value, password.value)
    const role = authStore.user?.role
    router.push(role === 'parent' ? '/parent' : '/dashboard')
  } catch {
    // error handled in store
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f5f5f3;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.login-card {
  background: #fff;
  border: 0.5px solid rgba(0,0,0,0.1);
  border-radius: 14px;
  padding: 40px;
  width: 100%; max-width: 400px;
}
.login-logo {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 32px;
}
.logo-icon {
  width: 48px; height: 48px; border-radius: 12px;
  background: var(--c-brand);
  display: flex; align-items: center; justify-content: center;
}
.brand-name { font-size: 18px; font-weight: 600; color: var(--c-brand-dark); }
.brand-sub  { font-size: 11px; color: #aaa; margin-top: 2px; }

.login-title { font-size: 22px; font-weight: 600; margin-bottom: 6px; }
.login-desc  { font-size: 13px; color: #888; margin-bottom: 28px; }

.login-form  { display: flex; flex-direction: column; gap: 16px; }
.field label { display: block; font-size: 12px; font-weight: 500; color: #555; margin-bottom: 6px; }
.field input {
  width: 100%; padding: 10px 12px;
  border: 0.5px solid rgba(0,0,0,0.2);
  border-radius: 8px; font-size: 14px;
  font-family: inherit; outline: none;
  transition: border-color 0.15s;
}
.field input:focus { border-color: var(--c-brand); }

.error-msg {
  padding: 10px 12px; background: #FCEBEB;
  color: #791F1F; border-radius: 8px; font-size: 13px;
}
.login-btn {
  padding: 12px; background: var(--c-brand);
  color: white; border: none; border-radius: 8px;
  font-size: 14px; font-weight: 500; cursor: pointer;
  transition: background 0.15s; display: flex;
  align-items: center; justify-content: center;
}
.login-btn:hover    { background: var(--c-brand-dark); }
.login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.login-hint {
  margin-top: 24px; text-align: center;
  font-size: 11px; color: #bbb;
}
</style>
