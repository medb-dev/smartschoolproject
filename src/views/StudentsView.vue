<!-- src/views/StudentsView.vue -->
<template>
  <div>
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="tabs">
        <button
          v-for="f in filieres" :key="f.key"
          class="tab" :class="{ active: activeFiliere === f.key }"
          @click="activeFiliere = f.key"
        >{{ f.label }}</button>
      </div>
      <div class="toolbar-right">
        <input v-model="search" type="text" placeholder="Rechercher..." class="search-input" />
        <button class="btn-primary" @click="showAddModal = true">+ Étudiant</button>
        <button class="btn-secondary" @click="exportCsv">Exporter CSV</button>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Liste des étudiants</span>
        <span class="font-mono" style="font-size:11px;color:#888">{{ filtered.length }} étudiants</span>
      </div>

      <div v-if="loading" class="loading-state">Chargement...</div>

      <table v-else class="students-table">
        <thead>
          <tr>
            <th>Étudiant</th>
            <th>Filière</th>
            <th>Badge NFC</th>
            <th>Présence</th>
            <th>Paiement</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filtered" :key="s.id" class="table-row">
            <td>
              <div class="student-cell">
                <div class="avatar-sm" :style="`background:${avatarColor(s.filiere).bg};color:${avatarColor(s.filiere).text}`">
                  {{ initials(s.name) }}
                </div>
                <div>
                  <div class="student-name">{{ s.name }}</div>
                  <div class="student-email font-mono">{{ s.email }}</div>
                </div>
              </div>
            </td>
            <td><span class="filiere-tag">{{ s.filiere }}</span></td>
            <td><span class="font-mono" style="font-size:11px;color:#888">{{ s.badgeUID || '—' }}</span></td>
            <td>
              <div class="presence-cell">
                <div class="progress-bar">
                  <div class="progress-fill" :style="`width:${s.presenceRate}%`"></div>
                </div>
                <span class="font-mono" style="font-size:11px">{{ s.presenceRate }}%</span>
              </div>
            </td>
            <td>
              <span class="badge" :class="payBadge(s.paymentStatus)">
                {{ payLabel(s.paymentStatus) }}
              </span>
            </td>
            <td>
              <div class="action-btns">
                <RouterLink :to="`/students/${s.id}`" class="action-link">Voir →</RouterLink>
                <button class="action-edit" @click="editStudent(s)">Modifier</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStudentStore } from '@/stores/studentStore'

const studentStore = useStudentStore()
const activeFiliere = ref('all')
const search       = ref('')
const showAddModal = ref(false)
const loading      = ref(false)

const filieres = [
  { key: 'all',  label: 'Tous' },
  { key: 'Math', label: 'Mathématiques' },
  { key: 'PC',   label: 'Physique-Chimie' },
  { key: 'SVT',  label: 'SVT' },
]

// ── Mock students (replace with studentStore.students) ────────
const mockStudents = ref([
  { id:'1', name:'Yassine Benali',  email:'y.benali@mail.ma',  filiere:'Math', badgeUID:'NFC-084A', presenceRate:92, paymentStatus:'paid'    },
  { id:'2', name:'Sara Wahbi',      email:'s.wahbi@mail.ma',   filiere:'PC',   badgeUID:'NFC-021C', presenceRate:88, paymentStatus:'paid'    },
  { id:'3', name:'Karim Ouali',     email:'k.ouali@mail.ma',   filiere:'SVT',  badgeUID:'NFC-103F', presenceRate:71, paymentStatus:'pending' },
  { id:'4', name:'Nadia El Fassi',  email:'n.elfassi@mail.ma', filiere:'Math', badgeUID:'NFC-055B', presenceRate:95, paymentStatus:'paid'    },
  { id:'5', name:'Amine Mounir',    email:'a.mounir@mail.ma',  filiere:'PC',   badgeUID:'NFC-078D', presenceRate:65, paymentStatus:'overdue' },
  { id:'6', name:'Hafsa Zaim',      email:'h.zaim@mail.ma',    filiere:'Math', badgeUID:'NFC-092E', presenceRate:83, paymentStatus:'paid'    },
  { id:'7', name:'Mehdi Rachidi',   email:'m.rachidi@mail.ma', filiere:'SVT',  badgeUID:'NFC-047G', presenceRate:77, paymentStatus:'paid'    },
  { id:'8', name:'Zineb Alaoui',    email:'z.alaoui@mail.ma',  filiere:'PC',   badgeUID:'NFC-066H', presenceRate:91, paymentStatus:'pending' },
])

