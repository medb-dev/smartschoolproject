<!-- src/views/DevicesView.vue -->
<template>
  <div>
    <!-- Device cards -->
    <div class="devices-grid">
      <div v-for="d in devices" :key="d.id" class="device-card">
        <div class="device-header">
          <div>
            <div class="device-name font-mono">{{ d.id }}</div>
            <div class="device-room">{{ d.room }}</div>
          </div>
          <div class="status-dot" :class="d.status === 'online' ? 'dot-online' : 'dot-offline'"></div>
        </div>
        <div class="device-scans">{{ d.totalScans }}</div>
        <div class="device-sub">badges scannés · {{ d.lastSeen }}</div>
        <div class="device-info-row">
          <span class="info-chip font-mono">IP: {{ d.ip }}</span>
          <span class="info-chip font-mono">{{ d.firmware }}</span>
          <span class="badge" :class="d.status==='online' ? 'badge-present' : 'badge-absent'">
            {{ d.status === 'online' ? 'En ligne' : 'Hors ligne' }}
          </span>
        </div>
      </div>
    </div>

    <div class="two-col">
      <!-- NFC Scan Log -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Journal des scans NFC</span>
          <div style="display:flex;align-items:center;gap:6px">
            <span class="live-dot"></span>
            <span class="font-mono" style="font-size:11px;color:#888">MQTT Live</span>
          </div>
        </div>
        <div class="scan-log">
          <div v-for="scan in scanLog" :key="scan.id" class="scan-row"
            :class="scan.allowed ? 'scan-ok' : 'scan-fail'">
            <div class="scan-time font-mono">{{ scan.time }}</div>
            <div class="scan-uid font-mono">{{ scan.uid }}</div>
            <div class="scan-student">{{ scan.student }}</div>
            <div class="scan-room font-mono">{{ scan.room }}</div>
            <span class="badge" :class="scan.allowed ? 'badge-present' : 'badge-absent'">
              {{ scan.allowed ? 'Autorisé' : 'Refusé' }}
            </span>
          </div>
        </div>
      </div>

      <!-- ESP32 Setup guide -->
      <div class="card">
        <div class="card-header"><span class="card-title">Configuration ESP32</span></div>
        <div class="setup-steps">
          <div class="step">
            <div class="step-num">1</div>
            <div>
              <div class="step-title">Flasher le firmware</div>
              <div class="step-code font-mono">pio run --target upload</div>
            </div>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <div>
              <div class="step-title">Configurer WiFi + Firebase</div>
              <div class="step-code font-mono">config.h → WIFI_SSID, PROJECT_ID</div>
            </div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <div>
              <div class="step-title">Assigner un ID de salle</div>
              <div class="step-code font-mono">DEVICE_ID = "ESP32-A"</div>
            </div>
          </div>
          <div class="step">
            <div class="step-num">4</div>
            <div>
              <div class="step-title">Vérifier la connexion</div>
              <div class="step-code font-mono">Serial Monitor → "Firebase OK"</div>
            </div>
          </div>
        </div>

        <div class="card-header" style="margin-top:20px;border-top:0.5px solid rgba(0,0,0,0.08);padding-top:16px">
          <span class="card-title">Composants requis</span>
        </div>
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
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useDeviceStore } from '@/stores/deviceStore'

const deviceStore = useDeviceStore()

const devices = ref([
  { id:'ESP32-A', room:'Salle A · Mathématiques', status:'online',  totalScans:247, lastSeen:'14:03', ip:'192.168.1.101', firmware:'v2.1.0' },
  { id:'ESP32-B', room:'Salle B · PC',             status:'online',  totalScans:189, lastSeen:'14:01', ip:'192.168.1.102', firmware:'v2.1.0' },
  { id:'ESP32-C', room:'Salle C · SVT',            status:'offline', totalScans:0,   lastSeen:'—',     ip:'—',             firmware:'v2.0.3' },
])

const scanLog = ref([
  { id:1, time:'14:02:34', uid:'A3:F2:84:0C', student:'Yassine Benali', room:'ESP32-A', allowed:true  },
  { id:2, time:'14:05:11', uid:'B1:CC:21:7E', student:'Sara Wahbi',     room:'ESP32-B', allowed:true  },
  { id:3, time:'14:06:52', uid:'4F:09:AA:83', student:'Inconnu',        room:'ESP32-A', allowed:false },
  { id:4, time:'14:08:03', uid:'D7:1A:30:FF', student:'Karim Ouali',    room:'ESP32-C', allowed:true  },
  { id:5, time:'14:11:20', uid:'C2:88:5E:12', student:'Nadia El Fassi', room:'ESP32-A', allowed:true  },
  { id:6, time:'14:14:47', uid:'E9:3B:71:AA', student:'Amine Mounir',   room:'ESP32-B', allowed:false },
])

const components = ref([
  { name:'ESP32 DevKit v1',     desc:'Microcontrôleur principal + WiFi/BT' },
  { name:'MFRC522 / PN532',     desc:'Module lecteur RFID/NFC 13.56 MHz'  },
  { name:'LCD I2C 16×2',        desc:'Affichage nom étudiant + statut'      },
  { name:'Buzzer actif 5V',     desc:'Feedback sonore OK / Refusé'          },
  { name:'LED RGB commune',     desc:'Feedback visuel vert / rouge'          },
  { name:'Badges NFC MIFARE',   desc:'UID unique par étudiant'              },
])

let unsubscribe = null
onMounted(() => { unsubscribe = deviceStore.listenDevices() })
onUnmounted(() => deviceStore.stopListening())
</script>

<style scoped>
.devices-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; margin-bottom:20px; }
.device-card  { background:#fff; border:0.5px solid rgba(0,0,0,0.1); border-radius:10px; padding:16px; }
.device-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:12px; }
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

.two-col { display:grid; grid-template-columns:1fr 340px; gap:20px; }
.card    { background:#fff; border:0.5px solid rgba(0,0,0,0.1); border-radius:10px; padding:20px; }
.card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
.card-title  { font-size:13px; font-weight:500; }

.scan-log { display:flex; flex-direction:column; gap:6px; }
.scan-row { display:flex; align-items:center; gap:12px; padding:9px 10px; border-radius:7px; font-size:12px; }
.scan-ok  { background:#f8fdf9; border-left:2px solid var(--c-brand); }
.scan-fail{ background:#fdf8f8; border-left:2px solid var(--c-red); }
.scan-time    { color:#888; width:65px; flex-shrink:0; }
.scan-uid     { color:#aaa; width:95px; flex-shrink:0; font-size:11px; }
.scan-student { flex:1; font-weight:500; }
.scan-room    { color:#888; font-size:11px; width:65px; flex-shrink:0; }

.setup-steps { display:flex; flex-direction:column; gap:14px; }
.step        { display:flex; align-items:flex-start; gap:12px; }
.step-num    { width:22px; height:22px; background:var(--c-brand-light); color:var(--c-brand-dark); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; flex-shrink:0; margin-top:1px; }
.step-title  { font-size:13px; font-weight:500; }
.step-code   { font-size:11px; color:#888; margin-top:3px; }

.components-list { display:flex; flex-direction:column; gap:10px; }
.component-row { display:flex; align-items:flex-start; gap:10px; }
.component-dot { width:6px; height:6px; border-radius:50%; background:var(--c-brand); flex-shrink:0; margin-top:5px; }
.component-name { font-size:13px; font-weight:500; }
.component-desc { font-size:11px; color:#888; margin-top:1px; }
</style>
