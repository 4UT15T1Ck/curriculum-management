import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OUTCOME_QUERY_ROOT } from '../../../shared/outcomes/outcomeQueryRoot';
import {
  createPlo,
  deletePlo,
  fetchCoursePloMatrix,
  fetchCoverage,
  fetchItemCloPlo,
  fetchPlos,
  fetchProgramCloPlo,
  removePloWeight,
  reorderPlos,
  replaceCloPloLinks,
  setPloWeight,
  updatePlo,
  type CloPloLink,
  type CreatePloRequest,
  type UpdatePloRequest,
} from '../api/outcomes';

export const OUTCOME_QUERY_KEYS = {
  all: OUTCOME_QUERY_ROOT,
  plos: (versionId: string) =>
    [...OUTCOME_QUERY_ROOT, 'plos', versionId] as const,
  coursePlo: (versionId: string) =>
    [...OUTCOME_QUERY_ROOT, 'course-plo', versionId] as const,
  programCloPlo: (versionId: string) =>
    [...OUTCOME_QUERY_ROOT, 'clo-plo', versionId] as const,
  itemCloPlo: (itemId: string) =>
    [...OUTCOME_QUERY_ROOT, 'item-clo-plo', itemId] as const,
  coverage: (versionId: string) =>
    [...OUTCOME_QUERY_ROOT, 'coverage', versionId] as const,
};

export const usePlos = (versionId: string) =>
  useQuery({
    queryKey: OUTCOME_QUERY_KEYS.plos(versionId),
    queryFn: () => fetchPlos(versionId),
    enabled: Boolean(versionId),
  });

export const useCoursePloMatrix = (versionId: string) =>
  useQuery({
    queryKey: OUTCOME_QUERY_KEYS.coursePlo(versionId),
    queryFn: () => fetchCoursePloMatrix(versionId),
    enabled: Boolean(versionId),
  });

export const useProgramCloPlo = (versionId: string) =>
  useQuery({
    queryKey: OUTCOME_QUERY_KEYS.programCloPlo(versionId),
    queryFn: () => fetchProgramCloPlo(versionId),
    enabled: Boolean(versionId),
  });

export const useItemCloPlo = (itemId: string) =>
  useQuery({
    queryKey: OUTCOME_QUERY_KEYS.itemCloPlo(itemId),
    queryFn: () => fetchItemCloPlo(itemId),
    enabled: Boolean(itemId),
  });

export const useOutcomeCoverage = (versionId: string) =>
  useQuery({
    queryKey: OUTCOME_QUERY_KEYS.coverage(versionId),
    queryFn: () => fetchCoverage(versionId),
    enabled: Boolean(versionId),
  });

// A PLO, a weight or a link changes every matrix and the coverage, so every write refetches all of them.
// Refetching after a failure too: the usual cause is a screen that has gone stale.
function useOutcomeMutation<TVars, TResult>(
  mutationFn: (vars: TVars) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: OUTCOME_QUERY_ROOT }),
  });
}

export const useCreatePlo = (versionId: string) =>
  useOutcomeMutation((body: CreatePloRequest) => createPlo(versionId, body));
export const useUpdatePlo = () =>
  useOutcomeMutation(
    ({ ploId, body }: { ploId: string; body: UpdatePloRequest }) =>
      updatePlo(ploId, body),
  );
export const useDeletePlo = () => useOutcomeMutation(deletePlo);
export const useReorderPlos = (versionId: string) =>
  useOutcomeMutation((ids: string[]) => reorderPlos(versionId, ids));
export const useSetPloWeight = () =>
  useOutcomeMutation(
    ({
      itemId,
      ploId,
      weight,
    }: {
      itemId: string;
      ploId: string;
      weight: string;
    }) => setPloWeight(itemId, ploId, weight),
  );
export const useRemovePloWeight = () =>
  useOutcomeMutation(({ itemId, ploId }: { itemId: string; ploId: string }) =>
    removePloWeight(itemId, ploId),
  );
export const useReplaceCloPloLinks = (itemId: string) =>
  useOutcomeMutation((links: CloPloLink[]) =>
    replaceCloPloLinks(itemId, links),
  );
