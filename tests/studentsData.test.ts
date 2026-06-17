import { describe, expect, it } from 'vitest';
import students from '../src/data/students.json';
import coords from '../src/data/cityCoords.json';
import { CATEGORY_LABELS, getDreamMessage, type Student } from '../src/utils/statistics';

const typedStudents = students as Student[];
const coordMap = coords as unknown as Record<string, [number, number]>;

describe('students data', () => {
  it('contains the full class roster provided by the graduation summary', () => {
    expect(typedStudents).toHaveLength(36);
    expect(typedStudents[0].name).toBe('黄瑞麒');
    expect(typedStudents.at(-1)?.name).toBe('孙淼');
  });

  it('uses only supported simplified categories', () => {
    const categories = new Set(CATEGORY_LABELS);
    expect(typedStudents.every((student) => categories.has(student.category))).toBe(true);
  });



  it('uses hometown as destination text for dream students', () => {
    const dreamStudents = typedStudents.filter((student) => student.category === '追梦');
    expect(dreamStudents.length).toBeGreaterThan(0);
    expect(
      dreamStudents.every((student) => {
        const hometown = `${student.hometownProvince}${student.hometownCity}`;
        if (!hometown) {
          return student.destination === '暂未填写' && !student.destinationProvince && !student.destinationCity;
        }
        return (
          student.destination === hometown &&
          student.destinationProvince === student.hometownProvince &&
          student.destinationCity === student.hometownCity
        );
      }),
    ).toBe(true);
  });

  it('generates unique encouragement messages for current dream students', () => {
    const messages = typedStudents
      .filter((student) => student.category === '追梦')
      .map((student) => getDreamMessage(student));
    expect(new Set(messages).size).toBe(messages.length);
  });

  it('has coordinates for every non-empty hometown and destination city', () => {
    const cities = new Set<string>();
    typedStudents.forEach((student) => {
      if (student.hometownCity) cities.add(student.hometownCity);
      if (student.destinationCity) cities.add(student.destinationCity);
    });
    const missing = [...cities].filter((city) => !coordMap[city]);
    expect(missing).toEqual([]);
  });
});
