import { sendJson } from '../../../shared/api/client';
import type { components } from '../../../shared/api/schema';
import type { OrgUnit } from '../../../shared/org-units/orgUnits';

export type CreateOrgUnitRequest = components['schemas']['CreateOrgUnitDto'];
export type UpdateOrgUnitRequest = components['schemas']['UpdateOrgUnitDto'];
const ORG_UNITS_PATH = '/org-units';
const unitPath = (unitId: string) =>
  `${ORG_UNITS_PATH}/${encodeURIComponent(unitId)}`;
export const createOrgUnit = (body: CreateOrgUnitRequest) =>
  sendJson<OrgUnit>('POST', ORG_UNITS_PATH, body);
export const updateOrgUnit = (unitId: string, body: UpdateOrgUnitRequest) =>
  sendJson<OrgUnit>('PATCH', unitPath(unitId), body);
export const deactivateOrgUnit = (unitId: string) =>
  sendJson<OrgUnit>('POST', `${unitPath(unitId)}/deactivate`);
export const activateOrgUnit = (unitId: string) =>
  sendJson<OrgUnit>('POST', `${unitPath(unitId)}/activate`);
