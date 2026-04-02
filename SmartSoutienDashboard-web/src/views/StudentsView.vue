<!-- src/views/StudentsView.vue -->
<template>
  <div>
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="tabs">
        <button v-for="f in filieres" :key="f.key"
          class="tab" :class="{ active: activeFiliere === f.key }"
          @click="activeFiliere = f.key">
          {{ f.label }}
          <span class="tab-count">{{ countByFiliere(f.key) }}</span>
        </button>
      </div>
      <div class="toolbar-right">
        <div class="search-wrap">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#aaa">
            <circle cx="6.5" cy="6.5" r="5"/><path d="M11 11l3 3"/>
          </svg>
          <input v-model="search" type="text" placeholder="Rechercher un étudiant..." class="search-input" />
          <button v-if="search" class="search-clear" @click="search = ''">×</button>
        </div>
        <button class="btn-primary" @click="openAddModal">+ Étudiant</button>
        <button class="btn-secondary" @click="exportCsv">↓ CSV</button>
      </div>
    </div>

    <!-- Stats rapides -->
    <div class="quick-stats">
      <div class="qs-item">
        <div class="qs-val">{{ filtered.length }}</div>
        <div class="qs-label">Total</div>
      </div>
      <div class="qs-item qs-green">
        <div class="qs-val">{{ filtered.filter(s => s.paymentStatus === 'paid').length }}</div>
        <div class="qs-label">Payés</div>
      </div>
      <div class="qs-item qs-amber">
        <div class="qs-val">{{ filtered.filter(s => s.paymentStatus === 'pending').length }}</div>
        <div class="qs-label">En attente</div>
      </div>
      <div class="qs-item qs-red">
        <div class="qs-val">{{ filtered.filter(s => s.paymentStatus === 'overdue').length }}</div>
        <div class="qs-label">Retard</div>
      </div>
      <div class="qs-item qs-blue">
        <div class="qs-val">{{ avgPresence }}%</div>
        <div class="qs-label">Présence moy.</div>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Liste des étudiants</span>
        <div style="display:flex;align-items:center;gap:10px">
          <div style="display:flex;align-items:center;gap:5px">
            <span class="live-dot" :class="{ 'dot-offline': !studentStore.isLive }"></span>
            <span class="font-mono" style="font-size:11px;color:#888">
              {{ studentStore.isLive ? 'Firestore Live' : 'Chargement...' }}
            </span>
          </div>
          <span class="font-mono" style="font-size:11px;color:#888">{{ filtered.length }} résultats</span>
        </div>
      </div>

      <div v-if="studentStore.loading" class="loading-state">
        <div class="spinner"></div>
        Connexion Firestore...
      </div>

      <div v-else-if="filtered.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </div>
        <div>Aucun étudiant trouvé pour "{{ search }}"</div>
        <button class="btn-link" @click="search = ''">Effacer la recherche</button>
      </div>

      <table v-else class="students-table">
        <thead>
          <tr>
            <th @click="sortBy('name')" class="sortable">
              Étudiant <span class="sort-icon">{{ sortKey === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th>Filière</th>
            <th>Badge NFC</th>
            <th @click="sortBy('presenceRate')" class="sortable">
              Présence <span class="sort-icon">{{ sortKey === 'presenceRate' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th @click="sortBy('paymentStatus')" class="sortable">
              Paiement <span class="sort-icon">{{ sortKey === 'paymentStatus' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in sortedFiltered" :key="s.id" class="table-row">
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
            <td><span class="filiere-tag" :class="`ft-${s.filiere}`">{{ s.filiere }}</span></td>
            <td>
              <span class="font-mono badge-uid" :class="s.badgeUID ? 'uid-active' : 'uid-none'">
                {{ s.badgeUID || 'Non assigné' }}
              </span>
            </td>
            <td>
              <div class="presence-cell">
                <div class="progress-bar">
                  <div class="progress-fill"
                    :style="`width:${s.presenceRate || 0}%;background:${presenceColor(s.presenceRate)}`">
                  </div>
                </div>
                <span class="font-mono" style="font-size:11px;min-width:30px">{{ s.presenceRate || 0 }}%</span>
              </div>
            </td>
            <td>
              <span class="badge" :class="payBadge(s.paymentStatus)">
                {{ payLabel(s.paymentStatus) }}
              </span>
            </td>
            <td>
              <div class="action-btns">
                <RouterLink :to="`/students/${s.id}`" class="action-btn action-view">Voir</RouterLink>
                <button class="action-btn action-edit" @click="openEditModal(s)">Modifier</button>
                <button class="action-btn action-delete" @click="confirmDelete(s)">Supprimer</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── MODAL Ajouter / Modifier ── -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">{{ editingStudent ? 'Modifier étudiant' : 'Nouvel étudiant' }}</span>
          <button class="modal-close" @click="closeModal">×</button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <div class="field">
              <label>Nom complet *</label>
              <input v-model="form.name" type="text" placeholder="Yassine Benali" :class="{ error: errors.name }" />
              <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
            </div>
            <div class="field">
              <label>Email *</label>
              <input v-model="form.email" type="email" placeholder="y.benali@mail.ma" :class="{ error: errors.email }" />
              <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
            </div>
            <div class="field">
              <label>Filière *</label>
              <select v-model="form.filiere" :class="{ error: errors.filiere }">
                <option value="">Choisir...</option>
                <option value="Math">Mathématiques</option>
                <option value="PC">Physique-Chimie</option>
                <option value="SVT">SVT</option>
              </select>
              <span v-if="errors.filiere" class="field-error">{{ errors.filiere }}</span>
            </div>
            <div class="field">
              <label>Téléphone parent</label>
              <input v-model="form.parentPhone" type="tel" placeholder="+212 6 XX XX XX XX" />
            </div>
            <div class="field">
              <label>Badge NFC (UID)</label>
              <input v-model="form.badgeUID" type="text" placeholder="AA:BB:CC:DD" class="font-mono" />
            </div>
            <div class="field">
              <label>Statut paiement</label>
              <select v-model="form.paymentStatus">
                <option value="paid">Payé</option>
                <option value="pending">En attente</option>
                <option value="overdue">Retard</option>
              </select>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">Annuler</button>
          <button class="btn-primary" @click="saveStudent" :disabled="saving">
            <span v-if="saving" class="spinner-sm"></span>
            {{ saving ? 'Enregistrement...' : (editingStudent ? 'Modifier' : 'Ajouter') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── MODAL Confirmation suppression ── -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <span class="modal-title">Confirmer la suppression</span>
          <button class="modal-close" @click="showDeleteModal = false">×</button>
        </div>
        <div class="modal-body">
          <p style="font-size:14px;color:var(--color-text-secondary)">
            Supprimer <strong>{{ deletingStudent?.name }}</strong> ? Cette action est irréversible.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDeleteModal = false">Annuler</button>
          <button class="btn-danger" @click="deleteStudent" :disabled="saving">
            {{ saving ? 'Suppression...' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStudentStore } from '@/stores/studentStore'

const studentStore  = useStudentStore()

// ── State ─────────────────────────────────────────────────────
const activeFiliere = ref('all')
const search        = ref('')
const sortKey       = ref('name')
const sortDir       = ref('asc')
const showModal     = ref(false)
const showDeleteModal = ref(false)
const editingStudent  = ref(null)
const deletingStudent = ref(null)
const saving          = ref(false)

const form = ref({ name:'', email:'', filiere:'', parentPhone:'', badgeUID:'', paymentStatus:'paid' })
const errors = ref({})

const filieres = [
  { key:'all',  label:'Tous'  },
  { key:'Math', label:'Math'  },
  { key:'PC',   label:'PC'    },
  { key:'SVT',  label:'SVT'   },
]

// ── Computed ──────────────────────────────────────────────────
const filtered = computed(() => {
  return studentStore.students.filter(s => {
    const matchF = activeFiliere.value === 'all' || s.filiere === activeFiliere.value
    const matchS = !search.value ||
      s.name.toLowerCase().includes(search.value.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.value.toLowerCase()) ||
      s.badgeUID?.toLowerCase().includes(search.value.toLowerCase())
    return matchF && matchS
  })
})

const sortedFiltered = computed(() => {
  return [...filtered.value].sort((a, b) => {
    let va = a[sortKey.value] ?? ''
    let vb = b[sortKey.value] ?? ''
    if (typeof va === 'string') va = va.toLowerCase()
    if (typeof vb === 'string') vb = vb.toLowerCase()
    return sortDir.value === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
  })
})

const avgPresence = computed(() => {
  if (!filtered.value.length) return 0
  return Math.round(filtered.value.reduce((s, st) => s + (st.presenceRate || 0), 0) / filtered.value.length)
})

const countByFiliere = (f) => {
  if (f === 'all') return studentStore.students.length
  return studentStore.students.filter(s => s.filiere === f).length
}

// ── Helpers ───────────────────────────────────────────────────
const initials     = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
const avatarColors = { Math:{bg:'#E1F5EE',text:'#085041'}, PC:{bg:'#E6F1FB',text:'#0C447C'}, SVT:{bg:'#FAEEDA',text:'#633806'} }
const avatarColor  = (f) => avatarColors[f] || { bg:'#f0f0ee', text:'#555' }
const payBadge     = (s) => ({ paid:'badge-present', pending:'badge-late', overdue:'badge-absent' }[s] || '')
const payLabel     = (s) => ({ paid:'Payé', pending:'En attente', overdue:'Retard' }[s] || s)
const presenceColor = (r) => r >= 80 ? '#1D9E75' : r >= 60 ? '#EF9F27' : '#E24B4A'

function sortBy(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

// ── Modal Add/Edit ────────────────────────────────────────────
function openAddModal() {
  editingStudent.value = null
  form.value = { name:'', email:'', filiere:'', parentPhone:'', badgeUID:'', paymentStatus:'paid' }
  errors.value = {}
  showModal.value = true
}

function openEditModal(s) {
  editingStudent.value = s
  form.value = { name: s.name, email: s.email, filiere: s.filiere,
    parentPhone: s.parentPhone || '', badgeUID: s.badgeUID || '',
    paymentStatus: s.paymentStatus || 'paid' }
  errors.value = {}
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingStudent.value = null
}

function validate() {
  errors.value = {}
  if (!form.value.name.trim())   errors.value.name   = 'Le nom est requis'
  if (!form.value.email.trim())  errors.value.email  = "L'email est requis"
  if (!form.value.filiere)       errors.value.filiere = 'La filière est requise'
  return Object.keys(errors.value).length === 0
}

async function saveStudent() {
  if (!validate()) return
  saving.value = true
  try {
    if (editingStudent.value) {
      await studentStore.updateStudent(editingStudent.value.id, form.value)
    } else {
      await studentStore.createStudent({ ...form.value, presenceRate: 0, isActive: true })
    }
    closeModal()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

// ── Delete ────────────────────────────────────────────────────
function confirmDelete(s) {
  deletingStudent.value = s
  showDeleteModal.value = true
}

async function deleteStudent() {
  if (!deletingStudent.value) return
  saving.value = true
  try {
    await studentStore.deleteStudent(deletingStudent.value.id)
    showDeleteModal.value = false
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

// ── Export CSV ────────────────────────────────────────────────
function exportCsv() {
  const rows = [['Nom','Email','Filière','Badge','Présence','Paiement']]
  sortedFiltered.value.forEach(s => rows.push([
    s.name, s.email || '', s.filiere, s.badgeUID || '—',
    (s.presenceRate || 0) + '%', payLabel(s.paymentStatus)
  ]))
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv)
  a.download = `etudiants_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
}

onMounted(() => studentStore.listenStudents())
onUnmounted(() => studentStore.stopListening())
</script>

<style scoped>
.toolbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; gap:12px; flex-wrap:wrap; }
.toolbar-right { display:flex; align-items:center; gap:10px; }

.tabs { display:flex; gap:2px; background:#f0f0ee; padding:3px; border-radius:8px; }
.tab { padding:6px 12px; border-radius:6px; font-size:13px; cursor:pointer; border:none; background:none; color:#888; font-family:inherit; transition:all 0.15s; display:flex; align-items:center; gap:5px; }
.tab.active { background:#fff; color:#1a1a1a; font-weight:500; box-shadow:0 1px 3px rgba(0,0,0,0.08); }
.tab-count { font-size:10px; background:rgba(0,0,0,0.08); padding:1px 5px; border-radius:8px; font-family:'IBM Plex Mono',monospace; }
.tab.active .tab-count { background:var(--c-brand-light); color:var(--c-brand-dark); }

.search-wrap { position:relative; }
.search-input { padding:8px 30px 8px 32px; border:0.5px solid rgba(0,0,0,0.2); border-radius:8px; font-size:13px; font-family:inherit; outline:none; width:220px; }
.search-input:focus { border-color:var(--c-brand); }
.search-clear { position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; color:#aaa; cursor:pointer; font-size:16px; line-height:1; padding:0; }

.btn-primary   { padding:8px 16px; background:var(--c-brand); color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; font-family:inherit; display:flex; align-items:center; gap:6px; }
.btn-primary:hover { background:var(--c-brand-dark); }
.btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
.btn-secondary { padding:8px 14px; border:0.5px solid rgba(0,0,0,0.2); border-radius:8px; font-size:13px; background:none; cursor:pointer; font-family:inherit; }
.btn-secondary:hover { background:#f5f5f3; }
.btn-danger    { padding:8px 16px; background:#E24B4A; color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; font-family:inherit; }
.btn-danger:hover { background:#A32D2D; }
.btn-link      { background:none; border:none; color:var(--c-accent); font-size:13px; cursor:pointer; font-family:inherit; margin-top:8px; }

.quick-stats { display:flex; gap:10px; margin-bottom:16px; }
.qs-item     { flex:1; padding:12px 14px; background:#fff; border:0.5px solid rgba(0,0,0,0.08); border-radius:8px; }
.qs-green    { background:#E1F5EE; border-color:#9FE1CB; }
.qs-amber    { background:#FAEEDA; border-color:#FAC775; }
.qs-red      { background:#FCEBEB; border-color:#F7C1C1; }
.qs-blue     { background:#E6F1FB; border-color:#B5D4F4; }
.qs-val      { font-size:20px; font-weight:600; font-family:'IBM Plex Mono',monospace; line-height:1; }
.qs-green .qs-val { color:#085041; } .qs-amber .qs-val { color:#633806; }
.qs-red .qs-val   { color:#791F1F; } .qs-blue .qs-val  { color:#0C447C; }
.qs-label    { font-size:11px; color:#888; margin-top:3px; }

.card { background:#fff; border:0.5px solid rgba(0,0,0,0.1); border-radius:10px; padding:20px; }
.card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.card-title  { font-size:13px; font-weight:500; }

.loading-state { display:flex; align-items:center; justify-content:center; gap:10px; padding:48px; color:#aaa; font-size:13px; }
.empty-state   { display:flex; flex-direction:column; align-items:center; padding:48px; color:#bbb; gap:8px; font-size:13px; }
.empty-icon    { width:48px; height:48px; background:#f5f5f3; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:4px; }

.students-table { width:100%; border-collapse:collapse; }
.students-table th { font-size:11px; font-family:'IBM Plex Mono',monospace; color:#888; text-align:left; padding:8px 12px; border-bottom:0.5px solid rgba(0,0,0,0.08); font-weight:500; text-transform:uppercase; letter-spacing:0.3px; }
.sortable { cursor:pointer; user-select:none; }
.sortable:hover { color:#1a1a1a; }
.sort-icon { font-size:10px; }
.students-table td { padding:11px 12px; border-bottom:0.5px solid rgba(0,0,0,0.06); font-size:13px; }
.table-row:last-child td { border-bottom:none; }
.table-row:hover td { background:#fafaf8; }

.student-cell  { display:flex; align-items:center; gap:10px; }
.avatar-sm     { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; flex-shrink:0; }
.student-name  { font-size:13px; font-weight:500; }
.student-email { font-size:11px; color:#888; margin-top:1px; }

.filiere-tag   { font-size:11px; padding:2px 8px; border-radius:10px; }
.ft-Math { background:#E1F5EE; color:#085041; }
.ft-PC   { background:#E6F1FB; color:#0C447C; }
.ft-SVT  { background:#FAEEDA; color:#633806; }

.badge-uid  { font-size:11px; padding:2px 7px; border-radius:6px; }
.uid-active { background:#f0f0ee; color:#555; }
.uid-none   { background:#fff; color:#bbb; border:0.5px dashed rgba(0,0,0,0.15); }

.presence-cell { display:flex; align-items:center; gap:8px; }
.progress-bar  { height:4px; background:#f0f0ee; border-radius:2px; width:70px; }
.progress-fill { height:100%; border-radius:2px; transition:width 0.8s ease; }

.action-btns { display:flex; align-items:center; gap:6px; }
.action-btn  { font-size:11px; padding:4px 10px; border-radius:6px; cursor:pointer; border:0.5px solid; font-family:inherit; transition:all 0.15s; }
.action-view   { color:var(--c-accent); border-color:rgba(55,138,221,0.3); background:#E6F1FB; text-decoration:none; display:inline-flex; align-items:center; }
.action-view:hover   { background:#B5D4F4; }
.action-edit   { color:#633806; border-color:rgba(239,159,39,0.3); background:#FAEEDA; }
.action-edit:hover   { background:#FAC775; }
.action-delete { color:#791F1F; border-color:rgba(226,75,74,0.3); background:#FCEBEB; }
.action-delete:hover { background:#F7C1C1; }

.dot-offline { background:#E24B4A !important; animation:none !important; }

/* ── Modal ── */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:100; padding:20px; }
.modal { background:#fff; border-radius:12px; width:100%; max-width:560px; overflow:hidden; }
.modal-sm { max-width:400px; }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 16px; border-bottom:0.5px solid rgba(0,0,0,0.08); }
.modal-title { font-size:15px; font-weight:500; }
.modal-close { background:none; border:none; font-size:20px; color:#aaa; cursor:pointer; padding:0; line-height:1; }
.modal-close:hover { color:#1a1a1a; }
.modal-body   { padding:20px 24px; }
.modal-footer { display:flex; justify-content:flex-end; gap:10px; padding:16px 24px; border-top:0.5px solid rgba(0,0,0,0.08); background:#fafaf8; }

.form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.field label { display:block; font-size:12px; font-weight:500; color:#555; margin-bottom:6px; }
.field input, .field select {
  width:100%; padding:9px 12px; border:0.5px solid rgba(0,0,0,0.2);
  border-radius:8px; font-size:13px; font-family:inherit; outline:none;
  background:#fff; transition:border-color 0.15s;
}
.field input:focus, .field select:focus { border-color:var(--c-brand); }
.field input.error, .field select.error { border-color:var(--c-red); }
.field-error { font-size:11px; color:#E24B4A; margin-top:4px; display:block; }

.spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:white; border-radius:50%; animation:spin 0.7s linear infinite; }
.spinner-sm { width:12px; height:12px; border:2px solid rgba(255,255,255,0.3); border-top-color:white; border-radius:50%; animation:spin 0.7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
</style>
