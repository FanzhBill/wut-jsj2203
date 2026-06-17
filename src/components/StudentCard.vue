<script setup lang="ts">
import { computed } from 'vue';
import type { Student } from '../utils/statistics';
import { formatLocation, getDisplayRoleOrMajor, getJourneyDisplayText } from '../utils/statistics';
import { categoryClass } from './categoryStyles';

const props = defineProps<{ student: Student }>();
const isDream = computed(() => props.student.category === '追梦');
const mainText = computed(() => getJourneyDisplayText(props.student));
const subText = computed(() => getDisplayRoleOrMajor(props.student.roleOrMajor));
const hometownText = computed(() => formatLocation(props.student.hometownProvince, props.student.hometownCity));
const destinationText = computed(() => formatLocation(props.student.destinationProvince, props.student.destinationCity));
</script>

<template>
  <article class="student-card">
    <div class="card-top">
      <h3>{{ student.showName === false ? '匿名同学' : student.name }}</h3>
      <span class="tag" :class="categoryClass(student.category)">{{ student.category }}</span>
    </div>
    <p class="destination" :class="{ encouragement: isDream }">{{ mainText }}</p>
    <p class="major">{{ subText }}</p>
    <div class="meta">
      <span>籍贯：{{ hometownText }}</span>
      <span>去向：{{ destinationText }}</span>
    </div>
  </article>
</template>

<style scoped>
.student-card { position: relative; overflow: hidden; padding: 22px; min-height: 190px; border-radius: 24px; background: rgba(255,255,255,.78); border: 1px solid rgba(37,99,235,.13); box-shadow: 0 14px 38px rgba(30,64,175,.08); transition: transform .28s var(--ease), box-shadow .28s var(--ease), border-color .28s; }
.student-card::after { content: ""; position: absolute; inset: -60% auto auto -30%; width: 170px; height: 170px; background: radial-gradient(circle, rgba(56,189,248,.34), transparent 65%); opacity: 0; transition: opacity .25s; }
.student-card:hover { transform: translateY(-8px); box-shadow: 0 24px 60px rgba(30,64,175,.16); border-color: rgba(6,182,212,.38); }
.student-card:hover::after { opacity: 1; }
.card-top { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
h3 { margin: 0; font-size: 1.32rem; color: #10213f; }
.destination { margin: 22px 0 6px; font-weight: 800; font-size: 1.08rem; color: var(--primary); }
.destination.encouragement { color: #c2410c; line-height: 1.55; }
.major { margin: 0 0 18px; color: var(--muted); }
.meta { display: grid; gap: 8px; color: #334155; font-size: .93rem; }
</style>
