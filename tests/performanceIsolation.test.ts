import { describe, expect, it } from 'vitest';
import appSource from '../src/App.vue?raw';
import originMapSource from '../src/components/OriginMapSection.vue?raw';
import destinationMapSource from '../src/components/DestinationMapSection.vue?raw';
import overviewMapSource from '../src/components/OverviewMapSection.vue?raw';
import photoWallSource from '../src/components/PhotoWallSection.vue?raw';

const mapSources = [originMapSource, destinationMapSource, overviewMapSource];

describe('performance isolation wiring', () => {
  it('passes active and paused state to expensive sections', () => {
    expect(appSource).toContain('<OriginMapSection id="origin" :active="activeIndex === 1" :paused="videoActive" />');
    expect(appSource).toContain('<DestinationMapSection id="destination" :active="activeIndex === 2" :paused="videoActive" />');
    expect(appSource).toContain('<OverviewMapSection id="overview" :active="activeIndex === 3" :paused="videoActive" />');
    expect(appSource).toContain('<PhotoWallSection id="photos" :active="activeIndex === 5" :paused="videoActive" />');
  });
});

describe('map section performance isolation', () => {
  it('gates every map chart behind active and paused props', () => {
    for (const source of mapSources) {
      expect(source).toContain('defineProps<{ active: boolean; paused: boolean }>()');
      expect(source).toContain('props.active && !props.paused');
      expect(source).toContain('watch(');
      expect(source).toContain('disposeChart');
      expect(source).toContain('chart?.dispose()');
      expect(source).toContain('removeResizeListener');
    }
  });
});

describe('photo wall performance isolation', () => {
  it('renders heavy photo rows only while active and unpaused', () => {
    expect(photoWallSource).toContain('defineProps<{ active: boolean; paused: boolean }>()');
    expect(photoWallSource).toContain('const shouldRenderWall = computed(() => props.active && !props.paused);');
    expect(photoWallSource).toContain('photos.slice(0, 12)');
    expect(photoWallSource).toContain('v-if="shouldRenderWall"');
    expect(photoWallSource).toContain('v-else');
  });
});


describe('video playback scroll lock', () => {
  it('forces the hero cover into view and locks page navigation while video is active', () => {
    expect(appSource).toContain('function startEasterEggVideo()');
    expect(appSource).toContain("document.getElementById('hero')?.scrollIntoView({ behavior: 'auto' });");
    expect(appSource).toContain('activeIndex.value = 0;');
    expect(appSource).toContain(`:class="{ 'scroll-locked': videoActive }"`);
    expect(appSource).toContain(':disabled="videoActive"');
    expect(appSource).toContain(`:class="{ 'scroll-locked': videoActive }"`);
  });
});
