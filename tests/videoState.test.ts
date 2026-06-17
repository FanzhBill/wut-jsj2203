import { describe, expect, it } from 'vitest';
import { getHeroTextHidden, getVideoPlaybackLabel } from '../src/utils/videoState';

describe('hero video UI state', () => {
  it('hides hero copy while video is requested, preparing, buffering, or playing', () => {
    expect(getHeroTextHidden({ requested: false, preparing: false, buffering: false, playing: false })).toBe(false);
    expect(getHeroTextHidden({ requested: true, preparing: false, buffering: false, playing: false })).toBe(true);
    expect(getHeroTextHidden({ requested: false, preparing: true, buffering: false, playing: false })).toBe(true);
    expect(getHeroTextHidden({ requested: false, preparing: false, buffering: true, playing: false })).toBe(true);
    expect(getHeroTextHidden({ requested: false, preparing: false, buffering: false, playing: true })).toBe(true);
  });

  it('uses accurate playback labels for loading and active states', () => {
    expect(getVideoPlaybackLabel({ requested: true, preparing: true, buffering: false, playing: false })).toBe('彩蛋视频加载中…');
    expect(getVideoPlaybackLabel({ requested: true, preparing: false, buffering: true, playing: true })).toBe('视频缓冲中…');
    expect(getVideoPlaybackLabel({ requested: true, preparing: false, buffering: false, playing: true })).toBe('');
  });
});
