<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { getHeroTextHidden, getVideoPlaybackLabel } from '../utils/videoState';

const props = defineProps<{ active: boolean }>();
const emit = defineEmits<{ ended: [] }>();
const base = import.meta.env.BASE_URL;
const videoPath = `${base}videos/hero-video.mp4`;
const videoRef = ref<HTMLVideoElement | null>(null);
const shouldLoadVideo = ref(false);
const isPreparing = ref(false);
const isBuffering = ref(false);
const isPlaying = ref(false);
let playRequestId = 0;

const videoSource = computed(() => videoPath);
const hideHeroText = computed(() => getHeroTextHidden({
  requested: props.active,
  preparing: isPreparing.value,
  buffering: isBuffering.value,
  playing: isPlaying.value,
}));
const playbackLabel = computed(() => getVideoPlaybackLabel({
  requested: props.active,
  preparing: isPreparing.value,
  buffering: isBuffering.value,
  playing: isPlaying.value,
}));

function waitForPlayable(video: HTMLVideoElement) {
  if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) return Promise.resolve();

  return new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      video.removeEventListener('canplaythrough', finish);
      video.removeEventListener('canplay', finish);
      video.removeEventListener('loadeddata', finish);
      window.clearTimeout(timer);
      resolve();
    };
    const timer = window.setTimeout(finish, 8000);
    video.addEventListener('canplaythrough', finish, { once: true });
    video.addEventListener('canplay', finish, { once: true });
    video.addEventListener('loadeddata', finish, { once: true });
  });
}

function resetPlaybackState() {
  isPreparing.value = false;
  isBuffering.value = false;
  isPlaying.value = false;
}

async function startVideo() {
  const requestId = ++playRequestId;
  shouldLoadVideo.value = true;
  isPreparing.value = true;
  isBuffering.value = false;
  isPlaying.value = false;

  await nextTick();

  const video = videoRef.value;
  if (!video || !props.active || requestId !== playRequestId) return;

  video.pause();
  video.muted = false;
  video.preload = 'auto';
  await waitForPlayable(video);
  video.currentTime = 0;

  if (!props.active || requestId !== playRequestId) return;

  try {
    await video.play();
    isPlaying.value = true;
    isPreparing.value = false;
  } catch {
    resetPlaybackState();
    emit('ended');
  }
}

function stopVideo(reset = false) {
  playRequestId += 1;
  resetPlaybackState();
  if (!videoRef.value) return;
  videoRef.value.pause();
  if (reset) videoRef.value.currentTime = 0;
}

watch(
  () => props.active,
  async (active) => {
    if (active) {
      await startVideo();
    } else {
      stopVideo(true);
    }
  },
);

function handlePlaying() {
  isPreparing.value = false;
  isBuffering.value = false;
  isPlaying.value = true;
}

function handleWaiting() {
  if (props.active && isPlaying.value) isBuffering.value = true;
}

function handleCanPlay() {
  isBuffering.value = false;
}

function handleEnded() {
  stopVideo(true);
  emit('ended');
}
</script>

<template>
  <section class="section hero-section" :class="{ 'video-mode': hideHeroText }">
    <video
      v-show="active || isPreparing || isPlaying"
      ref="videoRef"
      class="hero-video"
      playsinline
      preload="auto"
      :poster="`${base}images/whut-campus.jpg`"
      :src="shouldLoadVideo ? videoSource : undefined"
      @playing="handlePlaying"
      @waiting="handleWaiting"
      @canplay="handleCanPlay"
      @canplaythrough="handleCanPlay"
      @ended="handleEnded"
    />
    <div class="hero-overlay"></div>
    <div v-if="!hideHeroText" class="hero-content fade-up">
      <h1>我们散落在中国地图上的夏天</h1>
      <p class="hero-subtitle">武汉理工大学 · 计算机与人工智能学院 · 计算机2203班毕业去向纪念页</p>
      <p class="hero-copy">从五湖四海而来，奔赴下一段山海。</p>
    </div>
    <div class="video-loading" v-if="playbackLabel">{{ playbackLabel }}</div>
    <div v-if="!hideHeroText" class="scroll-cue">向下滑动开启旅程</div>
  </section>
</template>

<style scoped>
.hero-section { align-items: center; text-align: center; color: white; background: linear-gradient(135deg, #18325d, #5a85c8 52%, #f8c56a); }
.hero-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .96; }
.hero-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(12,24,50,.5), rgba(12,24,50,.22) 45%, rgba(12,24,50,.58)); transition: background .35s var(--ease); }
.hero-section.video-mode .hero-overlay { background: linear-gradient(180deg, rgba(12,24,50,.08), rgba(12,24,50,.02) 45%, rgba(12,24,50,.14)); }
.hero-content { position: relative; z-index: 1; max-width: 980px; padding: 0 16px; transition: opacity .35s var(--ease), transform .35s var(--ease); }
h1 { margin: 0; font-size: clamp(2.7rem, 7vw, 6.8rem); line-height: .98; letter-spacing: -0.08em; text-shadow: 0 20px 56px rgba(0,0,0,.35); }
.hero-subtitle { animation: fadeUp .9s var(--ease) .25s both; margin: 24px 0 0; font-size: clamp(1rem, 2vw, 1.35rem); opacity: .95; }
.hero-copy { animation: fadeUp .9s var(--ease) .48s both; margin: 14px 0 0; font-size: clamp(1.05rem, 2.1vw, 1.5rem); color: #fff5df; }
.scroll-cue { position: absolute; z-index: 1; bottom: 32px; left: 50%; transform: translateX(-50%); font-size: .95rem; letter-spacing: .12em; opacity: .9; animation: heroFloat 1.8s ease-in-out infinite; transition: opacity .25s var(--ease); }
.video-loading { position: absolute; z-index: 2; left: 50%; bottom: 34px; transform: translateX(-50%); padding: 10px 16px; border-radius: 999px; background: rgba(255,255,255,.84); color: #1e3a8a; font-weight: 800; box-shadow: 0 16px 36px rgba(15,23,42,.18); }
.scroll-cue::after { content: ""; display: block; width: 1px; height: 34px; margin: 12px auto 0; background: linear-gradient(transparent, white); }
@keyframes heroFloat { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -8px); } }
@media (max-width: 640px) { h1 { font-size: clamp(2.2rem, 14vw, 4rem); } .hero-subtitle { line-height: 1.55; } }
</style>
