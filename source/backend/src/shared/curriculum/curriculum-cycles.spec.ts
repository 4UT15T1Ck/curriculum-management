import { describe, expect, it } from 'vitest';
import { curriculumCycles } from './curriculum-cycles.js';

// An edge reads "source is required by target".
const edge = (sourceCourseId: string, targetCourseId: string) => ({
  sourceCourseId,
  targetCourseId,
});

describe('curriculumCycles', () => {
  it('reports a loop closed by a catalog edge written after the curriculum requisite (KB-020)', () => {
    const cycles = curriculumCycles([edge('B', 'A')], [edge('A', 'B')]);

    expect(cycles).toHaveLength(1);
    expect(cycles[0][0]).toBe(cycles[0][cycles[0].length - 1]);
    expect([...new Set(cycles[0])].sort()).toEqual(['A', 'B']);
  });

  it('reports a loop once even when two curriculum edges lie on it', () => {
    const cycles = curriculumCycles([], [edge('A', 'B'), edge('B', 'A')]);
    expect(cycles).toHaveLength(1);
  });

  it('does not report a loop made of catalog edges alone', () => {
    expect(
      curriculumCycles([edge('A', 'B'), edge('B', 'A')], [edge('C', 'D')]),
    ).toEqual([]);
  });

  it('reports nothing for an acyclic graph', () => {
    expect(curriculumCycles([edge('A', 'B')], [edge('B', 'C')])).toEqual([]);
  });
});
