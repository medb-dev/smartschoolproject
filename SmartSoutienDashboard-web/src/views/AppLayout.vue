<!-- src/views/AppLayout.vue -->
<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-mark">
          <div class="logo-icon">
            <!-- <svg viewBox="0 0 20 20" fill="white" width="18" height="18">
              <path d="M10 2L3 7v11h5v-5h4v5h5V7z" />
            </svg> -->
            <img src="../assets/logo-icon.png" alt="" srcset="" width="33.99" height="33.99">
          </div>
          <div>
            <div class="logo-name">SmartSoutien</div>
            <div class="logo-sub">smartschoolproject</div>
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">Principal</div>

        <RouterLink to="/dashboard" class="nav-item">
          <IconGrid class="nav-icon" />
          Vue d'ensemble
        </RouterLink>

        <RouterLink to="/attendance" class="nav-item">
          <IconUsers class="nav-icon" />
          Présences
          <span v-if="pendingScans > 0" class="nav-badge">{{
            pendingScans
          }}</span>
        </RouterLink>

        <RouterLink to="/students" class="nav-item">
          <IconBook class="nav-icon" />
          Étudiants
        </RouterLink>

        <RouterLink v-if="authStore.isAdmin" to="/payments" class="nav-item">
          <IconCard class="nav-icon" />
          Paiements
        </RouterLink>

        <div class="nav-section">Embarqué</div>

        <RouterLink v-if="authStore.isAdmin" to="/devices" class="nav-item">
          <IconChip class="nav-icon" />
          Dispositifs NFC
          <span v-if="offlineDevices > 0" class="nav-badge nav-badge--red">{{
            offlineDevices
          }}</span>
        </RouterLink>

        <div class="nav-section">Data & IA</div>

        <RouterLink v-if="authStore.isAdmin" to="/analytics" class="nav-item">
          <IconChart class="nav-icon" />
          Analytique IA
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="admin-card">
          <div class="avatar">{{ authStore.initials }}</div>
          <div class="admin-info">
            <div class="admin-name">{{ authStore.user?.name }}</div>
            <div class="admin-role">{{ roleLabel }}</div>
          </div>
          <button class="logout-btn" @click="logout" title="Déconnexion">
            <IconLogout />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="main">
      <header class="topbar">
        <div class="topbar-title">{{ currentTitle }}</div>
        <div class="topbar-right">
          <div class="live-indicator">
            <span class="live-label font-mono"></span>
            <span class="live-dot"></span>
          </div>
          <div class="topbar-date font-mono">{{ formattedDate }}</div>
        </div>
      </header>

      <div class="content">
        <router-view v-slot="{ Component }">
          <transition name="slide-up" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, h } from "vue"
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useDeviceStore } from "@/stores/deviceStore";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/// ── Inline SVG icons ──────────────────────────────────────────
const IconGrid = {
  render: () =>
    h(
      "svg",
      { width: 16, height: 16, viewBox: "0 0 16 16", fill: "currentColor" },
      [
        h("rect", { x: 1, y: 1, width: 6, height: 6, rx: 1 }),
        h("rect", { x: 9, y: 1, width: 6, height: 6, rx: 1 }),
        h("rect", { x: 1, y: 9, width: 6, height: 6, rx: 1 }),
        h("rect", { x: 9, y: 9, width: 6, height: 6, rx: 1 }),
      ]
    ),
};
const IconUsers = {
  render: () =>
    h(
      "svg",
      { width: 16, height: 16, viewBox: "0 0 16 16", fill: "currentColor" },
      [
        h("circle", { cx: 8, cy: 4, r: 3 }),
        h("path", { d: "M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" }),
      ]
    ),
};
const IconBook = {
  render: () =>
    h(
      "svg",
      { width: 16, height: 16, viewBox: "0 0 16 16", fill: "currentColor" },
      [
        h("path", {
          d: "M8 1L1 4.5l7 3.5 7-3.5L8 1zM1 8l7 3.5L15 8M1 11.5l7 3.5 7-3.5",
        }),
      ]
    ),
};
const IconCard = {
  render: () =>
    h(
      "svg",
      { width: 16, height: 16, viewBox: "0 0 16 16", fill: "currentColor" },
      [
        h("rect", { x: 1, y: 3, width: 14, height: 10, rx: 2 }),
        h("path", { d: "M1 7h14" }),
      ]
    ),
};
const IconChip = {
  render: () =>
    h(
      "svg",
      { width: 16, height: 16, viewBox: "0 0 16 16", fill: "currentColor" },
      [
        h("rect", { x: 4, y: 4, width: 8, height: 8, rx: 1 }),
        h("path", {
          d: "M6 1v3M10 1v3M6 12v3M10 12v3M1 6h3M1 10h3M12 6h3M12 10h3",
        }),
      ]
    ),
};
const IconChart = {
  render: () =>
    h(
      "svg",
      { width: 16, height: 16, viewBox: "0 0 16 16", fill: "currentColor" },
      [h("polyline", { points: "1,12 5,7 9,9 15,3" })]
    ),
};
const IconLogout = {
  render: () =>
    h(
      "svg",
      { width: 14, height: 14, viewBox: "0 0 16 16", fill: "currentColor" },
      [
        h("path", {
          d: "M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 5l4 3-4 3M5 8h9",
        }),
      ]
    ),
};

