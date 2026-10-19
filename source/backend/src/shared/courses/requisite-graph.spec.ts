import { describe, expect, it } from 'vitest';
import { CourseRelationType } from '../../generated/prisma/client.js';
import {
  CYCLE_CHECKED_TYPES,
  findRequisiteCycle,
  type RequisiteEdge,
} from './requisite-graph.js';

const edge = (
  sourceCourseId: string,
  targetCourseId: string,
): RequisiteEdge => ({
  sourceCourseId,
  targetCourseId,
});

describe('findRequisiteCycle', () => {
  it('finds a two-course loop (KB-004)', () => {
    expect(findRequisiteCycle([edge('A', 'B')], edge('B', 'A'))).toEqual([
      'A',
      'B',
      'A',
    ]);
  });

  it('finds a three-course loop and names its path (US-016 AC1)', () => {
    expect(
      findRequisiteCycle([edge('A', 'B'), edge('B', 'C')], edge('C', 'A')),
    ).toEqual(['A', 'B', 'C', 'A']);
  });

  it('returns null when no path leads back', () => {
    expect(findRequisiteCycle([edge('A', 'B')], edge('C', 'A'))).toBeNull();
  });

  it('returns a loop through a diamond', () => {
    const cycle = findRequisiteCycle(
      [edge('A', 'B'), edge('A', 'C'), edge('B', 'D'), edge('C', 'D')],
      edge('D', 'A'),
    );
    expect(cycle).toHaveLength(4);
    expect(cycle?.[0]).toBe('A');
    expect(cycle?.[cycle.length - 1]).toBe('A');
  });

  it('answers a 500-edge acyclic graph quickly', () => {
    const edges = Array.from({ length: 500 }, (_, index) =>
      edge(`n${index}`, `n${index + 1}`),
    );
    const started = performance.now();
    expect(findRequisiteCycle(edges, edge('x', 'y'))).toBeNull();
    expect(performance.now() - started).toBeLessThan(50);
  });

  it('terminates when the existing graph has a loop elsewhere', () => {
    expect(
      findRequisiteCycle([edge('P', 'Q'), edge('Q', 'P')], edge('B', 'A')),
    ).toBeNull();
  });
});

describe('CYCLE_CHECKED_TYPES', () => {
  it('holds prior study and prerequisite only (F05-04)', () => {
    expect([...CYCLE_CHECKED_TYPES]).toEqual([
      CourseRelationType.PRIOR,
      CourseRelationType.PREREQUISITE,
    ]);
  });
});
