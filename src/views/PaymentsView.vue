<!-- src/views/PaymentsView.vue -->
<template>
  <div>
    <div class="stats-grid">
      <StatCard label="Encaissé ce mois"     value="38k MAD" change="MAD"          trend="up"   color="green" />
      <StatCard label="En attente"            value="4k"      change="7 étudiants"  trend="neutral" color="amber" />
      <StatCard label="En retard"             :value="2"      change="Relance auto" trend="down" color="red"   />
      <StatCard label="Taux recouvrement"     value="91%"     change="+3%"          trend="up"   color="blue"  />
    </div>

    <div class="two-col">
      <!-- Payments list -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Paiements récents</span>
          <div style="display:flex;gap:8px">
            <button class="btn-sm" @click="generateAllInvoices">Factures PDF</button>
            <button class="btn-primary-sm">+ Enregistrer</button>
          </div>
        </div>
        <table class="pay-table">
          <thead>
            <tr>
              <th>Étudiant</th><th>Montant</th><th>Méthode</th><th>Date</th><th>Statut</th><th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in payments" :key="p.id" class="table-row">
              <td>
                <div class="student-cell">
                  <div class="avatar-xs" :style="`background:${p.bg};color:${p.tc}`">{{ p.init }}</div>
                  {{ p.name }}
                </div>
              </td>
              <td class="font-mono" style="font-weight:500">{{ p.amount }}</td>
              <td><span class="method-tag">{{ p.method }}</span></td>
              <td class="font-mono" style="font-size:11px;color:#888">{{ p.date }}</td>
              <td><span class="badge" :class="p.badgeClass">{{ p.statusLabel }}</span></td>
              <td>
                <button class="action-link" @click="generateInvoice(p)">PDF</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Right column -->
      <div style="display:flex;flex-direction:column;gap:16px">
        <!-- Payment methods -->
        <div class="card">
          <div class="card-header"><span class="card-title">Modes de paiement</span></div>
          <div class="methods-list">
            <div v-for="m in methods" :key="m.label" class="method-row">
              <span style="font-size:13px">{{ m.label }}</span>
              <div style="display:flex;align-items:center;gap:8px">
                <div class="method-bar">
                  <div class="method-fill" :style="`width:${m.pct}%;background:${m.color}`"></div>
                </div>
                <span class="font-mono" style="font-size:11px">{{ m.pct }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming alerts -->
        <div class="card">
          <div class="card-header"><span class="card-title">Alertes paiement</span></div>
          <div class="alerts-list">
            <div v-for="a in alerts" :key="a.id" class="alert-item" :class="`alert-${a.type}`">
              <div class="alert-name">{{ a.name }}</div>
              <div class="alert-msg font-mono">{{ a.msg }}</div>
              <button class="alert-btn" @click="sendReminder(a)">Relancer →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import StatCard from '@/components/dashboard/StatCard.vue'

const payments = ref([
  { id:1, init:'YB', name:'Yassine Benali',  bg:'#E1F5EE', tc:'#085041', amount:'450 MAD', method:'CMI',      date:'14/03/2026', badgeClass:'badge-present', statusLabel:'Payé'        },
  { id:2, init:'SW', name:'Sara Wahbi',       bg:'#E6F1FB', tc:'#0C447C', amount:'450 MAD', method:'CMI',      date:'13/03/2026', badgeClass:'badge-present', statusLabel:'Payé'        },
  { id:3, init:'KO', name:'Karim Ouali',      bg:'#FAEEDA', tc:'#633806', amount:'450 MAD', method:'Espèces',  date:'—',          badgeClass:'badge-late',    statusLabel:'En attente'  },
  { id:4, init:'NE', name:'Nadia El Fassi',   bg:'#E1F5EE', tc:'#085041', amount:'450 MAD', method:'Virement', date:'10/03/2026', badgeClass:'badge-present', statusLabel:'Payé'        },
  { id:5, init:'AM', name:'Amine Mounir',     bg:'#FCEBEB', tc:'#791F1F', amount:'450 MAD', method:'—',        date:'—',          badgeClass:'badge-absent',  statusLabel:'Retard'      },
])

const methods = ref([
  { label:'Paiement en ligne (CMI)', pct:62, color:'var(--c-brand)'  },
  { label:'Espèces',                 pct:28, color:'var(--c-amber)'  },
  { label:'Virement bancaire',       pct:10, color:'var(--c-accent)' },
])

const alerts = ref([
  { id:1, name:'Amine Mounir',  msg:'Retard 2 mois',      type:'red'   },
  { id:2, name:'Karim Ouali',   msg:'En attente 3 sem.',  type:'amber' },
])

function generateInvoice(p) {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('SmartSoutien — Facture', 14, 22)
  doc.setFontSize(11)
  doc.text(`Étudiant : ${p.name}`, 14, 36)
  doc.text(`Date     : ${p.date}`, 14, 44)
  doc.text(`Méthode  : ${p.method}`, 14, 52)
  autoTable(doc, {
    startY: 62,
    head: [['Description', 'Montant']],
    body: [['Frais de cours mensuel', p.amount]],
  })
  doc.save(`facture-${p.name.replace(' ','-')}.pdf`)
}

function generateAllInvoices() {
  payments.value.filter(p => p.statusLabel === 'Payé').forEach(generateInvoice)
}

function sendReminder(a) {
  alert(`Relance envoyée à ${a.name} via email / SMS`)
}
</script>

<style scoped>
.stats-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; margin-bottom:24px; }
.two-col    { display:grid; grid-template-columns:1fr 300px; gap:20px; }
.card       { background:#fff; border:0.5px solid rgba(0,0,0,0.1); border-radius:10px; padding:20px; }
.card-header{ display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.card-title { font-size:13px; font-weight:500; }
.btn-sm     { padding:6px 12px; border:0.5px solid rgba(0,0,0,0.2); border-radius:6px; font-size:12px; background:none; cursor:pointer; font-family:inherit; }
.btn-primary-sm { padding:6px 12px; background:var(--c-brand); color:#fff; border:none; border-radius:6px; font-size:12px; font-weight:500; cursor:pointer; font-family:inherit; }

.pay-table { width:100%; border-collapse:collapse; }
.pay-table th { font-size:11px; font-family:'IBM Plex Mono',monospace; color:#888; text-align:left; padding:8px 10px; border-bottom:0.5px solid rgba(0,0,0,0.08); text-transform:uppercase; font-weight:500; letter-spacing:0.3px; }
.pay-table td { padding:10px; border-bottom:0.5px solid rgba(0,0,0,0.06); font-size:13px; }
.table-row:last-child td { border-bottom:none; }
.table-row:hover td { background:#fafaf8; }

.student-cell { display:flex; align-items:center; gap:8px; }
.avatar-xs { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:600; flex-shrink:0; }
.method-tag { font-size:11px; padding:2px 7px; background:#f0f0ee; border-radius:8px; color:#555; font-family:'IBM Plex Mono',monospace; }
.action-link { font-size:12px; color:var(--c-accent); background:none; border:none; cursor:pointer; font-family:inherit; }

.methods-list { display:flex; flex-direction:column; gap:12px; }
.method-row   { display:flex; justify-content:space-between; align-items:center; }
.method-bar   { height:6px; width:80px; background:#f0f0ee; border-radius:3px; }
.method-fill  { height:100%; border-radius:3px; }

.alerts-list  { display:flex; flex-direction:column; gap:8px; }
.alert-item   { padding:11px 12px; border-radius:8px; }
.alert-red    { background:#FCEBEB; }
.alert-amber  { background:#FAEEDA; }
.alert-name   { font-size:13px; font-weight:500; }
.alert-red .alert-name   { color:#791F1F; }
.alert-amber .alert-name { color:#633806; }
.alert-msg    { font-size:11px; margin-top:2px; }
.alert-red .alert-msg    { color:#791F1F; }
.alert-amber .alert-msg  { color:#633806; }
.alert-btn    { margin-top:8px; font-size:11px; background:none; border:none; cursor:pointer; font-family:inherit; font-weight:500; }
.alert-red .alert-btn    { color:#791F1F; }
.alert-amber .alert-btn  { color:#633806; }
</style>
