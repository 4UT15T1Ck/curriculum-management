import { describe, expect, it } from 'vitest';
import { CourseRelationType } from '../../generated/prisma/client.js';
import {
  CURRICULUM_WARNING,
  WARNING_SEVERITY,
  curriculumWarnings,
  type WarningItem,
} from './curriculum-warnings.js';

function item(
  code: string,
  plannedSemester: number,
  requisites: WarningItem['requisites'] = [],
): WarningItem {
  return {
    id: `item-${code}`,
    courseId: `course-${code}`,
    courseCode: code,
    plannedSemester,
    requisites,
  };
}

const needs = (code: string, relationType: CourseRelationType) => ({
  sourceCourseId: `course-${code}`,
  relationType,
});

describe('curriculumWarnings', () => {
  it('reports an empty semester with an info warning (KB-016)', () => {
    const rows = [1, 2, 3, 4, 5, 6, 7].map((semester) =>
      item(`C${semester}`, semester),
    );

    const warnings = curriculumWarnings(8, rows);

    expect(warnings).toEqual([
      {
        code: CURRICULUM_WARNING.EMPTY_SEMESTER,
        severity: WARNING_SEVERITY.INFO,
        message: 'Học kỳ 8 chưa có học phần nào.',
        semester: 8,
        itemId: null,
      },
    ]);
  });

  it('flags a prerequisite planned in a later semester, naming both courses (KB-019)', () => {
    const rows = [
      item('B', 4, [needs('A', CourseRelationType.PREREQUISITE)]),
      item('A', 5),
    ];

    const warnings = curriculumWarnings(5, rows).filter(
      (warning) => warning.code === CURRICULUM_WARNING.REQUISITE_NOT_EARLIER,
    );

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatchObject({
      severity: WARNING_SEVERITY.HIGH,
      semester: 4,
      itemId: 'item-B',
    });
    expect(warnings[0].message).toContain('B');
    expect(warnings[0].message).toContain('A');
    expect(warnings[0].message).toContain('học kỳ 5');
  });

  it('flags a requisite planned in the same semester', () => {
    const rows = [
      item('B', 3, [needs('A', CourseRelationType.PRIOR)]),
      item('A', 3),
    ];
    const warned = curriculumWarnings(3, rows).filter(
      (warning) => warning.code === CURRICULUM_WARNING.REQUISITE_NOT_EARLIER,
    );
    expect(warned).toHaveLength(1);
  });

  it('does not flag a prerequisite planned earlier', () => {
    const rows = [
      item('B', 3, [needs('A', CourseRelationType.PREREQUISITE)]),
      item('A', 2),
      item('C', 1),
    ];
    expect(curriculumWarnings(3, rows)).toEqual([]);
  });

  it('does not flag a corequisite planned later', () => {
    const rows = [
      item('B', 2, [needs('A', CourseRelationType.COREQUISITE)]),
      item('A', 3),
      item('C', 1),
    ];
    expect(curriculumWarnings(3, rows)).toEqual([]);
  });

  it('does not warn here about a source outside the curriculum', () => {
    const rows = [item('B', 1, [needs('Z', CourseRelationType.PREREQUISITE)])];
    expect(curriculumWarnings(1, rows)).toEqual([]);
  });
});
