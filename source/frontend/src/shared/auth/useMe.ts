import { useQuery } from '@tanstack/react-query';
import { fetchMe, meQueryKey } from './me';

export function useMe() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: fetchMe,
    staleTime: Infinity,
  });
}
