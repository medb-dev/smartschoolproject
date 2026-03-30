<!-- src/views/AttendanceView.vue -->
<template>
  <div>
    <div class="tabs">
      <button v-for="tab in tabs" :key="tab.key"
        class="tab" :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key">{{ tab.label }}</button>
    </div>

    <!-- Live stats -->
    <div class="stats-row">
      <div class="stat-mini stat-green">
        <div class="stat-mini-val">{{ attendanceStore.presentCount }}</div>
        <div class="stat-mini-label">Présents</div>
      </div>
      <div class="stat-mini stat-amber">
        <div class="stat-mini-val">{{ attendanceStore.lateCount }}</div>
        <div class="stat-mini-label">En retard</div>
      </div>
      <div class="stat-mini stat-red">
        <div class="stat-mini-val">{{ attendanceStore.absentCount }}</div>
        <div class="stat-mini-label">Absents</div>
      </div>
      <div class="stat-mini stat-blue">
        <div class="stat-mini-val">{{ attendanceStore.presenceRate }}%</div>
        <div class="stat-mini-label">Taux présence</div>
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Contrôle NFC — Temps réel</span>
          <div style="display:flex;align-items:center;gap:6px">
            <span class="live-dot" :class="{ 'dot-offline': !attendanceStore.isLive }"></span>
            <span class="font-mono" style="font-size:11px;color:#888">
              {{ attendanceStore.isLive ? 'ESP32 connecté' : 'En attente...' }}
            </span>
          </div>
        </div>

        <div v-if="attendanceStore.loading" class="loading-msg">Connexion Firestore...</div>

        <AttendanceLiveList
          :items="attendanceStore.todayAttendances.length
            ? attendanceStore.todayAttendances
            : mockItems"
        />
      </div>

      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card">
          <div class="card-header"><span class="card-title">Salles actives</span></div>
          <div class="rooms-list">
            <div v-for="room in activeRooms" :key="room.id" class="room-card"
              :style="`border-left-color:${room.color}`">
              <div class="room-name">{{ room.subject }} — {{ room.name }}</div>
              <div class="room-meta font-mono">{{ room.teacher }} · {{ room.time }}</div>
              <div style="margin-top:6px">
                <span class="badge badge-present">{{ room.present }} présents</span>
                <span v-if="room.pending" class="badge badge-late" style="margin-left:6px">
                  {{ room.pending }} en attente
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span class="card-title">Marquer manuellement</span></div>
          <div class="manual-form">
            <input v-model="manualSearch" type="text"
              placeholder="Rechercher un étudiant..." class="search-input" />
            <div class="status-btns">
              <button class="status-btn status-btn--present" @click="markManual('present')">Présent</button>
              <button class="status-btn status-btn--late"    @click="markManual('late')">En retard</button>
              <button class="status-btn status-btn--absent"  @click="markManual('absent')">Absent</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAttendanceStore } from '@/stores/attendanceStore'
import AttendanceLiveList from '@/components/attendance/AttendanceLiveList.vue'

const attendanceStore = useAttendanceStore()
const activeTab   = ref('today')
/*const manualSearch = ref('')*/

const tabs = [
  { key:'today',  label:"Aujourd'hui" },
  { key:'week',   label:'Cette semaine' },
  { key:'absent', label:'Absents' },
]

const activeRooms = ref([
  { id:1, subject:'Mathématiques', name:'Salle A', teacher:'Prof. Benali',  time:'14h00–16h00', present:22, pending:0, color:'#1D9E75' },
  { id:2, subject:'PC',            name:'Salle B', teacher:'Prof. Ouali',   time:'14h30–16h30', present:18, pending:4, color:'#EF9F27' },
  { id:3, subject:'SVT',           name:'Salle C', teacher:'Prof. Zahiri',  time:'15h00–17h00', present:12, pending:2, color:'#378ADD' },
])

