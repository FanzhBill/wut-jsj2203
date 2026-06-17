<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ active: boolean; paused: boolean }>();
const base = import.meta.env.BASE_URL;
const photos = ['images/photos/class-photo-01.webp', 'images/photos/class-photo-02.webp', 'images/photos/class-photo-03.webp', 'images/photos/class-photo-04.webp', 'images/photos/class-photo-05.webp', 'images/photos/class-photo-06.webp', 'images/photos/class-photo-07.webp', 'images/photos/class-photo-08.webp', 'images/photos/class-photo-09.webp', 'images/photos/class-photo-10.webp', 'images/photos/class-photo-11.webp', 'images/photos/class-photo-12.webp', 'images/photos/class-photo-13.webp', 'images/photos/class-photo-14.webp', 'images/photos/class-photo-15.webp', 'images/photos/class-photo-16.webp', 'images/photos/class-photo-17.webp', 'images/photos/class-photo-18.webp', 'images/photos/class-photo-19.webp', 'images/photos/class-photo-20.webp', 'images/photos/class-photo-21.webp', 'images/photos/class-photo-22.webp', 'images/photos/class-photo-23.webp', 'images/photos/class-photo-24.webp', 'images/photos/class-photo-25.webp', 'images/photos/class-photo-26.webp', 'images/photos/class-photo-27.webp', 'images/photos/class-photo-28.webp', 'images/photos/class-photo-29.webp', 'images/photos/class-photo-30.webp', 'images/photos/class-photo-31.webp', 'images/photos/class-photo-32.webp', 'images/photos/class-photo-33.webp', 'images/photos/class-photo-34.webp', 'images/photos/class-photo-35.webp', 'images/photos/class-photo-36.webp'];
const shouldRenderWall = computed(() => props.active && !props.paused);
const duplicate = (items: string[]) => [...items, ...items];
const rowA = duplicate(photos.slice(0, 12));
const rowB = duplicate(photos.slice(12, 24).reverse());
const rowC = duplicate([...photos.slice(24, 36)]);
const placeholderText = computed(() => props.paused ? '视频播放中，照片墙已暂停' : '滚动到本页后加载照片墙');
</script>

<template>
  <section class="section photo-section">
    <div class="section-inner">
      <header class="section-header fade-up">
        <h2 class="section-title">那些闪闪发光的日子</h2>
        <p class="section-subtitle">青春存档中……每一帧都是计算机2203班的独家记忆。</p>
      </header>
    </div>
    <div v-if="shouldRenderWall" class="wall">
      <div class="photo-row row-a">
        <img v-for="(photo, index) in rowA" :key="`a-${index}`" :src="`${base}${photo}`" alt="计算机2203班回忆照片" loading="lazy" decoding="async" />
      </div>
      <div class="photo-row row-b">
        <img v-for="(photo, index) in rowB" :key="`b-${index}`" :src="`${base}${photo}`" alt="计算机2203班校园与毕业照片" loading="lazy" decoding="async" />
      </div>
      <div class="photo-row row-c">
        <img v-for="(photo, index) in rowC" :key="`c-${index}`" :src="`${base}${photo}`" alt="计算机2203班毕业瞬间照片" loading="lazy" decoding="async" />
      </div>
    </div>
    <div v-else class="photo-placeholder glass">{{ placeholderText }}</div>
    <p class="ending">愿此去繁花似锦，再相逢依旧如故。</p>
  </section>
</template>

<style scoped>
.photo-section { justify-content: center; }
.wall { position: relative; z-index: 1; width: 100%; display: grid; gap: 20px; margin-top: 8px; overflow: hidden; }
.photo-placeholder { position: relative; z-index: 1; min-height: min(52vh, 520px); width: min(900px, calc(100% - 32px)); margin: 8px auto 0; display: grid; place-items: center; color: var(--muted); font-weight: 800; text-align: center; }
.photo-row { display: flex; gap: 20px; width: max-content; animation: marquee 34s linear infinite; }
.row-b { animation-name: marqueeReverse; animation-duration: 42s; }
.row-c { animation-duration: 38s; transform: translateX(-12%); }
.wall:hover .photo-row { animation-play-state: paused; }
img { width: clamp(230px, 28vw, 390px); aspect-ratio: 16 / 10.4; object-fit: cover; border-radius: 24px; box-shadow: 0 22px 54px rgba(30,64,175,.16); transition: transform .25s; }
img:hover { transform: scale(1.035); }
.ending { position: relative; z-index: 1; margin: 30px 0 0; text-align: center; color: #1e3a8a; font-size: clamp(1.1rem, 2vw, 1.5rem); font-weight: 800; }
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes marqueeReverse { from { transform: translateX(-50%); } to { transform: translateX(0); } }
@media (max-width: 640px) { .photo-row { animation-duration: 52s; } .row-b { animation-duration: 60s; } .row-c { animation-duration: 56s; } }
</style>
