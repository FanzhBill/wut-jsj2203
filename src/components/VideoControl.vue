<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

defineProps<{ active: boolean }>();
defineEmits<{ toggle: [] }>();

const showHint = ref(false);
let timer: number | undefined;

onMounted(() => {
  timer = window.setTimeout(() => {
    showHint.value = true;
  }, 5000);
});

onBeforeUnmount(() => {
  if (timer) window.clearTimeout(timer);
});

function hideHint() {
  showHint.value = false;
}
</script>

<template>
  <div class="video-control-wrap">
    <div v-if="showHint && !active" class="easter-bubble" @click="hideHint">
      <strong>彩蛋</strong>
      <span>点击这里</span>
    </div>
    <button class="video-btn" :class="{ playing: active }" :aria-label="active ? '停止彩蛋视频' : '播放彩蛋视频'" @click="hideHint(); $emit('toggle')">
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <rect x="4" y="7" width="14" height="14" rx="3" fill="currentColor" />
        <path d="M18 11.2 24 8.4v11.2l-6-2.8z" fill="currentColor" />
        <circle v-if="active" cx="10" cy="14" r="2.1" fill="#fff" opacity=".9" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.video-control-wrap { position: fixed; right: 22px; bottom: 26px; z-index: 20; }
.video-btn { width: 58px; height: 58px; border: 0; border-radius: 20px; color: white; background: linear-gradient(135deg, #2563eb, #06b6d4); box-shadow: 0 16px 45px rgba(37,99,235,.32); display: grid; place-items: center; }
.video-btn svg { width: 30px; height: 30px; filter: drop-shadow(0 4px 10px rgba(15,23,42,.18)); }
.video-btn::before { content: ""; position: absolute; inset: -8px; border-radius: 24px; border: 1px solid rgba(37,99,235,.28); opacity: 0; }
.video-btn.playing::before { animation: ripple 1.6s ease-out infinite; }
.video-btn.playing { background: linear-gradient(135deg, #f97316, #f59e0b); }
.easter-bubble { position: absolute; right: 68px; bottom: 8px; min-width: 118px; padding: 10px 13px; border-radius: 18px; background: rgba(255,255,255,.92); border: 1px solid rgba(37,99,235,.15); box-shadow: 0 18px 40px rgba(30,64,175,.18); color: #10213f; display: grid; gap: 2px; animation: bubblePop .45s var(--ease) both, floatHint 1.8s ease-in-out .45s infinite; cursor: pointer; }
.easter-bubble::after { content: ""; position: absolute; right: -7px; bottom: 18px; width: 14px; height: 14px; background: rgba(255,255,255,.92); transform: rotate(45deg); border-top: 1px solid rgba(37,99,235,.12); border-right: 1px solid rgba(37,99,235,.12); }
.easter-bubble strong { color: #1d4ed8; font-size: .96rem; }
.easter-bubble span { color: var(--muted); font-size: .82rem; }
@keyframes ripple { from { transform: scale(.86); opacity: .8; } to { transform: scale(1.24); opacity: 0; } }
@keyframes bubblePop { from { opacity: 0; transform: translateY(8px) scale(.92); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes floatHint { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@media (max-width: 640px) { .easter-bubble { right: 0; bottom: 70px; } .easter-bubble::after { right: 22px; bottom: -7px; border: 0; } }
</style>
