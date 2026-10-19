import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignRole,
  fetchRoleAssignments,
  fetchRoles,
  revokeRole,
} from '../api/roleAssignments';
import type { CreateRoleAssignmentRequest } from '../api/roleAssignments';
import { USER_QUERY_KEYS } from './useUsers';

export function useRoles() {
  return useQuery({ queryKey: ['roles'] as const, queryFn: fetchRoles });
}
export function useRoleAssignments(userId: string) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.assignments(userId),
    queryFn: () => fetchRoleAssignments(userId),
  });
}
export function useAssignRole(userId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRoleAssignmentRequest) => assignRole(userId, body),
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: USER_QUERY_KEYS.assignments(userId),
      }),
  });
}
export function useRevokeRole(userId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: string) => revokeRole(userId, assignmentId),
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: USER_QUERY_KEYS.assignments(userId),
      }),
  });
}
