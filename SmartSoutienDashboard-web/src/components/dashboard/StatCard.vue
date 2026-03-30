<!-- src/components/dashboard/StatCard.vue -->
<template>
  <div class="stat-card">
    <div class="stat-icon" :class="`si-${color}`">
      <slot name="icon" />
    </div>
    <div class="stat-label">{{ label }}</div>
    <div class="stat-value">{{ value }}</div>
    <div class="stat-change" :class="trend">
      <span v-if="trend === 'up'">↑</span>
      <span v-if="trend === 'down'">↓</span>
      {{ change }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [String, Number],
  change: String,
  trend: { type: String, default: "neutral" }, // up | down | neutral
  color: { type: String, default: "green" }, // green | blue | amber | red
});
</script>

<style scoped>
.stat-card {
  background: #fff;
  border: 0.5px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 16px;
}
.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}
.si-green {
  background: #e1f5ee;
}
.si-blue {
  background: #e6f1fb;
}
.si-amber {
  background: #faeeda;
}
.si-red {
  background: #fcebeb;
}
.stat-label {
  font-size: 11px;
  font-family: "IBM Plex Mono", monospace;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 6px;
}
.stat-value {
  font-size: 26px;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 5px;
  letter-spacing: -1px;
}
.stat-change {
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 3px;
  color: #888;
}
.stat-change.up {
  color: #085041;
}
.stat-change.down {
  color: #791f1f;
}
</style>
