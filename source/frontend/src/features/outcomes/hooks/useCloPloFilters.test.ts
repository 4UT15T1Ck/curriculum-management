import { describe, expect, it } from 'vitest';
import type { ProgramCloPloRow } from '../api/outcomes';
import { filterRows } from './useCloPloFilters';

const row = (
  itemId: string,
  plannedSemester: number,
  mappedPloIds: string[],
): ProgramCloPloRow => ({
  itemId,
  plannedSemester,
  course: { id: itemId, courseCode: itemId, courseName: itemId },
  revisionNumber: 1,
  clos: [],
  mappedPloIds,
  links: [],
});

const ROWS = [row('a', 1, ['p1']), row('b', 2, ['p1', 'p2']), row('c', 2, [])];

describe('filterRows', () => {
  it('keeps everything without filters', () => {
    expect(filterRows(ROWS, { semester: null, ploId: null })).toHaveLength(3);
  });

  it('filters by semester and by a mapped PLO, alone or together', () => {
    expect(
      filterRows(ROWS, { semester: 2, ploId: null }).map((r) => r.itemId),
    ).toEqual(['b', 'c']);
    expect(
      filterRows(ROWS, { semester: null, ploId: 'p2' }).map((r) => r.itemId),
    ).toEqual(['b']);
    expect(filterRows(ROWS, { semester: 1, ploId: 'p2' })).toEqual([]);
  });
});
