import { getJson } from '../api/client';
import type { components } from '../api/schema';

export type OrgUnit = components['schemas']['OrgUnitDto'];
export const orgUnitsQueryKey = ['org-units'] as const;
const ORG_UNITS_PATH = '/org-units';

export function fetchOrgUnits(): Promise<OrgUnit[]> {
  return getJson<OrgUnit[]>(ORG_UNITS_PATH);
}
