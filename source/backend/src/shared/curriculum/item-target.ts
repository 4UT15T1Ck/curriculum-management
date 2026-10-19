import type { ScopeTarget } from '../authz/access-context.js';
import { programTarget } from '../programs/program-target.js';

// A row is reachable through its program (R1, R3) or through its course's subject group (R4, R5).
export function itemTarget(
  version: { program: { id: string; facultyId: string } },
  course: { ownerGroupId: string | null },
): ScopeTarget {
  return {
    ...programTarget(version.program),
    subjectGroupIds: course.ownerGroupId ? [course.ownerGroupId] : [],
  };
}
