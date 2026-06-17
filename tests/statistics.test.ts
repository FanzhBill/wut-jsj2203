import { describe, expect, it } from 'vitest';
import {
  CATEGORY_LABELS,
  filterStudents,
  getCategoryCounts,
  getCityDistribution,
  getCoreStats,
  getMapCityName,
  getMapProvinceName,
  getProvinceDistribution,
} from '../src/utils/statistics';

const students = [
  {
    name: '黄瑞麒',
    category: '升学',
    destination: '华中科技大学',
    roleOrMajor: '计算机技术-专硕',
    hometownProvince: '江西',
    hometownCity: '吉安',
    destinationProvince: '湖北',
    destinationCity: '武汉',
  },
  {
    name: '追梦同学',
    category: '追梦',
    destination: '',
    roleOrMajor: '',
    hometownProvince: '北京',
    hometownCity: '北京',
    destinationProvince: '',
    destinationCity: '',
  },
] as const;

describe('statistics helpers', () => {
  it('keeps simplified category labels in a stable order', () => {
    expect(CATEGORY_LABELS).toEqual(['升学', '就业', '追梦']);
  });

  it('normalizes province and city names for DataV map features including municipalities', () => {
    expect(getMapProvinceName('江西')).toBe('江西省');
    expect(getMapProvinceName('湖北')).toBe('湖北省');
    expect(getMapProvinceName('北京')).toBe('北京市');
    expect(getMapCityName('吉安')).toBe('吉安市');
    expect(getMapCityName('武汉')).toBe('武汉市');
    expect(getMapCityName('北京')).toBe('北京市');
  });

  it('computes core class statistics from student records', () => {
    expect(getCoreStats(students)).toMatchObject({
      total: 2,
      collected: 2,
      furtherStudy: 1,
      employment: 0,
      dream: 1,
      hometownRegionCount: 2,
      destinationRegionCount: 1,
    });
  });

  it('counts categories including empty categories', () => {
    expect(getCategoryCounts(students)).toEqual({ 升学: 1, 就业: 0, 追梦: 1 });
  });

  it('builds normalized city and province distributions for hometowns and destinations', () => {
    expect(getProvinceDistribution(students, 'hometown')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: '江西省', count: 1 }),
        expect.objectContaining({ name: '北京市', count: 1 }),
      ]),
    );
    expect(getCityDistribution(students, 'destination')).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: '武汉市', count: 1 })]),
    );
  });

  it('filters by category and fuzzy search across name, city, destination, and major', () => {
    expect(filterStudents(students, { category: '升学', keyword: '华中' }).map((item) => item.name)).toEqual(['黄瑞麒']);
    expect(filterStudents(students, { category: '全部', keyword: '吉安' }).map((item) => item.name)).toEqual(['黄瑞麒']);
    expect(filterStudents(students, { category: '全部', keyword: '' })).toHaveLength(2);
  });
});
