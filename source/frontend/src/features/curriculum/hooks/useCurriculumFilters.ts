import { useMemo, useState } from 'react';
import type { CurriculumItem } from '../api/curriculum';

export type CurriculumKind = 'all' | 'compulsory' | 'elective';

export interface CurriculumFilters {
  search: string;
  semester: number | null;
  // `undefined` = any block; `null` = rows with no symbol.
  blockSymbol: string | null | undefined;
  kind: CurriculumKind;
}

export const EMPTY_CURRICULUM_FILTERS: CurriculumFilters = {
  search: '',
  semester: null,
  blockSymbol: undefined,
  kind: 'all',
};

const lower = (text: string) => text.toLocaleLowerCase('vi');

// Pure so it is tested without rendering (D16): filtering runs over the whole loaded curriculum, at most 200 rows.
export function applyCurriculumFilters(
  items: readonly CurriculumItem[],
  filters: CurriculumFilters,
): CurriculumItem[] {
  const needle = lower(filters.search.trim());
  return items.filter(
    (item) =>
      (needle === '' ||
        lower(item.course.courseCode).includes(needle) ||
        lower(item.course.courseName).includes(needle)) &&
      (filters.semester === null ||
        item.plannedSemester === filters.semester) &&
      (filters.blockSymbol === undefined ||
        item.blockSymbol === filters.blockSymbol) &&
      (filters.kind === 'all' ||
        item.isElective === (filters.kind === 'elective')),
  );
}

export function isFiltering(filters: CurriculumFilters): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.semester !== null ||
    filters.blockSymbol !== undefined ||
    filters.kind !== 'all'
  );
}

export function useCurriculumFilters(items: readonly CurriculumItem[]) {
  const [filters, setFilters] = useState(EMPTY_CURRICULUM_FILTERS);
  const visible = useMemo(
    () => applyCurriculumFilters(items, filters),
    [items, filters],
  );
  return { filters, setFilters, visible, filtered: isFiltering(filters) };
}
