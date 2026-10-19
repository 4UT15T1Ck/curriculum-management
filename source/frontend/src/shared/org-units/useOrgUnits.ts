import { useQuery } from '@tanstack/react-query';
import { fetchOrgUnits, orgUnitsQueryKey } from './orgUnits';

const ORG_UNITS_STALE_MS = 5 * 60 * 1000;

export function useOrgUnits() {
  return useQuery({
    queryKey: orgUnitsQueryKey,
    queryFn: fetchOrgUnits,
    staleTime: ORG_UNITS_STALE_MS,
  });
}
