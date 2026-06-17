<script setup lang="ts">
import * as echarts from 'echarts';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import studentsData from '../data/students.json';
import cityCoords from '../data/cityCoords.json';
import FilterPanel from './FilterPanel.vue';
import { buildCityPoints, distributionToMapData, getPointSymbolSize, type CoordMap } from '../utils/mapData';
import {
  filterStudents,
  getCityDistribution,
  getProvinceDistribution,
  type CategoryFilter,
  type LocationMode,
  type RegionDistribution,
  type Student,
} from '../utils/statistics';

const students = studentsData as Student[];
const coords = cityCoords as unknown as CoordMap;
const props = defineProps<{ active: boolean; paused: boolean }>();
const chartEl = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | undefined;
let mapsLoaded = false;
let hasResizeListener = false;
let activationId = 0;
const category = ref<CategoryFilter>('全部');
const dimension = ref<'province' | 'city'>('province');
const mode = ref<LocationMode>('destination');
const keyword = ref('');
const selectedRegion = ref<RegionDistribution | undefined>();

const filtered = computed(() => filterStudents(students, { category: category.value, keyword: keyword.value }));
const distribution = computed(() =>
  dimension.value === 'province'
    ? getProvinceDistribution(filtered.value, mode.value)
    : getCityDistribution(filtered.value, mode.value),
);
const shouldRunChart = computed(() => props.active && !props.paused);
const placeholderText = computed(() => props.paused ? '视频播放中，地图动画已暂停' : '滚动到本页后加载地图');

async function loadMap() {
  if (mapsLoaded) return;
  const [provinceRes, cityRes] = await Promise.all([
    fetch(`${import.meta.env.BASE_URL}maps/china.json`),
    fetch(`${import.meta.env.BASE_URL}maps/china-cities.json`),
  ]);
  echarts.registerMap('china', await provinceRes.json());
  echarts.registerMap('china-cities', await cityRes.json());
  mapsLoaded = true;
}

function option() {
  const cityPoints = buildCityPoints(filtered.value, mode.value, coords);
  const mapName = dimension.value === 'city' ? 'china-cities' : 'china';
  const max = Math.max(1, ...distribution.value.map((item) => item.count));
  return {
    tooltip: {
      trigger: 'item',
      borderWidth: 0,
      backgroundColor: 'rgba(255,255,255,.96)',
      formatter(params: any) {
        if (!params.data) return params.name;
        const group = params.data.students || [];
        return `<b>${params.name}</b><br/>同学人数：${params.data.count || params.data.value || group.length}`;
      },
    },
    visualMap: {
      show: true,
      min: 0,
      max,
      left: 12,
      bottom: 10,
      calculable: false,
      inRange: { color: ['#eef6ff', '#bfdbfe', '#60a5fa', '#2563eb'] },
      textStyle: { color: '#64748b' },
    },
    geo: { map: mapName, zoom: dimension.value === 'city' ? 1.02 : 1.08, roam: false, itemStyle: { areaColor: '#eef6ff', borderColor: '#bdd7ef', borderWidth: dimension.value === 'city' ? .55 : 1 }, emphasis: { itemStyle: { areaColor: '#fed7aa' } }, label: { show: dimension.value === 'province', color: '#8aa0b8', fontSize: 10 } },
    series: [
      {
        name: '地区分布',
        type: 'map',
        map: mapName,
        geoIndex: 0,
        selectedMode: 'single',
        data: distributionToMapData(distribution.value),
        emphasis: { itemStyle: { areaColor: '#fbbf24', shadowBlur: 18, shadowColor: 'rgba(245,158,11,.42)' } },
      },
      {
        name: '城市分布',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 3,
        rippleEffect: { brushType: 'stroke', scale: 3.2 },
        symbolSize: getPointSymbolSize,
        itemStyle: { color: '#06b6d4', shadowBlur: 16, shadowColor: '#06b6d4' },
        data: dimension.value === 'city' ? cityPoints : [],
      },
    ],
  };
}

function updateChart() {
  if (!chartEl.value) return;
  if (!chart) {
    chart = echarts.init(chartEl.value);
    chart.on('click', (params: any) => {
      const name = params.name;
      selectedRegion.value = distribution.value.find((item) => item.name === name);
    });
  }
  chart.setOption(option(), true);
  selectedRegion.value = distribution.value[0];
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
  updateChart();
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
watch([category, dimension, mode, keyword], () => {
  if (props.active && !props.paused) updateChart();
});
onBeforeUnmount(() => {
  activationId += 1;
  disposeChart();
});
</script>

<template>
  <section class="section overview-section">
    <div class="section-inner">
      <header class="section-header fade-up">
        <h2 class="section-title">毕业去向总览</h2>
        <p class="section-subtitle">看看大家现在都在哪儿。</p>
      </header>
      <div class="grid-two">
        <div class="map-card glass">
          <div v-if="shouldRunChart" ref="chartEl" class="map-chart"></div>
          <div v-else class="map-placeholder">{{ placeholderText }}</div>
        </div>
        <FilterPanel v-model:category="category" v-model:dimension="dimension" v-model:mode="mode" v-model:keyword="keyword" :selected-region="selectedRegion" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.overview-section { padding-top: clamp(18px, 2vw, 32px); padding-bottom: clamp(18px, 2vw, 32px); }
.overview-section :deep(.section-title) { font-size: clamp(1.8rem, 3.6vw, 4rem); }
.map-placeholder { min-height: 560px; display: grid; place-items: center; color: var(--muted); font-weight: 800; text-align: center; }
.overview-section { justify-content: center; }
@media (max-width: 860px) { .overview-section { justify-content: flex-start; padding-top: 44px; } }
</style>
