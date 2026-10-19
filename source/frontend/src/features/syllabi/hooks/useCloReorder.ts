import { useSortableReorder } from '../../../shared/hooks/useSortableReorder';
import type { Clo } from '../api/syllabi';
import { useReorderClos } from './useSyllabus';

export function useCloReorder(
  courseId: string,
  syllabusId: string,
  clos: Clo[],
) {
  const reorder = useReorderClos(courseId);
  return useSortableReorder(
    clos,
    (ids, callbacks) => reorder.mutate({ syllabusId, ids }, callbacks),
    reorder.isPending,
  );
}
