<!-- src/views/DevicesView.vue -->
<template>
  <div>
    <!-- Device cards — live from Firestore -->
    <div class="devices-grid">
      <div v-if="deviceStore.loading" class="device-card loading-card">
        <div class="loading-msg">Connexion Firestore...</div>
      </div>

      <template v-if="!deviceStore.loading">
        <div v-for="d in displayDevices" :key="d.id" class="device-card">
          <div class="device-header">
            <div>
              <div class="device-name font-mono">{{ d.id }}</div>
              <div class="device-room">{{ d.room }}</div>
            </div>
            <div class="status-dot" :class="d.status === 'online' ? 'dot-online' : 'dot-offline'"></div>
          </div>
          <div class="device-scans">{{ d.totalScans || 0 }}</div>
          <div class="device-sub">badges scannés · {{ formatLastSeen(d.lastSeen) }}</div>
          <div class="device-info-row">
            <span class="info-chip font-mono">{{ d.ip || '—' }}</span>
            <span class="info-chip font-mono">{{ d.firmware || 'v2.1.0' }}</span>
            <span class="badge" :class="d.status === 'online' ? 'badge-present' : 'badge-absent'">
              {{ d.status === 'online' ? 'En ligne' : 'Hors ligne' }}
            </span>
          </div>
        </div>
      </template>
    </div>

    <!-- Firebase Live indicator -->
    <div class="live-banner" v-if="deviceStore.isLive">
      <span class="live-dot"></span>
      <span class="font-mono" style="font-size:11px">Dispositifs surveillés en temps réel via Firestore</span>
    </div>

    <div class="two-col">
      <!-- NFC Scan Log — live -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Journal des scans NFC</span>
          <div style="display:flex;align-items:center;gap:6px">
            <span class="live-dot" :class="{ 'dot-offline': !attendanceStore.isLive }"></span>
            <span class="font-mono" style="font-size:11px;color:#888">
              {{ attendanceStore.isLive ? 'Live' : 'En attente' }}
            </span>
          </div>
        </div>
        <div class="scan-log">
          <div v-for="scan in displayScans" :key="scan.id" class="scan-row"
            :class="scan.allowed !== false ? 'scan-ok' : 'scan-fail'">
            <div class="scan-time font-mono">{{ scan.time || formatTime(scan.scannedAt) }}</div>
            <div class="scan-uid font-mono">{{ scan.uid || scan.badgeUID || '—' }}</div>
            <div class="scan-student">{{ scan.studentName || scan.student || 'Inconnu' }}</div>
            <div class="scan-room font-mono">{{ scan.deviceId || scan.room || '—' }}</div>
            <span class="badge" :class="scan.allowed !== false ? 'badge-present' : 'badge-absent'">
              {{ scan.allowed !== false ? 'Autorisé' : 'Refusé' }}
            </span>
          </div>
          <div v-if="!displayScans.length" class="empty-log">Aucun scan reçu pour l'instant.</div>
        </div>
      </div>

      <!-- Setup guide -->
      <div class="card">
        <div class="card-header"><span class="card-title">Configuration ESP32</span></div>
        <div class="setup-steps">
          <div v-for="(step, i) in setupSteps" :key="i" class="step">
            <div class="step-num">{{ i + 1 }}</div>
            <div>
              <div class="step-title">{{ step.title }}</div>
              <div class="step-code font-mono">{{ step.code }}</div>
            </div>
          </div>
        </div>

        <div style="margin-top:20px;border-top:0.5px solid rgba(0,0,0,0.08);padding-top:16px">
          <div class="card-title" style="margin-bottom:12px">Composants requis</div>
          <div class="components-list">
            <div v-for="c in components" :key="c.name" class="component-row">
              <div class="component-dot"></div>
              <div>
                <div class="component-name">{{ c.name }}</div>
                <div class="component-desc font-mono">{{ c.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDeviceStore }     from '@/stores/deviceStore'
import { useAttendanceStore } from '@/stores/attendanceStore'

const deviceStore     = useDeviceStore()
const attendanceStore = useAttendanceStore()

// Use real Firestore data if available, fallback to mock
const mockDevices = [
  { id:'ESP32-A', room:'Salle A · Mathématiques', status:'online',  totalScans:247, ip:'192.168.1.101', firmware:'v2.1.0' },
  { id:'ESP32-B', room:'Salle B · PC',             status:'online',  totalScans:189, ip:'192.168.1.102', firmware:'v2.1.0' },
  { id:'ESP32-C', room:'Salle C · SVT',            status:'offline', totalScans:0,   ip:'—',             firmware:'v2.0.3' },
]
const displayDevices = computed(() =>
  deviceStore.devices.length ? deviceStore.devices : mockDevices
)

const mockScans = [
  { id:1, time:'14:02:34', uid:'A3:F2:84:0C', student:'Yassine Benali', room:'ESP32-A', allowed:true  },
  { id:2, time:'14:05:11', uid:'B1:CC:21:7E', student:'Sara Wahbi',     room:'ESP32-B', allowed:true  },
  { id:3, time:'14:06:52', uid:'4F:09:AA:83', student:'Inconnu',        room:'ESP32-A', allowed:false },
  { id:4, time:'14:08:03', uid:'D7:1A:30:FF', student:'Karim Ouali',    room:'ESP32-C', allowed:true  },
]
const displayScans = computed(() =>
  attendanceStore.recentScans.length ? attendanceStore.recentScans : mockScans
)

function formatLastSeen(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
}
function formatTime(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit', second:'2-digit' })
}

const setupSteps = [
  { title:'Flasher le firmware',        code:'pio run --target upload' },
  { title:'Configurer WiFi + Firebase', code:'config.h → WIFI_SSID, PROJECT_ID' },
  { title:"Assigner l'ID de salle",     code:'DEVICE_ID = "ESP32-A"' },
  { title:'Vérifier la connexion',      code:'Serial Monitor → "Firebase OK"' },
]
const components = [
  { name:'ESP32 DevKit v1',   desc:'Microcontrôleur principal + WiFi/BT' },
  { name:'MFRC522 / PN532',   desc:'Module lecteur RFID/NFC 13.56 MHz'  },
  { name:'LCD I2C 16×2',      desc:'Affichage nom étudiant + statut'     },
  { name:'Buzzer actif 5V',   desc:'Feedback sonore OK / Refusé'         },
  { name:'LED RGB commune',   desc:'Feedback visuel vert / rouge'        },
  { name:'Badges NFC MIFARE', desc:'UID unique par étudiant'             },
]

onMounted(() => {
  deviceStore.listenDevices()
  attendanceStore.listenAllToday()
})
onUnmounted(() => {
  deviceStore.stopListening()
  attendanceStore.stopListening()
})
</script>

<style scoped>
.devices-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; margin-bottom:12px; }
.device-card  { background:#fff; border:0.5px solid rgba(0,0,0,0.1); border-radius:10px; padding:16px; }
.loading-card { display:flex; align-items:center; justify-content:center; min-height:120px; }
.loading-msg  { color:#aaa; font-size:13px; }
.device-header{ display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:12px; }
.device-name  { font-size:13px; font-weight:500; }
.device-room  { font-size:11px; color:#888; margin-top:2px; }
.status-dot   { width:9px; height:9px; border-radius:50%; flex-shrink:0; margin-top:3px; }
.dot-online   { background:var(--c-brand); animation:pulse 2s infinite; }
.dot-offline  { background:var(--c-red); }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.35} }
.device-scans { font-size:28px; font-weight:600; font-family:'IBM Plex Mono',monospace; color:#085041; line-height:1; }
.device-sub   { font-size:11px; color:#888; margin-top:4px; }
.device-info-row { display:flex; align-items:center; gap:6px; margin-top:10px; flex-wrap:wrap; }
.info-chip    { font-size:10px; padding:2px 7px; background:#f0f0ee; border-radius:8px; color:#555; }

.live-banner  { display:flex; align-items:center; gap:8px; padding:8px 12px; background:#E1F5EE; border-radius:8px; margin-bottom:16px; }

.two-col { display:grid; grid-template-columns:1fr 340px; gap:20px; }
.card    { background:#fff; border:0.5px solid rgba(0,0,0,0.1); border-radius:10px; padding:20px; }
.card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
.card-title  { font-size:13px; font-weight:500; }

.scan-log   { display:flex; flex-direction:column; gap:6px; }
.scan-row   { display:flex; align-items:center; gap:12px; padding:9px 10px; border-radius:7px; font-size:12px; }
.scan-ok    { background:#f8fdf9; border-left:2px solid var(--c-brand); }
.scan-fail  { background:#fdf8f8; border-left:2px solid var(--c-red); }
.scan-time  { color:#888; width:65px; flex-shrink:0; }
.scan-uid   { color:#aaa; width:95px; flex-shrink:0; font-size:11px; }
.scan-student { flex:1; font-weight:500; }
.scan-room  { color:#888; font-size:11px; width:65px; flex-shrink:0; }
.empty-log  { text-align:center; padding:20px; color:#bbb; font-size:13px; }

.setup-steps { display:flex; flex-direction:column; gap:14px; }
.step        { display:flex; align-items:flex-start; gap:12px; }
.step-num    { width:22px; height:22px; background:#E1F5EE; color:#085041; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; flex-shrink:0; margin-top:1px; }
.step-title  { font-size:13px; font-weight:500; }
.step-code   { font-size:11px; color:#888; margin-top:3px; }
.components-list { display:flex; flex-direction:column; gap:10px; }
.component-row   { display:flex; align-items:flex-start; gap:10px; }
.component-dot   { width:6px; height:6px; border-radius:50%; background:var(--c-brand); flex-shrink:0; margin-top:5px; }
.component-name  { font-size:13px; font-weight:500; }
.component-desc  { font-size:11px; color:#888; margin-top:1px; }
</style>
