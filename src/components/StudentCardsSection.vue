<script setup lang="ts">
import { computed, ref } from 'vue';
import studentsData from '../data/students.json';
import StudentCard from './StudentCard.vue';
import { CATEGORY_LABELS, filterStudents, type CategoryFilter, type Student } from '../utils/statistics';

const students = studentsData as Student[];
const category = ref<CategoryFilter>('全部');
const keyword = ref('');
const categories: CategoryFilter[] = ['全部', ...CATEGORY_LABELS];
const filteredStudents = computed(() => filterStudents(students, { category: category.value, keyword: keyword.value }));
</script>

<template>
  <section class="section cards-section">
    <div class="section-inner">
      <header class="section-header fade-up">
        <h2 class="section-title">每个人，都是一段独特的旅程</h2>
        <p class="section-subtitle">按类别或关键词查找同学的下一站。</p>
      </header>
      <div class="cards-toolbar glass">
        <div class="chips">
          <button v-for="item in categories" :key="item" :class="{ active: category === item }" @click="category = item">{{ item }}</button>
        </div>
        <input v-model="keyword" placeholder="搜索姓名、城市、学校、公司" />
      </div>
      <div class="student-grid">
        <StudentCard v-for="student in filteredStudents" :key="student.name" :student="student" />
      </div>
      <p class="privacy-note">本页面仅用于武汉理工大学计算机与人工智能学院计算机2203班毕业纪念展示，数据来自同学自愿填写。如需修改或隐藏个人信息，请联系页面维护者。</p>
    </div>
  </section>
</template>

<style scoped>
.cards-section { justify-content: flex-start; padding-top: clamp(42px, 6vw, 82px); }
.cards-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px; margin-bottom: 22px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
button { border: 1px solid rgba(37,99,235,.16); border-radius: 999px; padding: 8px 12px; background: rgba(255,255,255,.72); color: #334155; }
button.active { color: white; background: linear-gradient(135deg, #2563eb, #06b6d4); }
input { min-width: min(320px, 100%); border: 1px solid rgba(37,99,235,.16); background: rgba(255,255,255,.78); border-radius: 999px; padding: 11px 14px; outline: none; }
.student-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
@media (max-width: 1050px) { .student-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .cards-toolbar { display: grid; } .student-grid { grid-template-columns: 1fr; } input { min-width: 0; width: 100%; } }
</style>
