import { describe, expect, it } from 'vitest';
import { item } from '../testFixtures';
import { reorderedSemester } from './useSemesterReorder';

const ITEMS = [
  item('A', 'A', { plannedSemester: 1 }),
  item('B', 'B', { plannedSemester: 1 }),
  item('C', 'C', { plannedSemester: 1 }),
  item('D', 'D', { plannedSemester: 2 }),
];

describe('reorderedSemester', () => {
  it('moves a row up inside its semester and sends the whole semester (US-027 AC1)', () => {
    expect(reorderedSemester(ITEMS, 'i-C', 'i-A')).toEqual({
      plannedSemester: 1,
      itemIds: ['i-C', 'i-A', 'i-B'],
    });
  });

  it('moves a row down', () => {
    expect(reorderedSemester(ITEMS, 'i-A', 'i-C')).toEqual({
      plannedSemester: 1,
      itemIds: ['i-B', 'i-C', 'i-A'],
    });
  });

  it('ignores a drop onto itself, onto nothing, or onto an unknown row', () => {
    expect(reorderedSemester(ITEMS, 'i-A', 'i-A')).toBeNull();
    expect(reorderedSemester(ITEMS, 'i-A', undefined)).toBeNull();
    expect(reorderedSemester(ITEMS, 'i-A', 'ghost')).toBeNull();
    expect(reorderedSemester(ITEMS, 'ghost', 'i-A')).toBeNull();
  });

  it('ignores a drop onto a row of another semester', () => {
    expect(reorderedSemester(ITEMS, 'i-A', 'i-D')).toBeNull();
  });
});
