<!-- src/views/StudentDetailView.vue -->
<template>
  <div>
    <!-- Back button -->
    <RouterLink to="/students" class="back-link">← Retour aux étudiants</RouterLink>

    <div v-if="loading" class="loading-state">Chargement...</div>

    <div v-else>
      <!-- Student header -->
      <div class="student-header card">
        <div class="student-avatar" :style="`background:${avatarColor.bg};color:${avatarColor.text}`">
          {{ initials }}
        </div>
        <div class="student-info">
          <div class="student-name">{{ student.name }}</div>
          <div class="student-meta font-mono">
            {{ student.filiere }} · Baccalauréat · Badge : {{ student.badgeUID || 'Non assigné' }}
          </div>
          <div style="margin-top:8px;display:flex;gap:8px">
            <span class="badge" :class="presenceBadge">{{ presenceLabel }}</span>
            <span class="badge" :class="payBadge">{{ payLabel }}</span>
          </div>
        </div>
        <div class="student-actions">
          <button class="btn-secondary" @click="editMode = !editMode">Modifier</button>
          <button class="btn-danger" @click="confirmDelete">Supprimer</button>
        </div>
      </div>

      <div class="detail-grid">
        <!-- Attendance history -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Historique des présences</span>
            <span class="font-mono" style="font-size:11px;color:#888">
              {{ student.presenceRate }}% ce mois
            </span>
          </div>
          <div class="presence-bar-big">
            <div class="presence-fill-big" :style="`width:${student.presenceRate}%`"></div>
          </div>
          <div class="attendance-list">
            <div v-for="a in attendances" :key="a.id" class="attendance-row">
              <span class="att-date font-mono">{{ a.date }}</span>
              <span class="att-course">{{ a.course }}</span>
              <span class="att-time font-mono">{{ a.time }}</span>
              <span class="badge" :class="statusBadge(a.status)">{{ statusLabel(a.status) }}</span>
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div style="display:flex;flex-direction:column;gap:16px">
          <!-- Contact info -->
          <div class="card">
            <div class="card-header"><span class="card-title">Informations</span></div>
            <div class="info-list">
              <div class="info-row">
                <span class="info-key">Email</span>
                <span class="info-val font-mono">{{ student.email }}</span>
              </div>
              <div class="info-row">
                <span class="info-key">Téléphone parent</span>
                <span class="info-val font-mono">{{ student.parentPhone || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-key">Filière</span>
                <span class="info-val">{{ student.filiere }}</span>
              </div>
              <div class="info-row">
                <span class="info-key">Badge NFC</span>
                <span class="info-val font-mono">{{ student.badgeUID || 'Non assigné' }}</span>
              </div>
              <div class="info-row">
                <span class="info-key">Inscrit le</span>
                <span class="info-val font-mono">{{ student.createdAt || '01/09/2025' }}</span>
              </div>
            </div>
          </div>

          <!-- Payments -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">Paiements</span>
              <button class="btn-primary-sm" @click="addPayment">+ Ajouter</button>
            </div>
            <div class="pay-list">
              <div v-for="p in payments" :key="p.id" class="pay-row">
                <div>
                  <div class="pay-month">{{ p.month }}</div>
                  <div class="pay-method font-mono">{{ p.method }}</div>
                </div>
                <div style="text-align:right">
                  <div class="pay-amount font-mono">{{ p.amount }}</div>
                  <span class="badge" :class="p.paid ? 'badge-present' : 'badge-absent'">
                    {{ p.paid ? 'Payé' : 'En attente' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route  = useRoute()
const router = useRouter()
const loading   = ref(false)
const editMode  = ref(false)

// Mock student data — replace with studentStore.fetchStudent(route.params.id)
const student = ref({
  id:           route.params.id,
  name:         'Yassine Benali',
  email:        'y.benali@mail.ma',
  parentPhone:  '+212 6 12 34 56 78',
  filiere:      'Mathématiques',
  badgeUID:     'NFC-084A',
  presenceRate: 92,
  paymentStatus:'paid',
  createdAt:    '01/09/2025',
})

const attendances = ref([
  { id:1, date:'14/03/2026', course:'Mathématiques', time:'14:02', status:'present' },
  { id:2, date:'12/03/2026', course:'Physique',      time:'15:05', status:'present' },
  { id:3, date:'10/03/2026', course:'Mathématiques', time:'14:18', status:'late'    },
  { id:4, date:'07/03/2026', course:'Physique',      time:'—',     status:'absent'  },
  { id:5, date:'05/03/2026', course:'Mathématiques', time:'14:01', status:'present' },
])

const payments = ref([
  { id:1, month:'Mars 2026', method:'CMI',     amount:'450 MAD', paid:true  },
  { id:2, month:'Fév. 2026', method:'CMI',     amount:'450 MAD', paid:true  },
  { id:3, month:'Jan. 2026', method:'Espèces', amount:'450 MAD', paid:true  },
  { id:4, month:'Avr. 2026', method:'—',       amount:'450 MAD', paid:false },
])

const initials    = computed(() => student.value.name.split(' ').map(n=>n[0]).join('').toUpperCase())
const avatarColor = computed(() => {
  const map = { Mathématiques:{bg:'#E1F5EE',text:'#085041'}, PC:{bg:'#E6F1FB',text:'#0C447C'}, SVT:{bg:'#FAEEDA',text:'#633806'} }
  return map[student.value.filiere] || { bg:'#f0f0ee', text:'#555' }
})
const presenceBadge = computed(() => student.value.presenceRate >= 80 ? 'badge-present' : student.value.presenceRate >= 60 ? 'badge-late' : 'badge-absent')
const presenceLabel = computed(() => `Présence: ${student.value.presenceRate}%`)
const payBadge      = computed(() => ({ paid:'badge-present', pending:'badge-late', overdue:'badge-absent' }[student.value.paymentStatus]))
const payLabel      = computed(() => ({ paid:'Paiement à jour', pending:'Paiement en attente', overdue:'Paiement en retard' }[student.value.paymentStatus]))

const statusBadge = (s) => ({ present:'badge-present', late:'badge-late', absent:'badge-absent' }[s] || '')
const statusLabel = (s) => ({ present:'Présent', late:'En retard', absent:'Absent' }[s] || s)

function confirmDelete() {
  if (confirm(`Supprimer ${student.value.name} ?`)) router.push('/students')
}
function addPayment() { alert('Modal paiement — à implémenter') }
</script>

<style scoped>
.back-link { display:inline-flex; align-items:center; gap:6px; font-size:13px; color:#888; text-decoration:none; margin-bottom:16px; }
.back-link:hover { color:#1a1a1a; }
.loading-state { text-align:center; padding:60px; color:#888; }

.card { background:#fff; border:0.5px solid rgba(0,0,0,0.1); border-radius:10px; padding:20px; }
.card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.card-title  { font-size:13px; font-weight:500; }

.student-header { display:flex; align-items:center; gap:20px; margin-bottom:20px; }
.student-avatar { width:60px; height:60px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:600; flex-shrink:0; }
.student-info   { flex:1; }
.student-name   { font-size:20px; font-weight:600; margin-bottom:4px; }
.student-meta   { font-size:12px; color:#888; }
.student-actions{ display:flex; gap:8px; flex-shrink:0; }

.btn-secondary  { padding:8px 14px; border:0.5px solid rgba(0,0,0,0.2); border-radius:8px; font-size:13px; background:none; cursor:pointer; font-family:inherit; }
.btn-danger     { padding:8px 14px; background:#FCEBEB; color:#791F1F; border:0.5px solid #F7C1C1; border-radius:8px; font-size:13px; cursor:pointer; font-family:inherit; }
.btn-primary-sm { padding:5px 12px; background:var(--c-brand); color:#fff; border:none; border-radius:6px; font-size:12px; font-weight:500; cursor:pointer; font-family:inherit; }

.detail-grid { display:grid; grid-template-columns:1fr 320px; gap:20px; }

.presence-bar-big { height:6px; background:#f0f0ee; border-radius:3px; margin-bottom:16px; }
.presence-fill-big{ height:100%; background:var(--c-brand); border-radius:3px; transition:width 1s ease; }

.attendance-list { display:flex; flex-direction:column; gap:6px; }
.attendance-row  { display:flex; align-items:center; gap:12px; padding:8px 10px; background:#fafaf8; border-radius:7px; font-size:13px; }
.att-date  { font-size:11px; color:#888; width:80px; flex-shrink:0; }
.att-course{ flex:1; font-weight:500; }
.att-time  { font-size:11px; color:#aaa; width:50px; text-align:right; flex-shrink:0; }

.info-list { display:flex; flex-direction:column; gap:2px; }
.info-row  { display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:0.5px solid rgba(0,0,0,0.06); }
.info-row:last-child { border-bottom:none; }
.info-key  { font-size:12px; color:#888; }
.info-val  { font-size:12px; font-weight:500; }

.pay-list  { display:flex; flex-direction:column; gap:8px; }
.pay-row   { display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:#fafaf8; border-radius:8px; }
.pay-month { font-size:13px; font-weight:500; }
.pay-method{ font-size:11px; color:#888; margin-top:2px; }
.pay-amount{ font-size:13px; font-weight:600; color:#085041; margin-bottom:4px; }
</style>
