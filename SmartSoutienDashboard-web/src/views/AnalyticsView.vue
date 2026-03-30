<!-- src/views/AnalyticsView.vue -->
<template>
  <div>
    <!-- AI model banner -->
    <div class="ai-banner">
      <div class="ai-banner-left">
        <div class="ai-label font-mono">Scikit-learn · FastAPI · Python 3.11</div>
        <div class="ai-title">Modèle IA — Prédiction d'abandon scolaire</div>
        <div class="ai-desc">Analyse les patterns de présence, paiement et performance pour identifier les étudiants à risque.</div>
      </div>
      <div class="ai-accuracy">
        <div class="accuracy-val font-mono">94.2%</div>
        <div class="accuracy-label">Précision du modèle</div>
      </div>
    </div>

    <!-- Risk prediction cards -->
    <div class="section-title">Étudiants à risque d'abandon</div>
    <div class="risk-grid">
      <div v-for="r in riskStudents" :key="r.id" class="risk-card" :style="`background:${r.bg}`">
        <div class="risk-header">
          <div class="risk-name" :style="`color:${r.tc}`">{{ r.name }}</div>
          <span class="badge" :class="r.badgeClass">{{ r.levelLabel }}</span>
        </div>
        <div class="risk-score" :style="`color:${r.tc}`">{{ r.score }}<span style="font-size:14px">%</span></div>
        <div class="risk-bar-track">
          <div class="risk-bar-fill" :style="`width:${r.score}%;background:${r.tc}`"></div>
        </div>
        <div class="risk-factors font-mono" :style="`color:${r.tc}`">{{ r.factors }}</div>
      </div>
    </div>

    <div class="analytics-grid">
      <!-- Presence vs performance correlation -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Corrélation présence → performance</span>
        </div>
        <div class="corr-chart">
          <div v-for="c in corrData" :key="c.label" class="corr-row">
            <span class="corr-label font-mono">{{ c.label }}</span>
            <div class="corr-bar-track">
              <div class="corr-bar-fill" :style="`width:${c.pct}%`">
                <span class="corr-bar-text font-mono">{{ c.perf }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI recommendations -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Recommandations IA</span>
          <span class="font-mono" style="font-size:10px;color:#888">Mis à jour il y a 2h</span>
        </div>
        <div class="recos-list">
          <div v-for="r in recommendations" :key="r.id" class="reco-item" :style="`background:${r.bg}`">
            <div class="reco-icon" :style="`background:${r.iconBg};color:${r.tc}`">{{ r.icon }}</div>
            <div>
              <div class="reco-text" :style="`color:${r.tc}`">{{ r.text }}</div>
              <div class="reco-action font-mono" :style="`color:${r.tc}`">{{ r.action }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly report -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Rapport mensuel automatique</span>
        </div>
        <div class="report-stats">
          <div v-for="s in reportStats" :key="s.label" class="report-stat">
            <div class="report-val font-mono">{{ s.value }}</div>
            <div class="report-label">{{ s.label }}</div>
          </div>
        </div>
        <button class="download-btn" @click="downloadReport">
          Télécharger rapport PDF →
        </button>
      </div>

      <!-- Filiere breakdown -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Performance par filière</span>
        </div>
        <div class="filiere-breakdown">
          <div v-for="f in filiereStats" :key="f.name" class="filiere-row">
            <div class="filiere-info">
              <span class="filiere-name">{{ f.name }}</span>
              <span class="filiere-count font-mono">{{ f.count }} étudiants</span>
            </div>
            <div class="filiere-bar-track">
              <div class="filiere-bar-fill" :style="`width:${f.presence}%;background:${f.color}`"></div>
            </div>
            <span class="filiere-pct font-mono">{{ f.presence }}%</span>
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

const riskStudents = ref([
  { id:1, name:'Amine Mounir',  score:78, bg:'#FCEBEB', tc:'#791F1F', badgeClass:'badge-absent',  levelLabel:'Risque élevé',   factors:'Absences: 6 · Paiement: retard' },
  { id:2, name:'Karim Ouali',   score:52, bg:'#FAEEDA', tc:'#633806', badgeClass:'badge-late',    levelLabel:'Risque modéré',  factors:'Absences: 3 · Notes: faibles'  },
  { id:3, name:'Zineb Alaoui',  score:38, bg:'#FAEEDA', tc:'#633806', badgeClass:'badge-late',    levelLabel:'Risque modéré',  factors:'Absences: 2 · Paiement: attente'},
  { id:4, name:'Hafsa Zaim',    score:18, bg:'#E1F5EE', tc:'#085041', badgeClass:'badge-present', levelLabel:'Faible risque',  factors:'Présence: 83% · Paiement: OK'  },
  { id:5, name:'Nadia El Fassi',score: 5, bg:'#E1F5EE', tc:'#085041', badgeClass:'badge-present', levelLabel:'Très faible',    factors:'Présence: 95% · Excellent'     },
])

const corrData = ref([
  { label:'+90% présence', pct:88, perf:'Moy: 16/20' },
  { label:'75–90%',        pct:65, perf:'Moy: 13/20' },
  { label:'60–75%',        pct:42, perf:'Moy: 10/20' },
  { label:'< 60%',         pct:22, perf:'Moy:  7/20' },
])

const recommendations = ref([
  { id:1, icon:'!', bg:'#FCEBEB', iconBg:'#F7C1C1', tc:'#791F1F', text:'Contacter les parents de Amine Mounir', action:'3 absences consécutives + paiement en retard' },
  { id:2, icon:'→', bg:'#FAEEDA', iconBg:'#FAC775', tc:'#633806', text:'Séance de rattrapage pour Karim Ouali', action:'SVT — lacunes détectées sur le programme' },
  { id:3, icon:'✓', bg:'#E1F5EE', iconBg:'#9FE1CB', tc:'#085041', text:'Féliciter Nadia El Fassi',              action:'95% de présence · Meilleure progression' },
])

const reportStats = ref([
  { value:'84',   label:'Étudiants actifs' },
  { value:'87%',  label:'Taux présence moy.' },
  { value:'42k',  label:'MAD encaissés' },
  { value:'91%',  label:'Taux recouvrement' },
])

const filiereStats = ref([
  { name:'Mathématiques', count:34, presence:91, color:'#1D9E75' },
  { name:'Physique-Chimie', count:28, presence:85, color:'#378ADD' },
  { name:'SVT',            count:22, presence:82, color:'#EF9F27' },
])

function downloadReport() {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('SmartSoutien — Rapport Mensuel', 14, 22)
  doc.setFontSize(12)
  doc.text(`Mois : Mars 2026`, 14, 34)

  autoTable(doc, {
    startY: 44,
    head: [['Indicateur', 'Valeur']],
    body: reportStats.value.map(s => [s.label, s.value]),
  })

  doc.setFontSize(14)
  doc.text('Étudiants à risque', 14, doc.lastAutoTable.finalY + 16)
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 22,
    head: [['Étudiant', 'Score risque', 'Facteurs']],
    body: riskStudents.value.map(r => [r.name, r.score + '%', r.factors]),
  })

  doc.save('rapport-mars-2026.pdf')
}
</script>

