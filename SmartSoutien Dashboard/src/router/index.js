// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

// ── Lazy-loaded views ─────────────────────────────────────────────
const LoginView       = () => import('@/views/LoginView.vue')
const DashboardView   = () => import('@/views/DashboardView.vue')
const AttendanceView  = () => import('@/views/AttendanceView.vue')
const StudentsView    = () => import('@/views/StudentsView.vue')
const StudentDetail   = () => import('@/views/StudentDetailView.vue')
const PaymentsView    = () => import('@/views/PaymentsView.vue')
const DevicesView     = () => import('@/views/DevicesView.vue')
const AnalyticsView   = () => import('@/views/AnalyticsView.vue')
const ParentPortal    = () => import('@/views/ParentPortalView.vue')
const NotFound        = () => import('@/views/NotFoundView.vue')
const AppLayout       = () => import('@/views/AppLayout.vue')

const routes = [
  // ── Public ──────────────────────────────────────────────────
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { public: true, title: 'Connexion' }
  },

  // ── App Layout (sidebar + topbar) ────────────────────────────
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: { title: "Vue d'ensemble", roles: ['admin', 'teacher'] }
      },
      {
        path: 'attendance',
        name: 'Attendance',
        component: AttendanceView,
        meta: { title: 'Présences', roles: ['admin', 'teacher'] }
      },
      {
        path: 'students',
        name: 'Students',
        component: StudentsView,
        meta: { title: 'Étudiants', roles: ['admin', 'teacher'] }
      },
      {
        path: 'students/:id',
        name: 'StudentDetail',
        component: StudentDetail,
        meta: { title: 'Fiche étudiant', roles: ['admin', 'teacher'] }
      },
      {
        path: 'payments',
        name: 'Payments',
        component: PaymentsView,
        meta: { title: 'Paiements', roles: ['admin'] }
      },
      {
        path: 'devices',
        name: 'Devices',
        component: DevicesView,
        meta: { title: 'Dispositifs NFC', roles: ['admin'] }
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: AnalyticsView,
        meta: { title: 'Analytique & IA', roles: ['admin'] }
      },
      {
        path: 'parent',
        name: 'ParentPortal',
        component: ParentPortal,
        meta: { title: 'Espace Parent', roles: ['parent'] }
      }
    ]
  },

  // ── 404 ──────────────────────────────────────────────────────
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// ── Auth Guard ────────────────────────────────────────────────────
const getCurrentUser = () => new Promise((resolve) => {
  const unsub = onAuthStateChanged(getAuth(), (user) => {
    unsub()
    resolve(user)
  })
})

router.beforeEach(async (to) => {
  document.title = `${to.meta.title || 'SmartSoutien'} — SmartSoutien`

  if (to.meta.public) return true

  const user = await getCurrentUser()
  if (!user) return { name: 'Login' }

  // Role check (from Firestore via auth store)
  if (to.meta.roles) {
    const { useAuthStore } = await import('@/stores/authStore')
    const authStore = useAuthStore()
    if (!authStore.user) await authStore.fetchUser()
    const role = authStore.user?.role
    if (!to.meta.roles.includes(role)) {
      return role === 'parent' ? { name: 'ParentPortal' } : { name: 'Dashboard' }
    }
  }

  return true
})

export default router
