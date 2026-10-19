import { useQuery } from '@tanstack/react-query';
import { USER_QUERY_KEYS } from './useUsers';
import { fetchSubjectGroupMemberships } from '../api/subjectGroupMemberships';

export function useSubjectGroupMemberships(userId: string) {
  return useQuery({
    queryKey: [...USER_QUERY_KEYS.detail(userId), 'subject-groups'] as const,
    queryFn: () => fetchSubjectGroupMemberships(userId),
    enabled: Boolean(userId),
  });
}
