import { useSortableReorder } from '../../../shared/hooks/useSortableReorder';
import type { Plo } from '../api/outcomes';
import { useReorderPlos } from './useOutcomes';

export function usePloReorder(versionId: string, plos: Plo[]) {
  const reorder = useReorderPlos(versionId);
  return useSortableReorder(
    plos,
    (ids, callbacks) => reorder.mutate(ids, callbacks),
    reorder.isPending,
  );
}
