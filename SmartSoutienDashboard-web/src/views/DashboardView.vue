<!-- src/views/DashboardView.vue -->
<template>
  <div>
    <!-- Stat cards -->
    <div class="stats-grid">
      <StatCard label="Étudiants actifs"     :value="studentStore.totalStudents || 84"  change="+6 ce mois"  trend="up"   color="green" />
      <StatCard label="Taux de présence"     :value="attendanceStore.presenceRate + '%' || '87%'" change="+2% semaine" trend="up"   color="blue"  />
      <StatCard label="Revenus du mois"      value="42k MAD"  change="+8%"         trend="up"   color="amber" />
      <StatCard label="Paiements en attente" :value="studentStore.unpaidStudents.length || 7" change="Urgents: 2" trend="down" color="red" />
    </div>

    <div class="main-grid">
      <!-- Live attendance -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Présences en temps réel</span>
          <div class="live-status">
            <span class="live-dot" :class="{ 'dot-offline': !attendanceStore.isLive }"></span>
            <span class="font-mono live-label">
              {{ attendanceStore.isLive ? 'Firestore Live' : 'En attente...' }}
            </span>
          </div>
        </div>
        <AttendanceLiveList
          :items="attendanceStore.todayAttendances.length
            ? attendanceStore.todayAttendances
            : items"
        />
      </div>

      <div class="side-column">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Présence — 7 jours</span>
          </div>
          <PresenceWeekChart :data="weekData" />
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">Revenus mensuels</span>
            <span class="font-mono" style="font-size:11px;color:var(--c-brand-dark);font-weight:500">42 000 MAD</span>
          </div>
          <RevenueSparkline :data="revenueData" />
          <div style="display:flex;justify-content:space-between;margin-top:6px">
            <span style="font-size:10px;color:#888;font-family:monospace">Sep</span>
            <span style="font-size:10px;color:#888;font-family:monospace">Mars</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/firebase/config"

import { useAttendanceStore } from '@/stores/attendanceStore'
import { useStudentStore }    from '@/stores/studentStore'
import { useDeviceStore }     from '@/stores/deviceStore'
import StatCard               from '@/components/dashboard/StatCard.vue'
import AttendanceLiveList     from '@/components/attendance/AttendanceLiveList.vue'
import PresenceWeekChart      from '@/components/dashboard/PresenceWeekChart.vue'
import RevenueSparkline       from '@/components/dashboard/RevenueSparkline.vue'

const attendanceStore = useAttendanceStore()
const studentStore    = useStudentStore()
const deviceStore     = useDeviceStore()

const weekData    = ref([82, 88, 75, 91, 87, 93, 80])
const revenueData = ref([28, 32, 35, 30, 38, 41, 42])

// Mock fallback items
/*const mockItems = ref([
  { id:1, initials:'YB', name:'Yassine Benali',  course:'Mathématiques',  time:'14:02', status:'present', color:'green' },
  { id:2, initials:'SW', name:'Sara Wahbi',       course:'Physique-Chimie',time:'14:05', status:'present', color:'blue'  },
  { id:3, initials:'KO', name:'Karim Ouali',      course:'SVT',            time:'14:08', status:'late',    color:'amber' },
  { id:4, initials:'NE', name:'Nadia El Fassi',   course:'Mathématiques',  time:'14:11', status:'present', color:'green' },
])*/

// let unsubStudents, unsubDevices, unsubAttendance
let unsubStudents, unsubDevices, unsubAttendance

const items = ref([])

onMounted(async () => {
  const q = query(
    collection(
      db,
      "courses",
      "cours_math_A",
      "sessions",
      "session_001",
      "attendances"
    ),
    orderBy("scannedAt", "desc")
  )

  const snapshot = await getDocs(q)

  items.value = snapshot.docs.map(doc => {
    const data = doc.data()

    return {
      id: doc.id,
      initials: getInitials(data.studentName),
      name: data.studentName,
      course: data.courseId || "N/A",
      time: new Date(parseInt(data.scannedAt)).toLocaleTimeString('en-US', { timeZone: 'Africa/Casablanca' }),
      //time: formatTime(data.scannedAt),
      status: data.status,
      color: getStatusColor(data.status)
    }
  })
  // Start all real-time listeners
  unsubStudents    = studentStore.listenStudents()
  unsubDevices     = deviceStore.listenDevices()
  unsubAttendance  = attendanceStore.listenAllToday()
})

onUnmounted(() => {
  // Stop all real-time listeners
  studentStore.stopListening()
  deviceStore.stopListening()
  attendanceStore.stopListening()
})

function getInitials(name) {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
}

function formatTime(timestamp) {
  return new Date(parseInt(timestamp)).toLocaleTimeString()
}

function getStatusColor(status) {
  switch (status) {
    case "present": return "green"
    case "late": return "amber"
    case "absent": return "red"
    default: return "gray"
  }
}

</script>

<style scoped>
.stats-grid  { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; margin-bottom:24px; }
.main-grid   { display:grid; grid-template-columns:1fr 320px; gap:20px; }
.side-column { display:flex; flex-direction:column; gap:16px; }
.card        { background:#fff; border:0.5px solid rgba(0,0,0,0.1); border-radius:10px; padding:20px; }
.card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.card-title  { font-size:13px; font-weight:500; }
.live-status { display:flex; align-items:center; gap:6px; }
.live-label  { font-size:11px; color:#888; }
.dot-offline { background:#E24B4A !important; animation:none !important; }
</style>
