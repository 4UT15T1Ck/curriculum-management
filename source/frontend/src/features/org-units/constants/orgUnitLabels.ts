import type { OrgUnit } from '../../../shared/org-units/orgUnits';
export const UNIT_TYPE_LABELS: Record<OrgUnit['unitType'], string> = {
  UNIVERSITY: 'Trường',
  FACULTY: 'Khoa',
  OFFICE: 'Phòng',
};
export const UNIT_STATUS_LABELS: Record<OrgUnit['status'], string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Ngừng hoạt động',
};
export const CREATABLE_UNIT_TYPES = [
  'FACULTY',
  'OFFICE',
] as const satisfies readonly OrgUnit['unitType'][];
export const ALLOWED_PARENT_TYPES: Record<
  OrgUnit['unitType'],
  readonly OrgUnit['unitType'][]
> = { UNIVERSITY: [], FACULTY: ['UNIVERSITY'], OFFICE: ['UNIVERSITY'] };
