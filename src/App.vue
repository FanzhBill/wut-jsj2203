<script setup lang="ts">
import { onMounted, ref } from 'vue';
import HeroSection from './components/HeroSection.vue';
import OriginMapSection from './components/OriginMapSection.vue';
import DestinationMapSection from './components/DestinationMapSection.vue';
import OverviewMapSection from './components/OverviewMapSection.vue';
import StudentCardsSection from './components/StudentCardsSection.vue';
import PhotoWallSection from './components/PhotoWallSection.vue';
import VideoControl from './components/VideoControl.vue';
import SectionNav from './components/SectionNav.vue';

const sections = [
  { id: 'hero', label: '封面' },
  { id: 'origin', label: '从哪里来' },
  { id: 'destination', label: '到哪里去' },
  { id: 'overview', label: '总览' },
  { id: 'students', label: '同学' },
  { id: 'photos', label: '照片' },
];
const activeIndex = ref(0);
const videoActive = ref(false);

function scrollToSection(index: number) {
  if (videoActive.value) return;
  document.getElementById(sections[index].id)?.scrollIntoView({ behavior: 'smooth' });
}

function startEasterEggVideo() {
  document.getElementById('hero')?.scrollIntoView({ behavior: 'auto' });
  activeIndex.value = 0;
  videoActive.value = true;
}

function stopEasterEggVideo() {
  videoActive.value = false;
}

function toggleEasterEggVideo() {
  if (videoActive.value) {
    stopEasterEggVideo();
  } else {
    startEasterEggVideo();
  }
}

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) {
        const index = sections.findIndex((section) => section.id === visible.target.id);
        if (index >= 0) activeIndex.value = index;
      }
    },
    { threshold: [0.45, 0.65] },
  );
  sections.forEach((section) => {
    const element = document.getElementById(section.id);
    if (element) observer.observe(element);
  });
});
</script>

<template>
  <main class="app-shell" :class="{ 'scroll-locked': videoActive }">
    <HeroSection id="hero" :active="videoActive" @ended="stopEasterEggVideo" />
    <OriginMapSection id="origin" :active="activeIndex === 1" :paused="videoActive" />
    <DestinationMapSection id="destination" :active="activeIndex === 2" :paused="videoActive" />
    <OverviewMapSection id="overview" :active="activeIndex === 3" :paused="videoActive" />
    <StudentCardsSection id="students" />
    <PhotoWallSection id="photos" :active="activeIndex === 5" :paused="videoActive" />
  </main>
  <VideoControl :active="videoActive" @toggle="toggleEasterEggVideo" />
  <SectionNav :sections="sections" :active-index="activeIndex" :disabled="videoActive" @navigate="scrollToSection" />
</template>
