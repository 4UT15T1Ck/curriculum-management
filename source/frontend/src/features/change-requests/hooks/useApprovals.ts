import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveChangeRequest,
  createComment,
  getApprovalHistory,
  getApprovalQueue,
  listComments,
  overrideChangeRequest,
  rejectChangeRequest,
  returnChangeRequest,
  type ApprovalQueueQuery,
  type OverrideDecisionBody,
} from '../api/changeRequests';
import {
  CHANGE_REQUEST_QUERY_KEYS,
  useRequestMutation,
} from './useChangeRequests';

// A decision replaces the cached detail and refetches the rest of the root, the queue included (US-061 AC4).
export const useApproveChangeRequest = (id: string) =>
  useRequestMutation((remark?: string) => approveChangeRequest(id, remark));
export const useReturnChangeRequest = (id: string) =>
  useRequestMutation((remark: string) => returnChangeRequest(id, remark));
export const useRejectChangeRequest = (id: string) =>
  useRequestMutation((remark: string) => rejectChangeRequest(id, remark));
export const useOverrideChangeRequest = (id: string) =>
  useRequestMutation((body: OverrideDecisionBody) =>
    overrideChangeRequest(id, body),
  );

// Loaded when the history is opened: the current round is already on the page.
export function useApprovalHistory(id: string, enabled: boolean) {
  return useQuery({
    queryKey: CHANGE_REQUEST_QUERY_KEYS.history(id),
    queryFn: () => getApprovalHistory(id),
    enabled,
  });
}

export function useComments(id: string) {
  return useQuery({
    queryKey: CHANGE_REQUEST_QUERY_KEYS.comments(id),
    queryFn: () => listComments(id),
  });
}

export function useCreateComment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => createComment(id, content),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: CHANGE_REQUEST_QUERY_KEYS.comments(id),
      }),
  });
}

export function useApprovalQueue(query: ApprovalQueueQuery) {
  return useQuery({
    queryKey: CHANGE_REQUEST_QUERY_KEYS.queue(query),
    queryFn: () => getApprovalQueue(query),
  });
}
