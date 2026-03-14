<!-- src/views/DashboardView.vue -->
<template>
  <div>
    <!-- Stat cards -->
    <div class="stats-grid">
      <StatCard label="Étudiants actifs"    :value="84"   change="+6 ce mois"  trend="up"   color="green" />
      <StatCard label="Taux de présence"    value="87%"   change="+2% semaine" trend="up"   color="blue"  />
      <StatCard label="Revenus du mois"     value="42k"   change="+8% MAD"     trend="up"   color="amber" />
      <StatCard label="Paiements en attente" :value="7"   change="Urgents: 2"  trend="down" color="red"   />
    </div>

    <div class="main-grid">
      <!-- Live attendance -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Présences en temps réel</span>
          <div class="live-status">
            <span class="live-dot"></span>
            <span class="font-mono" style="font-size:11px;color:#888">Firestore Live</span>
          </div>
        </div>
        <AttendanceLiveList :items="liveItems" />
      </div>

      <div class="side-column">
        <!-- Presence chart -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Présence — 7 jours</span>
          </div>
          <PresenceWeekChart :data="weekData" />
        </div>

        <!-- Revenue sparkline -->
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
import { onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import StatCard          from '@/components/dashboard/StatCard.vue'
import AttendanceLiveList from '@/components/attendance/AttendanceLiveList.vue'
import PresenceWeekChart from '@/components/dashboard/PresenceWeekChart.vue'
import RevenueSparkline  from '@/components/dashboard/RevenueSparkline.vue'

// ── Mock data (remplacer par Firestore queries) ───────────────
const liveItems  = ref([
  { id:1, initials:'YB', name:'Yassine Benali',  course:'Mathématiques', time:'14:02', status:'present', color:'green' },
  { id:2, initials:'SW', name:'Sara Wahbi',       course:'Physique-Chimie', time:'14:05', status:'present', color:'blue' },
  { id:3, initials:'KO', name:'Karim Ouali',      course:'SVT',           time:'14:08', status:'late',    color:'amber' },
  { id:4, initials:'NE', name:'Nadia El Fassi',   course:'Mathématiques', time:'14:11', status:'present', color:'green' },
  { id:5, initials:'AM', name:'Amine Mounir',     course:'PC',            time:'14:14', status:'present', color:'blue' },
])

const weekData   = ref([82, 88, 75, 91, 87, 93, 80])
const revenueData = ref([28, 32, 35, 30, 38, 41, 42])
</script>

<style scoped>
.stats-grid {
  display: grid; grid-template-columns: repeat(4, minmax(0,1fr));
  gap: 12px; margin-bottom: 24px;
}
.main-grid {
  display: grid; grid-template-columns: 1fr 320px;
  gap: 20px;
}
.side-column { display: flex; flex-direction: column; gap: 16px; }
.card        { background: #fff; border: 0.5px solid rgba(0,0,0,0.1); border-radius: 10px; padding: 20px; }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.card-title  { font-size: 13px; font-weight: 500; }
.live-status { display: flex; align-items: center; gap: 6px; }
</style>
