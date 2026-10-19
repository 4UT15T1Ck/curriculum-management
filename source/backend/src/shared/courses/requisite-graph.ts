import {
  CourseRelationType,
  type Prisma,
} from '../../generated/prisma/client.js';

export interface RequisiteEdge {
  sourceCourseId: string;
  targetCourseId: string;
}

// Only these types order courses in time; corequisite and replacement may point both ways (BR-11, F05-04).
export const CYCLE_CHECKED_TYPES: readonly CourseRelationType[] = [
  CourseRelationType.PRIOR,
  CourseRelationType.PREREQUISITE,
];

// Every writer of requisite edges (catalog relations, curriculum requisites, imports) takes this lock first.
export const REQUISITE_GRAPH_LOCK_KEY = 5_001;

// Returns the loop the new edge would close, as course ids starting and ending at the new edge's target, or null.
// Callers pass only CYCLE_CHECKED_TYPES edges; the function trusts its input.
export function findRequisiteCycle(
  edges: readonly RequisiteEdge[],
  newEdge: RequisiteEdge,
): string[] | null {
  const next = new Map<string, string[]>();
  for (const edge of edges) {
    const list = next.get(edge.sourceCourseId) ?? [];
    list.push(edge.targetCourseId);
    next.set(edge.sourceCourseId, list);
  }
  const cameFrom = new Map<string, string>();
  const queue = [newEdge.targetCourseId];
  const seen = new Set(queue);
  for (let head = 0; head < queue.length; head++) {
    const current = queue[head];
    if (current === newEdge.sourceCourseId) {
      const path = [current];
      for (let at = current; at !== newEdge.targetCourseId;) {
        at = cameFrom.get(at)!;
        path.unshift(at);
      }
      return [...path, newEdge.targetCourseId];
    }
    for (const following of next.get(current) ?? []) {
      if (!seen.has(following)) {
        seen.add(following);
        cameFrom.set(following, current);
        queue.push(following);
      }
    }
  }
  return null;
}

// Serialises writers of requisite edges: check + insert become atomic across concurrent requests.
// $executeRaw, not $queryRaw: pg_advisory_xact_lock returns void, which the driver adapter cannot deserialise.
export async function lockRequisiteGraph(
  tx: Prisma.TransactionClient,
): Promise<void> {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(${REQUISITE_GRAPH_LOCK_KEY})`;
}
