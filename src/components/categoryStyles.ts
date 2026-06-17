import type { Category } from '../utils/statistics';

export function categoryClass(category: Category): string {
  return {
    升学: 'tag-study',
    就业: 'tag-work',
    追梦: 'tag-dream',
  }[category];
}

export function categoryColor(category: Category): string {
  return {
    升学: '#2563eb',
    就业: '#16a34a',
    追梦: '#f97316',
  }[category];
}
