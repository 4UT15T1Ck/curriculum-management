import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orgUnitsQueryKey } from '../../../shared/org-units/orgUnits';
import {
  activateOrgUnit,
  createOrgUnit,
  deactivateOrgUnit,
  updateOrgUnit,
} from '../api/orgUnitAdmin';

function useInvalidateOrgUnits() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: orgUnitsQueryKey });
}
export function useCreateOrgUnit() {
  const invalidate = useInvalidateOrgUnits();
  return useMutation({ mutationFn: createOrgUnit, onSuccess: invalidate });
}
export function useUpdateOrgUnit() {
  const invalidate = useInvalidateOrgUnits();
  return useMutation({
    mutationFn: ({
      unitId,
      body,
    }: {
      unitId: string;
      body: Parameters<typeof updateOrgUnit>[1];
    }) => updateOrgUnit(unitId, body),
    onSuccess: invalidate,
  });
}
export function useDeactivateOrgUnit() {
  const invalidate = useInvalidateOrgUnits();
  return useMutation({ mutationFn: deactivateOrgUnit, onSuccess: invalidate });
}
export function useActivateOrgUnit() {
  const invalidate = useInvalidateOrgUnits();
  return useMutation({ mutationFn: activateOrgUnit, onSuccess: invalidate });
}
