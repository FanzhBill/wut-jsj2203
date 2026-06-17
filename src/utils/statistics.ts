export const CATEGORY_LABELS = ['升学', '就业', '追梦'] as const;
export type Category = (typeof CATEGORY_LABELS)[number];
export type CategoryFilter = Category | '全部';
export type LocationMode = 'hometown' | 'destination';

export interface Student {
  name: string;
  category: Category;
  destination: string;
  roleOrMajor: string;
  hometownProvince: string;
  hometownCity: string;
  destinationProvince: string;
  destinationCity: string;
  showName?: boolean;
  showDetail?: boolean;
  consent?: boolean;
}

export interface CategoryCounts extends Record<Category, number> {}

export interface RegionDistribution {
  name: string;
  count: number;
  students: Student[];
  categoryCounts: CategoryCounts;
}

export interface CoreStats {
  total: number;
  collected: number;
  furtherStudy: number;
  employment: number;
  dream: number;
  hometownRegionCount: number;
  destinationRegionCount: number;
}

const MUNICIPALITIES = new Set(['北京', '北京市', '上海', '上海市', '天津', '天津市', '重庆', '重庆市']);
const SPECIAL_REGIONS = new Set(['香港', '香港特别行政区', '澳门', '澳门特别行政区']);
const AUTONOMOUS: Record<string, string> = {
  内蒙古: '内蒙古自治区',
  广西: '广西壮族自治区',
  西藏: '西藏自治区',
  宁夏: '宁夏回族自治区',
  新疆: '新疆维吾尔自治区',
};

export function getMapProvinceName(name: string): string {
  const clean = name.trim();
  if (!clean) return '';
  if (AUTONOMOUS[clean]) return AUTONOMOUS[clean];
  if (MUNICIPALITIES.has(clean)) return clean.endsWith('市') ? clean : `${clean}市`;
  if (clean === '香港' || clean === '香港特别行政区') return '香港特别行政区';
  if (clean === '澳门' || clean === '澳门特别行政区') return '澳门特别行政区';
  if (clean === '台湾' || clean === '台湾省') return '台湾省';
  return /省|市|自治区|特别行政区$/.test(clean) ? clean : `${clean}省`;
}

export function getMapCityName(name: string): string {
  const clean = name.trim();
  if (!clean) return '';
  if (MUNICIPALITIES.has(clean)) return clean.endsWith('市') ? clean : `${clean}市`;
  if (SPECIAL_REGIONS.has(clean)) return getMapProvinceName(clean);
  return /市|地区|盟|州|区|县$/.test(clean) ? clean : `${clean}市`;
}

export function formatLocation(province: string, city: string): string {
  const cleanProvince = province.trim();
  const cleanCity = city.trim();
  if (!cleanProvince && !cleanCity) return '暂未填写';
  if (!cleanProvince) return cleanCity;
  if (!cleanCity) return cleanProvince;

  if (cleanProvince === cleanCity) return cleanCity;
  const normalizedProvince = getMapProvinceName(cleanProvince);
  const normalizedCity = getMapCityName(cleanCity);
  if (normalizedProvince && normalizedProvince === normalizedCity) return cleanCity || cleanProvince;
  return `${cleanProvince}${cleanCity}`;
}


export function emptyCategoryCounts(): CategoryCounts {
  return CATEGORY_LABELS.reduce((acc, category) => {
    acc[category] = 0;
    return acc;
  }, {} as CategoryCounts);
}

export function getCategoryCounts(students: readonly Student[]): CategoryCounts {
  const counts = emptyCategoryCounts();
  students.forEach((student) => {
    counts[student.category] += 1;
  });
  return counts;
}

export function getCoreStats(students: readonly Student[]): CoreStats {
  const counts = getCategoryCounts(students);
  const hometownRegions = new Set(
    students
      .map((student) => `${getMapProvinceName(student.hometownProvince)}${getMapCityName(student.hometownCity)}`)
      .filter(Boolean),
  );
  const destinationRegions = new Set(
    students
      .filter((student) => student.destinationProvince.trim() && student.destinationCity.trim())
      .map((student) => `${getMapProvinceName(student.destinationProvince)}${getMapCityName(student.destinationCity)}`),
  );

  return {
    total: students.length,
    collected: students.filter((student) => student.consent !== false).length,
    furtherStudy: counts['升学'],
    employment: counts['就业'],
    dream: counts['追梦'],
    hometownRegionCount: hometownRegions.size,
    destinationRegionCount: destinationRegions.size,
  };
}

