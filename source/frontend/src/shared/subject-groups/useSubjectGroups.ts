import { useQuery } from '@tanstack/react-query';
import {
  fetchSubjectGroups,
  subjectGroupListQueryKey,
  type SubjectGroupListParams,
} from './subjectGroups';

export function useSubjectGroups(
  params: SubjectGroupListParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: subjectGroupListQueryKey(params),
    queryFn: () => fetchSubjectGroups(params),
    enabled,
  });
}
