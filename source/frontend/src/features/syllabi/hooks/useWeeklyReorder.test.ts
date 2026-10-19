import { describe, expect, it } from 'vitest';
import { week } from '../testFixtures';
import { reorderedWeekIds } from './useWeeklyReorder';

const WEEKS = [week('a', 1), week('b', 2), week('c', 3)];

describe('reorderedWeekIds', () => {
  it('moves the dragged row to the position of the one it was dropped on', () => {
    expect(reorderedWeekIds(WEEKS, 'c', 'a')).toEqual(['c', 'a', 'b']);
    expect(reorderedWeekIds(WEEKS, 'a', 'c')).toEqual(['b', 'c', 'a']);
  });

  it('saves nothing without a target, on the same row, or for an unknown row', () => {
    expect(reorderedWeekIds(WEEKS, 'a', undefined)).toBeNull();
    expect(reorderedWeekIds(WEEKS, 'a', 'a')).toBeNull();
    expect(reorderedWeekIds(WEEKS, 'a', 'zzz')).toBeNull();
    expect(reorderedWeekIds(WEEKS, 'zzz', 'a')).toBeNull();
  });
});
