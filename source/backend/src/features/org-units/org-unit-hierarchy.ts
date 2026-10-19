import { OrgUnitType } from '../../generated/prisma/client.js';

export const CREATABLE_UNIT_TYPES = [
  OrgUnitType.FACULTY,
  OrgUnitType.OFFICE,
] as const;
export const ALLOWED_PARENT_TYPES: Record<OrgUnitType, readonly OrgUnitType[]> =
  {
    UNIVERSITY: [],
    FACULTY: [OrgUnitType.UNIVERSITY],
    OFFICE: [OrgUnitType.UNIVERSITY],
  };

export function isAllowedParent(
  childType: OrgUnitType,
  parentType: OrgUnitType,
): boolean {
  return ALLOWED_PARENT_TYPES[childType].includes(parentType);
}

export function createsCycle(
  unitId: string,
  candidateParentId: string,
  parentOf: ReadonlyMap<string, string | null>,
): boolean {
  for (
    let current: string | null = candidateParentId;
    current;
    current = parentOf.get(current) ?? null
  ) {
    if (current === unitId) return true;
  }
  return false;
}
