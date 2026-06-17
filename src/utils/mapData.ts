import { getMapCityName, type Student, type LocationMode, type RegionDistribution } from './statistics';

export type CoordMap = Record<string, [number, number]>;

export const WHUT_COORD: [number, number] = [114.35783, 30.52517];

export interface CityPoint {
  name: string;
  value: [number, number, number];
  count: number;
  students: Student[];
}

export function getStudentCity(student: Student, mode: LocationMode): string {
  return mode === 'hometown' ? student.hometownCity : student.destinationCity;
}

export function getStudentProvince(student: Student, mode: LocationMode): string {
  return mode === 'hometown' ? student.hometownProvince : student.destinationProvince;
}

export function buildCityPoints(students: readonly Student[], mode: LocationMode, coords: CoordMap): CityPoint[] {
  const groups = new Map<string, Student[]>();
  const rawCityByMapName = new Map<string, string>();
  students.forEach((student) => {
    const rawCity = getStudentCity(student, mode);
    if (!rawCity || !coords[rawCity]) return;
    const mapCity = getMapCityName(rawCity);
    rawCityByMapName.set(mapCity, rawCity);
    if (!groups.has(mapCity)) groups.set(mapCity, []);
    groups.get(mapCity)?.push(student);
  });

  return Array.from(groups.entries()).map(([name, group]) => {
    const rawCity = rawCityByMapName.get(name) || name;
    return {
      name,
      value: [coords[rawCity][0], coords[rawCity][1], group.length],
      count: group.length,
      students: group,
    };
  });
}

export function buildInboundLines(students: readonly Student[], coords: CoordMap) {
  return students
    .map((student) => {
      const from = coords[student.hometownCity];
      if (!from) return undefined;
      return {
        fromName: getMapCityName(student.hometownCity),
        toName: '武汉理工大学',
        coords: [from, WHUT_COORD],
        student,
      };
    })
    .filter(Boolean);
}


export function getPointSymbolSize(value: number[]): number {
  const count = Number(value[2] || 0);
  return Math.min(32, 9 + Math.sqrt(Math.max(count, 1)) * 6);
}

export function buildWuhanLoopLines(students: readonly Student[]) {
  const stayingInWuhan = students.filter(
    (student) => student.destinationProvince === '湖北' && student.destinationCity === '武汉',
  );
  if (!stayingInWuhan.length) return [];
  return [
    {
      fromName: '武汉理工大学',
      toName: '仍在武汉',
      coords: [
        WHUT_COORD,
        [115.1, 30.98],
        [114.86, 29.92],
        WHUT_COORD,
      ],
      count: stayingInWuhan.length,
      students: stayingInWuhan,
    },
  ];
}

export function buildOutboundLines(students: readonly Student[], coords: CoordMap) {
  return students
    .map((student) => {
      const to = coords[student.destinationCity];
      if (!to || student.destinationCity === '武汉') return undefined;
      return {
        fromName: '武汉理工大学',
        toName: getMapCityName(student.destinationCity),
        coords: [WHUT_COORD, to],
        student,
      };
    })
    .filter(Boolean);
}

export function distributionToMapData(distribution: RegionDistribution[]) {
  return distribution.map((item) => ({
    name: item.name,
    value: item.count,
    count: item.count,
    students: item.students,
    categoryCounts: item.categoryCounts,
  }));
}
