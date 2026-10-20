import { describe, expect, it } from 'vitest';
import { reorderedIds } from './useSortableReorder';

const ROWS = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

describe('reorderedIds', () => {
  it('moves the dragged row to the position of the one it was dropped on', () => {
    expect(reorderedIds(ROWS, 'c', 'a')).toEqual(['c', 'a', 'b']);
    expect(reorderedIds(ROWS, 'a', 'c')).toEqual(['b', 'c', 'a']);
  });

  it('saves nothing without a target, on the same row, or for an unknown row', () => {
    expect(reorderedIds(ROWS, 'a', undefined)).toBeNull();
    expect(reorderedIds(ROWS, 'a', 'a')).toBeNull();
    expect(reorderedIds(ROWS, 'a', 'zzz')).toBeNull();
    expect(reorderedIds(ROWS, 'zzz', 'a')).toBeNull();
  });
});
