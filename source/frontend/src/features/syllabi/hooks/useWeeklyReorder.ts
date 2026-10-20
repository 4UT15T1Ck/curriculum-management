import { useSortableReorder } from '../../../shared/hooks/useSortableReorder';
import type { WeeklyContent } from '../api/syllabi';
import { useReorderWeeks } from './useSyllabus';

export function useWeeklyReorder(
  courseId: string,
  syllabusId: string,
  weeks: WeeklyContent[],
) {
  const reorder = useReorderWeeks(courseId);
  return useSortableReorder(
    weeks,
    (ids, callbacks) => reorder.mutate({ syllabusId, ids }, callbacks),
    reorder.isPending,
  );
}
