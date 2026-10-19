import { getJson, sendJson } from '../../../shared/api/client';
import type { components } from '../../../shared/api/schema';

export type PermissionMatrix = components['schemas']['PermissionMatrixDto'];
export type MatrixCell = components['schemas']['MatrixCellDto'];
export type SetRolePermissionRequest =
  components['schemas']['SetRolePermissionDto'];
const MATRIX_PATH = '/permissions/matrix';
const cellPath = (roleCode: string, permissionCode: string) =>
  `/roles/${encodeURIComponent(roleCode)}/permissions/${encodeURIComponent(permissionCode)}`;
export const fetchPermissionMatrix = () =>
  getJson<PermissionMatrix>(MATRIX_PATH);
export const setMatrixCell = (
  roleCode: string,
  permissionCode: string,
  body: SetRolePermissionRequest,
) => sendJson<MatrixCell>('PUT', cellPath(roleCode, permissionCode), body);
export const clearMatrixCell = (roleCode: string, permissionCode: string) =>
  sendJson<void>('DELETE', cellPath(roleCode, permissionCode));
