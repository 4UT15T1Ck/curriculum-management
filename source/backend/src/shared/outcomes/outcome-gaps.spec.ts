import { describe, expect, it } from 'vitest';
import { outcomeGaps, type GapItem } from './outcome-gaps.js';

const plo = (id: string) => ({
  id,
  ploCode: id.toUpperCase(),
  description: id,
});
const item = (itemId: string, clos: GapItem['clos']): GapItem => ({
  itemId,
  plannedSemester: 1,
  courseCode: `C-${itemId}`,
  courseName: `Course ${itemId}`,
  ownerGroupId: null,
  clos,
});
const clo = (id: string) => ({
  id,
  cloCode: id.toUpperCase(),
  description: id,
});

describe('outcomeGaps', () => {
  it('lists a PLO no course maps', () => {
    const gaps = outcomeGaps({
      plos: [plo('p1'), plo('p2')],
      items: [item('a', [])],
      cells: [{ curriculumItemId: 'a', ploId: 'p1' }],
      links: [],
    });
    expect(gaps.plosWithoutCourse.map((p) => p.id)).toEqual(['p2']);
  });

  it('lists a course with no cell', () => {
    const gaps = outcomeGaps({
      plos: [plo('p1')],
      items: [item('a', []), item('b', [])],
      cells: [{ curriculumItemId: 'a', ploId: 'p1' }],
      links: [],
    });
    expect(gaps.coursesWithoutPlo.map((c) => c.itemId)).toEqual(['b']);
  });

  it('lists a CLO linked in item A but not in item B once, for B', () => {
    const shared = [clo('c1')];
    const gaps = outcomeGaps({
      plos: [plo('p1')],
      items: [item('a', shared), item('b', shared)],
      cells: [
        { curriculumItemId: 'a', ploId: 'p1' },
        { curriculumItemId: 'b', ploId: 'p1' },
      ],
      links: [{ curriculumItemId: 'a', cloId: 'c1' }],
    });
    expect(gaps.closWithoutPlo.map((g) => [g.itemId, g.cloId])).toEqual([
      ['b', 'c1'],
    ]);
  });

  it('reports a course without a revision as such and not as CLO gaps', () => {
    const gaps = outcomeGaps({
      plos: [],
      items: [item('a', null)],
      cells: [],
      links: [],
    });
    expect(gaps.coursesWithoutSyllabus.map((c) => c.itemId)).toEqual(['a']);
    expect(gaps.closWithoutPlo).toEqual([]);
    expect(gaps.coursesWithoutSyllabus[0]).not.toHaveProperty('clos');
  });
});
