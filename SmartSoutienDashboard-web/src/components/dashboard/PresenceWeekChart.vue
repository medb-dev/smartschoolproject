<!-- src/components/dashboard/PresenceWeekChart.vue -->
<template>
  <div class="chart-wrap">
    <div class="bars">
      <div v-for="(val, i) in data" :key="i" class="bar-col">
        <div class="bar-val font-mono">{{ val }}%</div>
        <div class="bar-track">
          <div class="bar-fill" :style="`height:${val}%;background:${i===5?'var(--c-brand)':'#9FE1CB'}`"></div>
        </div>
      </div>
    </div>
    <div class="days">
      <span v-for="d in days" :key="d" class="day-label font-mono">{{ d }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({ data: { type: Array, default: () => [80,85,75,90,87,92,80] } })
const days = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']
</script>

<style scoped>
.chart-wrap { padding-top:4px; }
.bars { display:flex; align-items:flex-end; gap:6px; height:110px; }
.bar-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; height:100%; }
.bar-val  { font-size:9px; color:#888; }
.bar-track{ flex:1; width:100%; background:#f0f0ee; border-radius:3px; display:flex; flex-direction:column; justify-content:flex-end; overflow:hidden; }
.bar-fill { width:100%; border-radius:3px 3px 0 0; transition:height 1s ease; }
.days     { display:flex; justify-content:space-between; margin-top:4px; }
.day-label{ font-size:10px; color:#aaa; }
</style>