const authStore = useAuthStore();
const deviceStore = useDeviceStore();
const route = useRoute();
const router = useRouter();

const currentTitle = computed(() => route.meta.title || "SmartSoutien");
const offlineDevices = computed(() => deviceStore.offlineDevices.length);
const pendingScans = computed(() => 3); // from attendanceStore in real impl

const now = ref(new Date())

let interval

onMounted(() => {
  interval = setInterval(() => {
    now.value = new Date() // 🔥 triggers reactivity
  }, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})

const formattedDate = computed(() =>
  format(now.value, "HH:mm:ss EEEE dd MMMM yyyy ", { locale: fr })
)


const roleLabel = computed(() => {
  const map = {
    admin: "Administrateur",
    teacher: "Professeur",
    parent: "Parent",
  };
  return map[authStore.user?.role] || "";
});

async function logout() {
  await authStore.logout();
  router.push("/login");
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

/* ── Sidebar ───────────────────────────────────────────────── */
.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #fff;
  border-right: 0.5px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 20;
}
.sidebar-logo {
  padding: 20px 18px 16px;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
}
.logo-mark {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo-icon {
  width: 34px;
  height: 34px;
  /* background: var(--c-brand); */
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.logo-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--c-brand-dark);
  letter-spacing: -0.3px;
}
.logo-sub {
  font-size: 10px;
  color: #aaa;
  font-family: "IBM Plex Mono", monospace;
  margin-top: 1px;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 0;
  overflow-y: auto;
}
.nav-section {
  padding: 14px 16px 5px;
  font-size: 10px;
  font-family: "IBM Plex Mono", monospace;
  letter-spacing: 1px;
  color: #bbb;
  text-transform: uppercase;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 16px;
  cursor: pointer;
  color: #666;
  font-size: 13.5px;
  border-left: 2px solid transparent;
  text-decoration: none;
  transition: all 0.15s;
  margin: 1px 0;
}
.nav-item:hover {
  background: #f5f5f3;
  color: #1a1a1a;
}
.nav-item.router-link-active {
  background: var(--c-brand-light);
  color: var(--c-brand-dark);
  border-left-color: var(--c-brand);
  font-weight: 500;
}
.nav-icon {
  width: 16px;
  height: 16px;
  opacity: 0.7;
  flex-shrink: 0;
}
.nav-item.router-link-active .nav-icon {
  opacity: 1;
}
.nav-badge {
  margin-left: auto;
  background: var(--c-red);
  color: #fff;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
  font-family: "IBM Plex Mono", monospace;
}
.nav-badge--red {
  background: var(--c-red);
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 0.5px solid rgba(0, 0, 0, 0.08);
}
.admin-card {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--c-brand-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-brand-dark);
  flex-shrink: 0;
}
.admin-info {
  flex: 1;
  min-width: 0;
}
.admin-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.admin-role {
  font-size: 11px;
  color: #888;
}
.logout-btn {
  padding: 6px;
  border: none;
  background: none;
  cursor: pointer;
  color: #aaa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: all 0.15s;
}
.logout-btn:hover {
  background: #fee2e2;
  color: var(--c-red);
}

/* ── Main ─────────────────────────────────────────────────── */
.main {
  margin-left: 240px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 58px;
  background: #fff;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 10;
}
.topbar-title {
  font-size: 15px;
  font-weight: 500;
  flex: 1;
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.live-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}
.live-label {
  font-size: 11px;
  color: #888;
}
.topbar-date {
  font-size: 12px;
  color: #888;
}

.content {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}
</style>
