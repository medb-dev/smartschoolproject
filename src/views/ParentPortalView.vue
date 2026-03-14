<!-- src/views/ParentPortalView.vue -->
<template>
  <div>
    <div class="parent-header">
      <div class="parent-avatar">{{ initials }}</div>
      <div>
        <div class="parent-name">{{ student.name }}</div>
        <div class="parent-meta font-mono">{{ student.filiere }} · Année Baccalauréat</div>
      </div>
    </div>

    <div class="parent-grid">
      <!-- Attendance -->
      <div class="card">
        <div class="card-header"><span class="card-title">Présences ce mois</span></div>
        <div class="presence-summary">
          <div class="ps-item ps-green"><div class="ps-val">22</div><div class="ps-label">Présent</div></div>
          <div class="ps-item ps-amber"><div class="ps-val">3</div><div class="ps-label">Retard</div></div>
          <div class="ps-item ps-red"><div class="ps-val">2</div><div class="ps-label">Absent</div></div>
        </div>
      </div>

      <!-- Payments -->
      <div class="card">
        <div class="card-header"><span class="card-title">Paiements</span></div>
        <div class="payment-list">
          <div v-for="p in payments" :key="p.id" class="pay-row">
            <div class="pay-month font-mono">{{ p.month }}</div>
            <div class="pay-amount font-mono">{{ p.amount }}</div>
            <span class="badge" :class="p.paid ? 'badge-present' : 'badge-absent'">
              {{ p.paid ? 'Payé' : 'En attente' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Schedule -->
      <div class="card" style="grid-column:span 2">
        <div class="card-header"><span class="card-title">Programme de la semaine</span></div>
        <div class="schedule-list">
          <div v-for="s in schedule" :key="s.id" class="schedule-row">
            <div class="schedule-day font-mono">{{ s.day }}</div>
            <div class="schedule-info">
              <div class="schedule-subject">{{ s.subject }}</div>
              <div class="schedule-detail font-mono">{{ s.teacher }} · {{ s.time }} · {{ s.room }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const student = ref({ name: 'Yassine Benali', filiere: 'Mathématiques' })
const initials = computed(() => student.value.name.split(' ').map(n=>n[0]).join('').toUpperCase())

const payments = ref([
  { id:1, month:'Mars 2026',  amount:'450 MAD', paid:true  },
  { id:2, month:'Fév. 2026',  amount:'450 MAD', paid:true  },
  { id:3, month:'Jan. 2026',  amount:'450 MAD', paid:true  },
  { id:4, month:'Avr. 2026',  amount:'450 MAD', paid:false },
])

const schedule = ref([
  { id:1, day:'Lun', subject:'Mathématiques', teacher:'Prof. Benali',  time:'14h00–16h00', room:'Salle A' },
  { id:2, day:'Mer', subject:'Physique',      teacher:'Prof. Ouali',   time:'15h00–17h00', room:'Salle B' },
  { id:3, day:'Ven', subject:'Mathématiques', teacher:'Prof. Benali',  time:'14h00–16h00', room:'Salle A' },
  { id:4, day:'Sam', subject:'Chimie',        teacher:'Prof. Zahiri',  time:'10h00–12h00', room:'Salle C' },
])
</script>

<style scoped>
.parent-header { display:flex; align-items:center; gap:16px; margin-bottom:24px; padding:20px; background:#fff; border-radius:10px; border:0.5px solid rgba(0,0,0,0.1); }
.parent-avatar { width:52px; height:52px; border-radius:50%; background:#E1F5EE; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:600; color:#085041; flex-shrink:0; }
.parent-name   { font-size:18px; font-weight:600; }
.parent-meta   { font-size:12px; color:#888; margin-top:3px; }

.parent-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.card { background:#fff; border:0.5px solid rgba(0,0,0,0.1); border-radius:10px; padding:20px; }
.card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.card-title  { font-size:13px; font-weight:500; }

.presence-summary { display:flex; gap:10px; }
.ps-item { flex:1; padding:14px; border-radius:8px; text-align:center; }
.ps-green { background:#E1F5EE; } .ps-amber { background:#FAEEDA; } .ps-red { background:#FCEBEB; }
.ps-val { font-size:28px; font-weight:700; font-family:'IBM Plex Mono',monospace; line-height:1; }
.ps-green .ps-val { color:#085041; } .ps-amber .ps-val { color:#633806; } .ps-red .ps-val { color:#791F1F; }
.ps-label { font-size:11px; color:#888; margin-top:4px; }

.payment-list { display:flex; flex-direction:column; gap:8px; }
.pay-row { display:flex; align-items:center; gap:12px; padding:9px 10px; background:#fafaf8; border-radius:7px; }
.pay-month  { flex:1; font-size:12px; color:#555; }
.pay-amount { font-size:13px; font-weight:500; color:#1a1a1a; }

.schedule-list { display:flex; flex-direction:column; gap:8px; }
.schedule-row { display:flex; align-items:center; gap:16px; padding:10px 12px; background:#fafaf8; border-radius:8px; }
.schedule-day { width:32px; font-size:12px; color:#888; flex-shrink:0; }
.schedule-subject { font-size:13px; font-weight:500; }
.schedule-detail  { font-size:11px; color:#888; margin-top:2px; }
</style>
