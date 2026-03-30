<!-- src/views/NotFoundView.vue -->
<template>
  <div class="not-found">
    <div class="not-found-card">
      <div class="not-found-code font-mono">404</div>
      <div class="not-found-title">Page introuvable</div>
      <div class="not-found-desc">Cette page n'existe pas ou vous n'y avez pas accès.</div>
      <RouterLink to="/dashboard" class="back-btn">← Retour au tableau de bord</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.not-found { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#f5f5f3; }
.not-found-card { text-align:center; padding:48px; background:#fff; border-radius:14px; border:0.5px solid rgba(0,0,0,0.1); }
.not-found-code  { font-size:64px; font-weight:700; color:#f0f0ee; line-height:1; margin-bottom:16px; }
.not-found-title { font-size:20px; font-weight:600; margin-bottom:8px; }
.not-found-desc  { font-size:14px; color:#888; margin-bottom:24px; }
.back-btn { display:inline-block; padding:10px 20px; background:var(--c-brand); color:#fff; border-radius:8px; text-decoration:none; font-size:13px; font-weight:500; }
.back-btn:hover { background:var(--c-brand-dark); }
</style>