function distributionBy(students: readonly Student[], getName: (student: Student) => string): RegionDistribution[] {
  const map = new Map<string, Student[]>();
  students.forEach((student) => {
    const name = getName(student);
    if (!name) return;
    if (!map.has(name)) map.set(name, []);
    map.get(name)?.push(student);
  });

  return Array.from(map.entries())
    .map(([name, group]) => ({
      name,
      count: group.length,
      students: group,
      categoryCounts: getCategoryCounts(group),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

export function getProvinceDistribution(students: readonly Student[], mode: LocationMode): RegionDistribution[] {
  return distributionBy(students, (student) =>
    mode === 'hometown' ? getMapProvinceName(student.hometownProvince) : getMapProvinceName(student.destinationProvince),
  );
}

export function getCityDistribution(students: readonly Student[], mode: LocationMode): RegionDistribution[] {
  return distributionBy(students, (student) =>
    mode === 'hometown' ? getMapCityName(student.hometownCity) : getMapCityName(student.destinationCity),
  );
}

export function filterStudents(
  students: readonly Student[],
  filters: { category: CategoryFilter; keyword: string },
): Student[] {
  const keyword = filters.keyword.trim().toLocaleLowerCase('zh-CN');
  return students.filter((student) => {
    const matchCategory = filters.category === '全部' || student.category === filters.category;
    const haystack = [
      student.name,
      student.hometownProvince,
      student.hometownCity,
      getMapProvinceName(student.hometownProvince),
      getMapCityName(student.hometownCity),
      student.destinationProvince,
      student.destinationCity,
      getMapProvinceName(student.destinationProvince),
      getMapCityName(student.destinationCity),
      student.destination,
      student.roleOrMajor,
    ]
      .join(' ')
      .toLocaleLowerCase('zh-CN');
    return matchCategory && (!keyword || haystack.includes(keyword));
  });
}

const DREAM_MESSAGE_BY_NAME: Record<string, string> = {
  王继彪: '运城的风很会等人，王继彪也可以慢慢校准方向；下一次出发，山河都会为你亮灯。',
  梅书豪: '梅书豪先把武汉的晚霞存档，答案迟到一点也没关系，热爱会替你催更。',
  张俊鑫: '张俊鑫的下一站暂时保密中，像彩蛋一样，等揭晓时一定很酷。',
  汪子扬: '临沂的星光适合赶路，汪子扬别急，属于你的好消息正在排队进场。',
  姚烨楠: '绍兴的温柔和韧劲都在姚烨楠身上，梦会拐个弯，然后稳稳抵达。',
  何雪晴: '何雪晴从珠海带着海风继续闯关，下一章也许比想象中更闪。',
  尹博雯: '尹博雯把武汉当作临时补给站，整理好心情后，远方会主动发来邀请。',
};

const DREAM_TEMPLATES = [
  (name: string, place: string) => `${place}的风很会等人，${name}也可以慢慢校准方向；下一次出发，山河都会为你亮灯。`,
  (name: string, place: string) => `${name}先把${place}的晚霞存档，答案迟到一点也没关系，热爱会替你催更。`,
  (name: string, place: string) => `${name}的下一站暂时保密中，像${place}寄来的彩蛋，等揭晓时一定很酷。`,
  (name: string, place: string) => `${place}的星光适合赶路，${name}别急，属于你的好消息正在排队进场。`,
  (name: string, place: string) => `${place}的温柔和韧劲都在${name}身上，梦会拐个弯，然后稳稳抵达。`,
  (name: string, place: string) => `${name}从${place}带着风继续闯关，下一章也许比想象中更闪。`,
  (name: string, place: string) => `${name}把${place}当作临时补给站，整理好心情后，远方会主动发来邀请。`,
];

function hashText(text: string): number {
  return Array.from(text).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function getDreamMessage(student: Student): string {
  if (student.showName !== false && DREAM_MESSAGE_BY_NAME[student.name]) {
    return DREAM_MESSAGE_BY_NAME[student.name];
  }
  const place = student.hometownCity || student.hometownProvince || '熟悉的地方';
  const name = student.showName === false ? '这位同学' : student.name;
  const template = DREAM_TEMPLATES[hashText(`${name}-${place}`) % DREAM_TEMPLATES.length];
  return template(name, place);
}


export function getJourneyDisplayText(student: Student): string {
  if (student.showDetail === false) return '去向已隐藏';
  if (student.category === '追梦') return getDreamMessage(student);
  return student.destination || '暂未填写';
}

export function getCompactJourneyDisplayText(student: Student): string {
  if (student.showDetail === false) return '去向已隐藏';
  if (student.category === '追梦') return '追梦';
  return student.destination || '暂未填写';
}

export function getDisplayRoleOrMajor(roleOrMajor: string): string {
  const clean = roleOrMajor.trim();
  if (!clean) return '保持热爱，答案正在路上';
  if (clean === '暂定') return '岗位暂定（也许是总经理😎）';
  return clean;
}
