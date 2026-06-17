export type HeroVideoState = {
  requested: boolean;
  preparing: boolean;
  buffering: boolean;
  playing: boolean;
};

export function getHeroTextHidden(state: HeroVideoState) {
  return state.requested || state.preparing || state.buffering || state.playing;
}

export function getVideoPlaybackLabel(state: HeroVideoState) {
  if (state.preparing) return '彩蛋视频加载中…';
  if (state.buffering && state.playing) return '视频缓冲中…';
  return '';
}
