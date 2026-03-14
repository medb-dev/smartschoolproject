<!-- src/components/attendance/AttendanceLiveList.vue -->
<template>
  <div class="live-list">
    <TransitionGroup name="slide-up">
      <div v-for="item in items" :key="item.id" class="live-item">
        <div class="live-avatar" :class="`la-${item.color}`">{{ item.initials }}</div>
        <div class="live-info">
          <div class="live-name">{{ item.name }}</div>
          <div class="live-course font-mono">{{ item.course }}</div>
        </div>
        <span class="badge" :class="statusBadge(item.status)">{{ statusLabel(item.status) }}</span>
        <span class="live-time font-mono">{{ item.time }}</span>
      </div>
    </TransitionGroup>
    <div v-if="!items.length" class="empty-state">Aucun scan reçu pour l'instant.</div>
  </div>
</template>

<script setup>
defineProps({ items: { type: Array, default: () => [] } })

const statusBadge  = (s) => ({ present:'badge-present', late:'badge-late', absent:'badge-absent' }[s] || '')
const statusLabel  = (s) => ({ present:'Présent', late:'En retard', absent:'Absent' }[s] || s)
</script>

<style scoped>
.live-list { display:flex; flex-direction:column; gap:8px; }
.live-item {
  display:flex; align-items:center; gap:12px;
  padding:10px 12px; background:#fafaf8;
  border-radius:8px;
}
.live-avatar {
  width:34px; height:34px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  font-size:12px; font-weight:600; flex-shrink:0;
}
.la-green { background:#E1F5EE; color:#085041; }
.la-blue  { background:#E6F1FB; color:#0C447C; }
.la-amber { background:#FAEEDA; color:#633806; }
.la-red   { background:#FCEBEB; color:#791F1F; }
.live-info  { flex:1; min-width:0; }
.live-name  { font-size:13px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.live-course{ font-size:11px; color:#888; margin-top:1px; }
.live-time  { font-size:11px; color:#aaa; flex-shrink:0; }
.empty-state{ text-align:center; padding:30px; color:#bbb; font-size:13px; }

.slide-up-enter-active { transition:all 0.3s ease; }
.slide-up-enter-from   { opacity:0; transform:translateX(-8px); }
</style>
