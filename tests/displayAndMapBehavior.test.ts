import { describe, expect, it } from 'vitest';
import { buildWuhanLoopLines, getPointSymbolSize } from '../src/utils/mapData';
import { formatLocation, getDisplayRoleOrMajor, getDreamMessage, getJourneyDisplayText, getCompactJourneyDisplayText, type Student } from '../src/utils/statistics';

const dreamA: Student = {
  name: '王继彪',
  category: '追梦',
  destination: '',
  roleOrMajor: '',
  hometownProvince: '山西',
  hometownCity: '运城',
  destinationProvince: '',
  destinationCity: '',
};
const dreamB: Student = {
  name: '汪子扬',
  category: '追梦',
  destination: '',
  roleOrMajor: '',
  hometownProvince: '山东',
  hometownCity: '临沂',
  destinationProvince: '',
  destinationCity: '',
};

describe('display helpers and map behavior', () => {
  it('generates non-repeated dream messages using student identity and hometown', () => {
    expect(getDreamMessage(dreamA)).not.toBe(getDreamMessage(dreamB));
    expect(getDreamMessage(dreamA)).toContain('运城');
    expect(getDreamMessage(dreamB)).toContain('临沂');
  });

  it('formats municipalities without duplicating province and city names', () => {
    expect(formatLocation('上海', '上海')).toBe('上海');
    expect(formatLocation('北京市', '北京市')).toBe('北京市');
    expect(formatLocation('湖北', '武汉')).toBe('湖北武汉');
    expect(formatLocation('', '')).toBe('暂未填写');
  });

  it('uses hand-written non-template dream messages for current dream students', () => {
    const messages = [
      getDreamMessage({ ...dreamA, name: '王继彪', hometownProvince: '山西', hometownCity: '运城' }),
      getDreamMessage({ ...dreamA, name: '梅书豪', hometownProvince: '湖北', hometownCity: '武汉' }),
      getDreamMessage({ ...dreamA, name: '张俊鑫', hometownProvince: '', hometownCity: '' }),
      getDreamMessage({ ...dreamA, name: '汪子扬', hometownProvince: '山东', hometownCity: '临沂' }),
      getDreamMessage({ ...dreamA, name: '姚烨楠', hometownProvince: '浙江', hometownCity: '绍兴' }),
      getDreamMessage({ ...dreamA, name: '何雪晴', hometownProvince: '广东', hometownCity: '珠海' }),
      getDreamMessage({ ...dreamA, name: '尹博雯', hometownProvince: '湖北', hometownCity: '武汉' }),
    ];
    expect(messages).toEqual([
      '运城的风很会等人，王继彪也可以慢慢校准方向；下一次出发，山河都会为你亮灯。',
      '梅书豪先把武汉的晚霞存档，答案迟到一点也没关系，热爱会替你催更。',
      '张俊鑫的下一站暂时保密中，像彩蛋一样，等揭晓时一定很酷。',
      '临沂的星光适合赶路，汪子扬别急，属于你的好消息正在排队进场。',
      '绍兴的温柔和韧劲都在姚烨楠身上，梦会拐个弯，然后稳稳抵达。',
      '何雪晴从珠海带着海风继续闯关，下一章也许比想象中更闪。',
      '尹博雯把武汉当作临时补给站，整理好心情后，远方会主动发来邀请。',
    ]);
  });

  it('keeps dream encouragement on cards but uses compact dream text in map panels', () => {
    const dreamWithDestination = { ...dreamA, destination: '山西运城', destinationProvince: '山西', destinationCity: '运城' };
    expect(getJourneyDisplayText(dreamWithDestination)).toBe(getDreamMessage(dreamWithDestination));
    expect(getCompactJourneyDisplayText(dreamWithDestination)).toBe('追梦');
    expect(getJourneyDisplayText({ ...dreamA, category: '就业', destination: '金山软件有限公司' })).toBe('金山软件有限公司');
    expect(getCompactJourneyDisplayText({ ...dreamA, category: '就业', destination: '金山软件有限公司' })).toBe('金山软件有限公司');
  });

  it('turns tentative role text into a playful display label', () => {
    expect(getDisplayRoleOrMajor('暂定')).toContain('总经理');
    expect(getDisplayRoleOrMajor('暂定')).toContain('😎');
    expect(getDisplayRoleOrMajor('前端开发')).toBe('前端开发');
    expect(getDisplayRoleOrMajor('')).toBe('保持热爱，答案正在路上');
  });

  it('caps large destination bubbles and creates loop lines for students staying in Wuhan', () => {
    expect(getPointSymbolSize([114.3, 30.5, 1])).toBeLessThan(getPointSymbolSize([114.3, 30.5, 8]));
    expect(getPointSymbolSize([114.3, 30.5, 100])).toBeLessThanOrEqual(32);
    const loops = buildWuhanLoopLines([
      { ...dreamA, category: '就业', destinationProvince: '湖北', destinationCity: '武汉', destination: '金山软件有限公司' },
      { ...dreamB, destinationProvince: '', destinationCity: '' },
    ]);
    expect(loops).toHaveLength(1);
    expect(loops[0].coords.length).toBeGreaterThan(2);
  });
});
