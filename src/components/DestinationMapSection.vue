<script setup lang="ts">
import * as echarts from 'echarts';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import studentsData from '../data/students.json';
import cityCoords from '../data/cityCoords.json';
import { buildCityPoints, buildOutboundLines, buildWuhanLoopLines, getPointSymbolSize, WHUT_COORD, type CoordMap } from '../utils/mapData';
import { getCategoryCounts, getCompactJourneyDisplayText, getDisplayRoleOrMajor, getMapProvinceName, type Student } from '../utils/statistics';

const students = studentsData as Student[];
const coords = cityCoords as unknown as CoordMap;
const props = defineProps<{ active: boolean; paused: boolean }>();
const base = import.meta.env.BASE_URL;
const chartEl = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | undefined;
let activeTooltipCity = '';
let handledCityPointClick = false;
let mapLoaded = false;
let hasResizeListener = false;
let activationId = 0;
const shouldRunChart = computed(() => props.active && !props.paused);
const placeholderText = computed(() => props.paused ? '视频播放中，地图动画已暂停' : '滚动到本页后加载地图');

function hideActiveTooltip() {
  activeTooltipCity = '';
  chart?.dispatchAction({ type: 'hideTip' });
}

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
  const points = buildCityPoints(students, 'destination', coords);
  const lines = buildOutboundLines(students, coords);
  const wuhanLoops = buildWuhanLoopLines(students);
  chart.on('click', (params: any) => {
    if (params.seriesName === '去向城市' && params.data?.students) {
      handledCityPointClick = true;
      const cityName = params.name as string;
      if (activeTooltipCity === cityName) {
        hideActiveTooltip();
        return;
      }
      activeTooltipCity = cityName;
      chart?.dispatchAction({ type: 'showTip', seriesIndex: params.seriesIndex, dataIndex: params.dataIndex });
      return;
    }
    hideActiveTooltip();
  });
  chart.getZr().on('click', () => {
    // ECharts click events may not fire on blank geo/canvas areas.
    // Defer until ECharts series click has had a chance to mark city-point clicks.
    window.setTimeout(() => {
      if (!handledCityPointClick) hideActiveTooltip();
      handledCityPointClick = false;
    }, 0);
  });
  chart.setOption({
    tooltip: {
      trigger: 'item',
      triggerOn: 'none',
      enterable: true,
      alwaysShowContent: true,
      confine: true,
      hideDelay: 100000,
      borderWidth: 0,
      backgroundColor: 'rgba(255,255,255,.96)',
      textStyle: { color: '#172033' },
      extraCssText: 'box-shadow: 0 18px 48px rgba(30,64,175,.18); border-radius: 18px; pointer-events: auto;',
      position(_point: number[], _params: any, _dom: HTMLElement, _rect: any, size: any) {
        return [Math.max(12, size.viewSize[0] - size.contentSize[0] - 24), 24];
      },
      formatter(params: any) {
        if (params.seriesType === 'effectScatter') {
          const group = params.data.students as Student[];
          const counts = getCategoryCounts(group);
          const list = group.map((s) => `<div class="map-tip-row"><b>${s.name}</b><span>${getCompactJourneyDisplayText(s)} · ${getDisplayRoleOrMajor(s.roleOrMajor)}</span></div>`).join('');
          return `<div class="map-tip"><div class="map-tip-head"><b>${params.name}</b><span>${group.length} 位同学</span></div><div class="map-tip-counts">升学 ${counts['升学']}　就业 ${counts['就业']}　追梦 ${counts['追梦']}</div><div class="map-tip-list">${list}</div></div>`;
        }
        return params.name;
      },
    },
    geo: { map: 'china', zoom: 1.1, roam: false, itemStyle: { areaColor: '#eef6ff', borderColor: '#bdd7ef' }, emphasis: { itemStyle: { areaColor: '#dbeafe' } }, label: { show: true, color: '#8aa0b8', fontSize: 10 } },
    series: [
      { type: 'map', map: 'china', geoIndex: 0, data: Array.from(new Set(students.map((s) => getMapProvinceName(s.destinationProvince)).filter(Boolean))).map((name) => ({ name, value: 1 })), itemStyle: { areaColor: '#e0f2fe' }, emphasis: { itemStyle: { areaColor: '#bae6fd' } } },
      { name: '奔赴远方', type: 'lines', coordinateSystem: 'geo', zlevel: 2, effect: { show: true, period: 3.5, trailLength: .18, symbol: 'arrow', symbolSize: 8, color: '#06b6d4' }, lineStyle: { color: '#2563eb', width: 1.5, opacity: .48, curveness: .28 }, data: lines },
      { name: '留在武汉的回环', type: 'lines', coordinateSystem: 'geo', polyline: true, zlevel: 3, effect: { show: true, period: 4.2, trailLength: .08, symbol: 'arrow', symbolSize: 10, color: '#f59e0b' }, lineStyle: { color: '#f59e0b', width: 2.2, opacity: .72, curveness: 0 }, data: wuhanLoops },
      { name: '去向城市', type: 'effectScatter', coordinateSystem: 'geo', zlevel: 3, rippleEffect: { brushType: 'stroke', scale: 3.8 }, symbolSize: getPointSymbolSize, itemStyle: { color: '#06b6d4', shadowBlur: 18, shadowColor: '#06b6d4' }, data: points },
      { name: '出发点', type: 'scatter', coordinateSystem: 'geo', zlevel: 4, symbolSize: 20, itemStyle: { color: '#f59e0b', shadowBlur: 22, shadowColor: '#f59e0b' }, data: [{ name: '武汉理工大学', value: [...WHUT_COORD, students.length] }] },
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
  activeTooltipCity = '';
  handledCityPointClick = false;
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
  <section class="section destination-section">
    <div class="section-inner">
      <header class="section-header fade-up">
        <h2 class="section-title">2026 · 我们到哪里去</h2>
        <p class="section-subtitle">2026 年，从武汉出发，奔赴各自的远方。</p>
      </header>
      <div class="destination-stage">
        <div class="map-card glass">
          <div v-if="shouldRunChart" ref="chartEl" class="map-chart"></div>
          <div v-else class="map-placeholder">{{ placeholderText }}</div>
        </div>
        <aside class="start-bubble glass">
          <strong>武汉理工大学</strong>
          <span>从这里出发，奔赴远方</span>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.destination-section { padding-top: clamp(18px, 2vw, 32px); padding-bottom: clamp(18px, 2vw, 32px); }
.destination-section :deep(.section-title) { font-size: clamp(1.8rem, 3.6vw, 4rem); }
.destination-stage { position: relative; }
.map-placeholder { min-height: 560px; display: grid; place-items: center; color: var(--muted); font-weight: 800; text-align: center; }
.start-bubble { position: absolute; left: clamp(18px, 3vw, 42px); top: clamp(18px, 3vw, 42px); z-index: 3; display: grid; gap: 6px; padding: 16px 18px; color: #10213f; animation: fadeUp .75s var(--ease) .3s both; }
.start-bubble strong { color: #1e3a8a; font-size: 1.1rem; }
.start-bubble span { color: var(--muted); font-size: .9rem; }
@media (max-width: 860px) { .start-bubble { position: relative; left: auto; right: auto; top: auto; bottom: auto; width: 100%; margin-top: 12px; } }
:global(.map-tip) { width: min(360px, 78vw); max-height: 320px; color: #172033; }
:global(.map-tip-head) { display: flex; justify-content: space-between; gap: 14px; align-items: baseline; margin-bottom: 8px; color: #1e3a8a; }
:global(.map-tip-head span), :global(.map-tip-counts) { color: #64748b; font-size: 12px; }
:global(.map-tip-list) { margin-top: 10px; max-height: 220px; overflow-y: auto; padding-right: 6px; display: grid; gap: 8px; }
:global(.map-tip-row) { padding: 8px 10px; border-radius: 12px; background: rgba(239,246,255,.9); display: grid; gap: 3px; }
:global(.map-tip-row b) { color: #10213f; }
:global(.map-tip-row span) { color: #64748b; font-size: 12px; line-height: 1.45; }
:global(.map-tip-list::-webkit-scrollbar) { width: 6px; }
:global(.map-tip-list::-webkit-scrollbar-thumb) { background: rgba(37,99,235,.32); border-radius: 999px; }
</style>
