<script setup lang="ts">
defineProps<{ sections: { id: string; label: string }[]; activeIndex: number; disabled?: boolean }>();
defineEmits<{ navigate: [index: number] }>();
</script>

<template>
  <nav class="section-nav" aria-label="页面分屏导航">
    <button v-for="(section, index) in sections" :key="section.id" :disabled="disabled" :class="{ active: index === activeIndex }" :aria-label="`跳转到${section.label}`" @click="$emit('navigate', index)">
      <span>{{ section.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.section-nav { position: fixed; right: 28px; top: 50%; transform: translateY(-50%); z-index: 19; display: flex; flex-direction: column; gap: 12px; }
button { position: relative; width: 12px; height: 12px; padding: 0; border: 1px solid rgba(37,99,235,.36); border-radius: 999px; background: rgba(255,255,255,.78); box-shadow: 0 6px 18px rgba(30,64,175,.18); }
button.active { height: 30px; background: linear-gradient(180deg, #2563eb, #06b6d4); }
button:disabled { cursor: not-allowed; opacity: .45; }
span { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); white-space: nowrap; padding: 4px 8px; border-radius: 999px; background: rgba(255,255,255,.88); color: var(--muted); font-size: .75rem; opacity: 0; pointer-events: none; transition: opacity .2s; }
button:hover span { opacity: 1; }
@media (max-width: 860px) { .section-nav { display: none; } }
</style>
