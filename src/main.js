// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import router from './router'
import './assets/main.css'

// ── i18n (FR / AR) ───────────────────────────────────────────────
import fr from './locales/fr.js'
import ar from './locales/ar.js'

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'fr',
  messages: { fr, ar }
})

// ── App ──────────────────────────────────────────────────────────
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueApexCharts)
app.use(i18n)

app.mount('#app')