const mockItems = ref([
  { id:1, initials:'YB', name:'Yassine Benali',  course:'Mathématiques',  time:'14:02', status:'present', color:'green' },
  { id:2, initials:'SW', name:'Sara Wahbi',       course:'Physique-Chimie',time:'14:05', status:'present', color:'blue'  },
  { id:3, initials:'KO', name:'Karim Ouali',      course:'SVT',            time:'14:08', status:'late',    color:'amber' },
])

function markManual(status) {
  if (!manualSearch.value.trim()) return
  // TODO: connect to real course/session IDs
  // attendanceStore.markAttendance(courseId, sessionId, studentId, status)
  attendanceStore.markAttendance(1, 1, manualSearch.value, status)

  const student = attendanceStore.students.find(s => s.id == manualSearch.value)
  if (student) {
    student.status = status
  }

  // TODO: scroll to student
  const studentEl = document.querySelector(`.student[data-id="${manualSearch.value}"]`)
  if (studentEl) {
    studentEl.scrollIntoView({ block:'center', inline:'center', behavior:'smooth' })
  }
   

  //manualSearch.value = ''
}

onMounted(() => {
  attendanceStore.listenAllToday()
})
onUnmounted(() => {
  attendanceStore.stopListening()
})
</script>

<style scoped>
.tabs { display:flex; gap:2px; background:#f0f0ee; padding:3px; border-radius:8px; margin-bottom:20px; width:fit-content; }
.tab  { padding:7px 18px; border-radius:6px; font-size:13px; cursor:pointer; border:none; background:none; color:#888; font-family:inherit; transition:all 0.15s; }
.tab.active { background:#fff; color:#1a1a1a; font-weight:500; box-shadow:0 1px 3px rgba(0,0,0,0.08); }
.stats-row { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; margin-bottom:20px; }
.stat-mini { padding:14px 16px; border-radius:10px; border:0.5px solid rgba(0,0,0,0.08); }
.stat-green { background:#E1F5EE; } .stat-amber { background:#FAEEDA; }
.stat-red   { background:#FCEBEB; } .stat-blue  { background:#E6F1FB; }
.stat-mini-val { font-size:22px; font-weight:600; font-family:'IBM Plex Mono',monospace; line-height:1; }
.stat-green .stat-mini-val { color:#085041; } .stat-amber .stat-mini-val { color:#633806; }
.stat-red   .stat-mini-val { color:#791F1F; } .stat-blue  .stat-mini-val { color:#0C447C; }
.stat-mini-label { font-size:11px; color:#888; margin-top:4px; }
.two-col { display:grid; grid-template-columns:1fr 340px; gap:20px; }
.card    { background:#fff; border:0.5px solid rgba(0,0,0,0.1); border-radius:10px; padding:20px; }
.card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.card-title  { font-size:13px; font-weight:500; }
.loading-msg { text-align:center; padding:20px; color:#aaa; font-size:13px; }
.rooms-list { display:flex; flex-direction:column; gap:10px; }
.room-card  { padding:12px; border:0.5px solid rgba(0,0,0,0.1); border-radius:8px; border-left-width:3px; }
.room-name  { font-size:13px; font-weight:500; }
.room-meta  { font-size:11px; color:#888; margin-top:2px; }
.manual-form { display:flex; flex-direction:column; gap:10px; }
.search-input { width:100%; padding:9px 12px; border:0.5px solid rgba(0,0,0,0.2); border-radius:8px; font-size:13px; font-family:inherit; outline:none; }
.search-input:focus { border-color:var(--c-brand); }
.status-btns { display:flex; gap:8px; }
.status-btn  { flex:1; padding:8px; border-radius:8px; border:0.5px solid; font-size:12px; font-weight:500; cursor:pointer; font-family:inherit; }
.status-btn--present { background:#E1F5EE; color:#085041; border-color:#9FE1CB; }
.status-btn--late    { background:#FAEEDA; color:#633806; border-color:#FAC775; }
.status-btn--absent  { background:#FCEBEB; color:#791F1F; border-color:#F7C1C1; }
.dot-offline { background:#E24B4A !important; animation:none !important; }
</style>
