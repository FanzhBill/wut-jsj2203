import { describe, expect, it } from 'vitest';
import heroSectionSource from '../src/components/HeroSection.vue?raw';

describe('HeroSection video source strategy', () => {
  it('uses the public video URL directly instead of full-file Blob preloading', () => {
    expect(heroSectionSource).not.toContain('fetch(videoPath');
    expect(heroSectionSource).not.toContain('response.blob()');
    expect(heroSectionSource).not.toContain('URL.createObjectURL');
    expect(heroSectionSource).not.toContain('URL.revokeObjectURL');
    expect(heroSectionSource).toContain('const videoSource = computed(() => videoPath);');
    expect(heroSectionSource).not.toContain('filter:');
  });
});
