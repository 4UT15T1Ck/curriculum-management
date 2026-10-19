import { describe, expect, it } from 'vitest';
import {
  fromLinks,
  isDirty,
  isSelected,
  toPairs,
  toggle,
} from './cloPloSelection';

const LINKS = [{ cloId: 'c1', ploId: 'p2' }];

describe('cloPloSelection', () => {
  it('starts from the saved links and toggles a pair on and off', () => {
    const start = fromLinks(LINKS);
    expect(isSelected(start, 'c1', 'p2')).toBe(true);
    const added = toggle(start, 'c2', 'p2');
    expect(isSelected(added, 'c2', 'p2')).toBe(true);
    expect(isSelected(toggle(added, 'c2', 'p2'), 'c2', 'p2')).toBe(false);
    expect(isSelected(start, 'c2', 'p2')).toBe(false);
  });

  it('lists each pair once', () => {
    const selection = toggle(toggle(fromLinks(LINKS), 'c1', 'p2'), 'c1', 'p2');
    expect(toPairs(selection)).toEqual(LINKS);
  });

  it('is dirty only when the set differs from the saved one', () => {
    const start = fromLinks(LINKS);
    expect(isDirty(start, LINKS)).toBe(false);
    expect(isDirty(toggle(start, 'c1', 'p2'), LINKS)).toBe(true);
    expect(isDirty(toggle(toggle(start, 'c3', 'p3'), 'c3', 'p3'), LINKS)).toBe(
      false,
    );
  });
});