const filtered = computed(() => {
  return mockStudents.value.filter(s => {
    const matchFiliere = activeFiliere.value === 'all' || s.filiere === activeFiliere.value
    const matchSearch  = !search.value || s.name.toLowerCase().includes(search.value.toLowerCase())
    return matchFiliere && matchSearch
  })
})

const initials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)

const avatarColors = {
  Math: { bg:'#E1F5EE', text:'#085041' },
  PC:   { bg:'#E6F1FB', text:'#0C447C' },
  SVT:  { bg:'#FAEEDA', text:'#633806' },
}
const avatarColor = (f) => avatarColors[f] || { bg:'#f0f0ee', text:'#555' }

const payBadge = (s) => ({ paid:'badge-present', pending:'badge-late', overdue:'badge-absent' }[s] || '')
const payLabel = (s) => ({ paid:'Payé', pending:'En attente', overdue:'Retard' }[s] || s)

function editStudent(s) { /* open modal */ }

function exportCsv() {
  const rows = [['Nom','Filière','Badge','Présence','Paiement']]
  filtered.value.forEach(s => rows.push([s.name, s.filiere, s.badgeUID, s.presenceRate+'%', payLabel(s.paymentStatus)]))
  const csv = rows.map(r => r.join(',')).join('\n')
  const a = document.createElement('a')
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
  a.download = 'etudiants.csv'
  a.click()
}
</script>

<style scoped>
.toolbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; gap:12px; flex-wrap:wrap; }
.toolbar-right { display:flex; align-items:center; gap:10px; }
.tabs { display:flex; gap:2px; background:#f0f0ee; padding:3px; border-radius:8px; }
.tab { padding:7px 14px; border-radius:6px; font-size:13px; cursor:pointer; border:none; background:none; color:#888; font-family:inherit; transition:all 0.15s; }
.tab.active { background:#fff; color:#1a1a1a; font-weight:500; box-shadow:0 1px 3px rgba(0,0,0,0.08); }
.search-input { padding:8px 12px; border:0.5px solid rgba(0,0,0,0.2); border-radius:8px; font-size:13px; font-family:inherit; outline:none; width:200px; }
.search-input:focus { border-color:var(--c-brand); }
.btn-primary { padding:8px 16px; background:var(--c-brand); color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; font-family:inherit; }
.btn-primary:hover { background:var(--c-brand-dark); }
.btn-secondary { padding:8px 14px; border:0.5px solid rgba(0,0,0,0.2); border-radius:8px; font-size:13px; background:none; cursor:pointer; font-family:inherit; }
.btn-secondary:hover { background:#f5f5f3; }

.card { background:#fff; border:0.5px solid rgba(0,0,0,0.1); border-radius:10px; padding:20px; }
.card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.card-title { font-size:13px; font-weight:500; }
.loading-state { text-align:center; padding:40px; color:#888; }

.students-table { width:100%; border-collapse:collapse; }
.students-table th { font-size:11px; font-family:'IBM Plex Mono',monospace; color:#888; text-align:left; padding:8px 12px; border-bottom:0.5px solid rgba(0,0,0,0.08); font-weight:500; letter-spacing:0.3px; text-transform:uppercase; }
.students-table td { padding:11px 12px; border-bottom:0.5px solid rgba(0,0,0,0.06); }
.table-row:last-child td { border-bottom:none; }
.table-row:hover td { background:#fafaf8; }

.student-cell { display:flex; align-items:center; gap:10px; }
.avatar-sm { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; flex-shrink:0; }
.student-name  { font-size:13px; font-weight:500; }
.student-email { font-size:11px; color:#888; margin-top:1px; }
.filiere-tag { font-size:11px; padding:2px 8px; background:#f0f0ee; border-radius:10px; color:#555; }

.presence-cell { display:flex; align-items:center; gap:8px; }
.progress-bar { height:4px; background:#f0f0ee; border-radius:2px; width:70px; }
.progress-fill { height:100%; background:var(--c-brand); border-radius:2px; }

.action-btns { display:flex; align-items:center; gap:10px; }
.action-link { font-size:12px; color:var(--c-accent); text-decoration:none; }
.action-edit { font-size:12px; color:#888; background:none; border:none; cursor:pointer; font-family:inherit; }
.action-edit:hover { color:#1a1a1a; }
</style>