<style scoped>
.ai-banner {
  display:flex; align-items:center; justify-content:space-between;
  padding:20px 24px; background:#E1F5EE;
  border:0.5px solid #9FE1CB; border-radius:10px; margin-bottom:24px;
}
.ai-label  { font-size:10px; color:#0F6E56; margin-bottom:4px; letter-spacing:0.5px; }
.ai-title  { font-size:16px; font-weight:600; color:#04342C; margin-bottom:4px; }
.ai-desc   { font-size:12px; color:#0F6E56; }
.accuracy-val { font-size:30px; font-weight:700; color:#085041; text-align:right; line-height:1; }
.accuracy-label { font-size:11px; color:#0F6E56; margin-top:4px; text-align:right; }

.section-title { font-size:13px; font-weight:500; margin-bottom:12px; }
.risk-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:10px; margin-bottom:24px; }
.risk-card { padding:14px; border-radius:9px; }
.risk-header { display:flex; align-items:flex-start; justify-content:space-between; gap:6px; margin-bottom:8px; flex-wrap:wrap; }
.risk-name { font-size:12px; font-weight:500; }
.risk-score { font-size:26px; font-weight:700; font-family:'IBM Plex Mono',monospace; line-height:1; margin-bottom:8px; }
.risk-bar-track { height:4px; background:rgba(0,0,0,0.1); border-radius:2px; margin-bottom:8px; }
.risk-bar-fill  { height:100%; border-radius:2px; }
.risk-factors { font-size:10px; line-height:1.4; }

.analytics-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
.card { background:#fff; border:0.5px solid rgba(0,0,0,0.1); border-radius:10px; padding:20px; }
.card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.card-title  { font-size:13px; font-weight:500; }

.corr-chart { display:flex; flex-direction:column; gap:10px; }
.corr-row   { display:flex; align-items:center; gap:10px; }
.corr-label { font-size:11px; color:#888; width:90px; flex-shrink:0; }
.corr-bar-track { flex:1; height:18px; background:#f0f0ee; border-radius:4px; overflow:hidden; }
.corr-bar-fill  { height:100%; background:var(--c-brand); border-radius:4px; display:flex; align-items:center; padding-left:6px; min-width:50px; }
.corr-bar-text  { font-size:10px; color:#fff; white-space:nowrap; }

.recos-list { display:flex; flex-direction:column; gap:10px; }
.reco-item  { display:flex; align-items:flex-start; gap:10px; padding:11px 12px; border-radius:8px; }
.reco-icon  { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; flex-shrink:0; }
.reco-text  { font-size:12px; font-weight:500; }
.reco-action{ font-size:11px; margin-top:2px; }

.report-stats { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin-bottom:16px; }
.report-stat  { padding:12px; background:#f5f5f3; border-radius:8px; }
.report-val   { font-size:22px; font-weight:600; color:#085041; line-height:1; }
.report-label { font-size:11px; color:#888; margin-top:4px; }
.download-btn {
  width:100%; padding:10px; background:var(--c-brand-dark); color:#fff;
  border:none; border-radius:8px; font-size:13px; font-weight:500;
  cursor:pointer; font-family:inherit; transition:opacity 0.15s;
}
.download-btn:hover { opacity:0.85; }

.filiere-breakdown { display:flex; flex-direction:column; gap:14px; }
.filiere-row { display:flex; align-items:center; gap:10px; }
.filiere-info { width:160px; flex-shrink:0; }
.filiere-name { font-size:13px; font-weight:500; display:block; }
.filiere-count{ font-size:11px; color:#888; }
.filiere-bar-track { flex:1; height:6px; background:#f0f0ee; border-radius:3px; }
.filiere-bar-fill  { height:100%; border-radius:3px; }
.filiere-pct { font-size:12px; width:36px; text-align:right; flex-shrink:0; }
</style>
