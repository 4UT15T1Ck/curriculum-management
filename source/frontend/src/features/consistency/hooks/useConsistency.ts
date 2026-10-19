import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  acceptCreditMismatch,
  fetchConsistency,
  type AcceptCreditMismatchInput,
} from '../api/consistency';

export const CONSISTENCY_QUERY_KEYS = {
  all: ['consistency'] as const,
  version: (versionId: string) => ['consistency', versionId] as const,
};

// Results are never stored; each mount and each "Chạy lại" recomputes on the server.
export function useConsistency(versionId: string) {
  return useQuery({
    queryKey: CONSISTENCY_QUERY_KEYS.version(versionId),
    queryFn: () => fetchConsistency(versionId),
    enabled: Boolean(versionId),
    staleTime: 0,
  });
}

// The PUT already answers with the recomputed report, so it goes straight into the cache.
export function useAcceptCreditMismatch(versionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AcceptCreditMismatchInput) =>
      acceptCreditMismatch(versionId, body),
    onSuccess: (report) =>
      queryClient.setQueryData(
        CONSISTENCY_QUERY_KEYS.version(versionId),
        report,
      ),
  });
}
