import { CourseRelationType } from '../../generated/prisma/client.js';

export const CURRICULUM_WARNING = {
  EMPTY_SEMESTER: 'EMPTY_SEMESTER',
  REQUISITE_NOT_EARLIER: 'REQUISITE_NOT_EARLIER',
} as const;
export type CurriculumWarningCode =
  (typeof CURRICULUM_WARNING)[keyof typeof CURRICULUM_WARNING];

export const WARNING_SEVERITY = { INFO: 'INFO', HIGH: 'HIGH' } as const;
export type WarningSeverity =
  (typeof WARNING_SEVERITY)[keyof typeof WARNING_SEVERITY];

export interface WarningItem {
  id: string;
  courseId: string;
  courseCode: string;
  plannedSemester: number;
  requisites: readonly {
    sourceCourseId: string;
    relationType: CourseRelationType;
  }[];
}

export interface CurriculumWarning {
  code: CurriculumWarningCode;
  severity: WarningSeverity;
  message: string;
  semester: number | null;
  itemId: string | null;
}

// Only prior-study and prerequisite edges order courses in time; a corequisite may sit in the same or either semester.
const ORDER_SENSITIVE_TYPES: readonly CourseRelationType[] = [
  CourseRelationType.PRIOR,
  CourseRelationType.PREREQUISITE,
];

// A requisite in the same or a later semester is saved (EC-10) but flagged; F-08 adds the checks that need the whole version.
export function curriculumWarnings(
  semesterCount: number,
  items: readonly WarningItem[],
): CurriculumWarning[] {
  const warnings: CurriculumWarning[] = [];
  const byCourse = new Map(items.map((item) => [item.courseId, item]));
  for (let semester = 1; semester <= semesterCount; semester += 1) {
    if (!items.some((item) => item.plannedSemester === semester)) {
      warnings.push({
        code: CURRICULUM_WARNING.EMPTY_SEMESTER,
        severity: WARNING_SEVERITY.INFO,
        message: `Học kỳ ${semester} chưa có học phần nào.`,
        semester,
        itemId: null,
      });
    }
  }
  for (const item of items) {
    for (const requisite of item.requisites) {
      const source = byCourse.get(requisite.sourceCourseId);
      if (
        !source ||
        !ORDER_SENSITIVE_TYPES.includes(requisite.relationType) ||
        source.plannedSemester < item.plannedSemester
      ) {
        continue;
      }
      warnings.push({
        code: CURRICULUM_WARNING.REQUISITE_NOT_EARLIER,
        severity: WARNING_SEVERITY.HIGH,
        message: `${item.courseCode} (học kỳ ${item.plannedSemester}) cần ${source.courseCode} trước, nhưng ${source.courseCode} xếp ở học kỳ ${source.plannedSemester}.`,
        semester: item.plannedSemester,
        itemId: item.id,
      });
    }
  }
  return warnings;
}
