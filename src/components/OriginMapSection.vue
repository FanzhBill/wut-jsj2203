<script setup lang="ts">
import * as echarts from 'echarts';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import studentsData from '../data/students.json';
import cityCoords from '../data/cityCoords.json';
import { buildCityPoints, buildInboundLines, WHUT_COORD, type CoordMap } from '../utils/mapData';
import { getCoreStats, getMapProvinceName, type Student } from '../utils/statistics';

const students = studentsData as Student[];
const coords = cityCoords as unknown as CoordMap;
const props = defineProps<{ active: boolean; paused: boolean }>();
const chartEl = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | undefined;
let mapLoaded = false;
let hasResizeListener = false;
let activationId = 0;
const stats = computed(() => getCoreStats(students));
const base = import.meta.env.BASE_URL;
const shouldRunChart = computed(() => props.active && !props.paused);
const placeholderText = computed(() => props.paused ? '视频播放中，地图动画已暂停' : '滚动到本页后加载地图');

async function loadMap() {
  if (mapLoaded) return;
  const res = await fetch(`${base}maps/china.json`);
  echarts.registerMap('china', await res.json());
  mapLoaded = true;
}

function renderChart() {
  if (!chartEl.value) return;
  if (chart) chart.dispose();
  chart = echarts.init(chartEl.value);
  const points = buildCityPoints(students, 'hometown', coords);
  const lines = buildInboundLines(students, coords);
  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      borderWidth: 0,
      backgroundColor: 'rgba(255,255,255,.94)',
      textStyle: { color: '#172033' },
      formatter(params: any) {
        if (params.seriesType === 'effectScatter') {
          const names = params.data.students.map((s: Student) => s.name).join('、');
          return `<b>${params.name}</b><br/>来自这里：${params.data.count} 人<br/>${names}`;
        }
        return params.name;
      },
    },
    geo: {
      map: 'china',
      roam: false,
      zoom: 1.1,
      itemStyle: { areaColor: '#e8f1fb', borderColor: '#b9d3ef', borderWidth: 1 },
      emphasis: { itemStyle: { areaColor: '#dbeafe' }, label: { color: '#1e3a8a' } },
      label: { show: true, color: '#8aa0b8', fontSize: 10 },
    },
    series: [
      {
        name: '籍贯省份高亮',
        type: 'map',
        map: 'china',
        geoIndex: 0,
        data: Array.from(new Set(students.map((s) => getMapProvinceName(s.hometownProvince)))).map((name) => ({ name, value: 1 })),
        itemStyle: { areaColor: '#bfdbfe' },
        emphasis: { itemStyle: { areaColor: '#93c5fd' } },
      },
      {
        name: '汇聚武汉',
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 2,
        effect: { show: true, period: 4, trailLength: 0.22, symbol: 'path://M2,2 L18,10 L2,18 L6,10 Z', symbolSize: 10, color: '#f59e0b' },
        lineStyle: { color: '#2563eb', width: 1.4, opacity: 0.42, curveness: 0.22 },
        data: lines,
      },
      {
        name: '籍贯城市',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 3,
        rippleEffect: { brushType: 'stroke', scale: 3.5 },
        symbolSize: (value: number[]) => Math.min(26, 9 + Math.sqrt(value[2] || 1) * 6),
        itemStyle: { color: '#2563eb', shadowBlur: 18, shadowColor: '#2563eb' },
        data: points,
      },
      {
        name: '武汉理工大学',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 4,
        symbolSize: 22,
        rippleEffect: { scale: 4 },
        itemStyle: { color: '#f59e0b', shadowBlur: 24, shadowColor: '#f59e0b' },
        data: [{ name: '武汉理工大学', value: [...WHUT_COORD, students.length] }],
      },
    ],
  });
}

function resize() { chart?.resize(); }

function addResizeListener() {
  if (hasResizeListener) return;
  window.addEventListener('resize', resize);
  hasResizeListener = true;
}

function removeResizeListener() {
  if (!hasResizeListener) return;
  window.removeEventListener('resize', resize);
  hasResizeListener = false;
}

function disposeChart() {
  removeResizeListener();
  chart?.dispose();
  chart = undefined;
}

async function activateChart() {
  const currentActivation = ++activationId;
  if (!shouldRunChart.value) {
    disposeChart();
    return;
  }

  await loadMap();
  await nextTick();

  if (currentActivation !== activationId || !shouldRunChart.value) return;
  renderChart();
  addResizeListener();
}

watch(
  () => [props.active, props.paused] as const,
  () => {
    if (props.active && !props.paused) {
      void activateChart();
    } else {
      activationId += 1;
      disposeChart();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  activationId += 1;
  disposeChart();
});
</script>

<template>
  <section class="section origin-section">
    <div class="section-inner">
      <header class="section-header fade-up">
        <h2 class="section-title">2022 · 我们从哪里来</h2>
        <p class="section-subtitle">2022 年，天南海北，最终在武汉相遇。</p>
      </header>
      <div class="origin-layout map-stage">
        <div class="map-card glass">
          <div v-if="shouldRunChart" ref="chartEl" class="map-chart"></div>
          <div v-else class="map-placeholder">{{ placeholderText }}</div>
        </div>
        <aside class="whut-card glass">
          <img :src="`${base}images/whut-campus.jpg`" alt="武汉理工大学校园图片" />
          <h3>武汉理工大学</h3>
          <p>故事开始的地方</p>
          <strong>来自 {{ stats.hometownRegionCount }} 个省市的我们，在这里相遇</strong>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.origin-section { padding-top: clamp(18px, 2vw, 32px); padding-bottom: clamp(18px, 2vw, 32px); }
.origin-section :deep(.section-title) { font-size: clamp(1.8rem, 3.6vw, 4rem); }
.origin-layout { position: relative; }
.map-placeholder { min-height: 560px; display: grid; place-items: center; color: var(--muted); font-weight: 800; text-align: center; }
.whut-card { position: absolute; left: clamp(16px, 2vw, 30px); bottom: clamp(16px, 2vw, 30px); z-index: 3; width: min(420px, 36vw); padding: 13px; display: grid; grid-template-columns: 104px 1fr; column-gap: 14px; align-items: center; animation: popIn .75s var(--ease) .35s both; }
.whut-card img { width: 104px; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 16px; display: block; grid-row: span 3; }
h3 { margin: 0; color: #1e3a8a; font-size: 1.22rem; }
p { color: var(--muted); margin: 4px 0 6px; }
strong { color: #10213f; font-size: .9rem; line-height: 1.45; }
@keyframes popIn { from { opacity: 0; transform: scale(.92) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@media (max-width: 860px) { .whut-card { position: relative; left: auto; bottom: auto; width: 100%; max-width: 420px; margin: 14px auto 0; } }
</style>
