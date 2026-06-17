<script setup lang="ts">
import type { CategoryFilter, RegionDistribution } from '../utils/statistics';
import { CATEGORY_LABELS, getCompactJourneyDisplayText, getDisplayRoleOrMajor } from '../utils/statistics';
import { categoryClass } from './categoryStyles';

const props = defineProps<{
  category: CategoryFilter;
  dimension: 'province' | 'city';
  mode: 'hometown' | 'destination';
  keyword: string;
  selectedRegion?: RegionDistribution;
}>();
const emit = defineEmits<{
  'update:category': [value: CategoryFilter];
  'update:dimension': [value: 'province' | 'city'];
  'update:mode': [value: 'hometown' | 'destination'];
  'update:keyword': [value: string];
}>();
const categories: CategoryFilter[] = ['全部', ...CATEGORY_LABELS];
</script>

<template>
  <aside class="filter-panel glass">
    <div class="panel-block">
      <h3>去向类别</h3>
      <div class="chip-row">
        <button v-for="item in categories" :key="item" class="chip" :class="{ active: props.category === item }" @click="emit('update:category', item)">{{ item }}</button>
      </div>
    </div>
    <div class="panel-block split">
      <div>
        <h3>地点维度</h3>
        <button class="toggle" :class="{ active: dimension === 'province' }" @click="emit('update:dimension', 'province')">按省份</button>
        <button class="toggle" :class="{ active: dimension === 'city' }" @click="emit('update:dimension', 'city')">按城市</button>
      </div>
      <div>
        <h3>地图模式</h3>
        <button class="toggle" :class="{ active: mode === 'hometown' }" @click="emit('update:mode', 'hometown')">看籍贯分布</button>
        <button class="toggle" :class="{ active: mode === 'destination' }" @click="emit('update:mode', 'destination')">看毕业去向</button>
      </div>
    </div>
    <div class="panel-block">
      <h3>搜索</h3>
      <input :value="keyword" placeholder="搜索姓名 / 城市 / 学校 / 公司" @input="emit('update:keyword', ($event.target as HTMLInputElement).value)" />
    </div>
    <div class="panel-block detail" v-if="selectedRegion">
      <h3>{{ selectedRegion.name }}</h3>
      <p class="count">{{ selectedRegion.count }} 位同学</p>
      <div class="mini-counts">
        <span v-for="item in CATEGORY_LABELS" :key="item" class="tag" :class="categoryClass(item)">{{ item }} {{ selectedRegion.categoryCounts[item] }}</span>
      </div>
      <div class="mini-list">
        <div v-for="student in selectedRegion.students" :key="student.name" class="mini-card">
          <strong>{{ student.name }}</strong>
          <span>{{ getCompactJourneyDisplayText(student) }} · {{ getDisplayRoleOrMajor(student.roleOrMajor) }}</span>
        </div>
      </div>
    </div>
    <div class="panel-block detail empty" v-else>
      <h3>地区详情</h3>
      <p>点击地图上的地区或点位查看同学分布。</p>
    </div>
  </aside>
</template>

<style scoped>
.filter-panel { padding: 22px; height: min(78vh, 800px); overflow-y: auto; display: flex; flex-direction: column; }
.panel-block + .panel-block { margin-top: 22px; padding-top: 20px; border-top: 1px solid rgba(37,99,235,.12); }
h3 { margin: 0 0 12px; font-size: .98rem; color: #1e3a8a; }
.chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
.chip, .toggle { border: 1px solid rgba(37,99,235,.16); background: rgba(255,255,255,.74); color: #334155; border-radius: 999px; padding: 8px 12px; font-size: .88rem; transition: .2s; }
.chip.active, .toggle.active { color: white; background: linear-gradient(135deg, #2563eb, #06b6d4); box-shadow: 0 10px 24px rgba(37,99,235,.22); }
.split { display: grid; grid-template-columns: 1fr; gap: 16px; }
.toggle { display: block; width: 100%; margin: 8px 0; text-align: left; }
input { width: 100%; border: 1px solid rgba(37,99,235,.16); background: rgba(255,255,255,.82); border-radius: 16px; padding: 12px 14px; outline: none; color: var(--text); }
input:focus { border-color: rgba(37,99,235,.45); box-shadow: 0 0 0 4px rgba(37,99,235,.08); }
.count { margin: 0 0 12px; color: var(--muted); }
.mini-counts { display: flex; flex-wrap: wrap; gap: 7px; }
.mini-counts .tag { font-size: .72rem; min-height: 24px; }
.mini-list { margin-top: 14px; display: grid; gap: 10px; max-height: 280px; overflow-y: auto; padding-right: 6px; }
.mini-card { padding: 11px 12px; border-radius: 16px; background: rgba(255,255,255,.64); display: grid; gap: 4px; }
.mini-card span, .empty p { color: var(--muted); font-size: .85rem; }
.filter-panel::-webkit-scrollbar, .mini-list::-webkit-scrollbar { width: 6px; }
.filter-panel::-webkit-scrollbar-thumb, .mini-list::-webkit-scrollbar-thumb { background: rgba(37,99,235,.28); border-radius: 999px; }
@media (max-width: 860px) { .filter-panel { height: auto; max-height: none; overflow: visible; border-radius: 24px; } }
</style>
