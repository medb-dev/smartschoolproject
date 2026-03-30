<!-- src/components/dashboard/RevenueSparkline.vue -->
<template>
  <div class="sparkline">
    <div
      v-for="(val, i) in data" :key="i"
      class="spark-bar"
      :class="{ highlight: i === data.length - 1 }"
      :style="`height:${Math.round((val / maxVal) * 100)}%`"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ data: { type: Array, default: () => [] } })
const maxVal = computed(() => Math.max(...props.data, 1))
</script>

<style scoped>
.sparkline { display:flex; align-items:flex-end; gap:4px; height:44px; }
.spark-bar { flex:1; border-radius:2px 2px 0 0; background:#E1F5EE; min-height:4px; transition:height 0.8s ease; }
.spark-bar.highlight { background:var(--c-brand); }
</style>
