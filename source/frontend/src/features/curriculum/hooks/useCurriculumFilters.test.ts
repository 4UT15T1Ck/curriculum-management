import { describe, expect, it } from 'vitest';
import type { CurriculumItem } from '../api/curriculum';
import {
  applyCurriculumFilters,
  EMPTY_CURRICULUM_FILTERS,
  isFiltering,
} from './useCurriculumFilters';

function item(
  code: string,
  name: string,
  patch: Partial<CurriculumItem> = {},
): CurriculumItem {
  return {
    id: code,
    displayOrder: 1,
    plannedSemester: 1,
    sortOrder: 1,
    course: {
      id: code,
      courseCode: code,
      courseName: name,
      credits: '3',
      status: 'ACTIVE',
    },
    blockSymbol: null,
    blockName: null,
    isElective: false,
    electiveGroup: null,
    htDa: false,
    tqDa: false,
    minStudiedScore: null,
    minTransferScore: null,
    note: null,
    requisites: [],
    canEdit: true,
    ...patch,
  };
}

const ROWS = [
  item('MAT101', 'Giải tích 1', { blockSymbol: 'DC' }),
  item('MAT102', 'Đại số tuyến tính', {
    plannedSemester: 2,
    blockSymbol: 'DC',
  }),
  item('IT301', 'Mạng máy tính', {
    plannedSemester: 5,
    isElective: true,
    blockSymbol: 'CN',
  }),
  item('IT302', 'Giải thuật nâng cao', {
    plannedSemester: 5,
    isElective: true,
  }),
];

const codes = (rows: CurriculumItem[]) => rows.map((row) => row.id);

describe('applyCurriculumFilters', () => {
  it('returns every row for empty filters', () => {
    expect(applyCurriculumFilters(ROWS, EMPTY_CURRICULUM_FILTERS)).toEqual(
      ROWS,
    );
    expect(isFiltering(EMPTY_CURRICULUM_FILTERS)).toBe(false);
  });

  it('searches code and name, ignoring case and keeping Vietnamese letters', () => {
    const find = (search: string) =>
      codes(
        applyCurriculumFilters(ROWS, { ...EMPTY_CURRICULUM_FILTERS, search }),
      );
    expect(find('GIẢI')).toEqual(['MAT101', 'IT302']);
    expect(find('giải tích')).toEqual(['MAT101']);
    expect(find('it30')).toEqual(['IT301', 'IT302']);
    expect(find('  mat102 ')).toEqual(['MAT102']);
  });

  it('filters by semester and by kind, and combines them', () => {
    const filters = { ...EMPTY_CURRICULUM_FILTERS };
    expect(
      codes(applyCurriculumFilters(ROWS, { ...filters, semester: 5 })),
    ).toEqual(['IT301', 'IT302']);
    expect(
      codes(applyCurriculumFilters(ROWS, { ...filters, kind: 'elective' })),
    ).toEqual(['IT301', 'IT302']);
    expect(
      codes(applyCurriculumFilters(ROWS, { ...filters, kind: 'compulsory' })),
    ).toEqual(['MAT101', 'MAT102']);
    expect(
      codes(
        applyCurriculumFilters(ROWS, {
          ...filters,
          semester: 5,
          kind: 'elective',
          search: 'giải',
        }),
      ),
    ).toEqual(['IT302']);
  });

  it('filters by block symbol, with null meaning "no symbol"', () => {
    const filters = { ...EMPTY_CURRICULUM_FILTERS };
    expect(
      codes(applyCurriculumFilters(ROWS, { ...filters, blockSymbol: 'DC' })),
    ).toEqual(['MAT101', 'MAT102']);
    expect(
      codes(applyCurriculumFilters(ROWS, { ...filters, blockSymbol: null })),
    ).toEqual(['IT302']);
    expect(isFiltering({ ...filters, blockSymbol: null })).toBe(true);
  });
});
