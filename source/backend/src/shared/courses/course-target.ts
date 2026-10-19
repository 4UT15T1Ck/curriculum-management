import type { ScopeTarget } from '../authz/access-context.js';

// The scope a course occupies: its owning faculty and, when set, its owning subject group.
export function courseTarget(course: {
  ownerFacultyId: string;
  ownerGroupId: string | null;
}): ScopeTarget {
  return {
    subjectGroupIds: course.ownerGroupId ? [course.ownerGroupId] : [],
    orgUnitIds: [course.ownerFacultyId],
  };
}
