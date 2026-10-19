import { PERMISSIONS, type PermissionCode } from './permission-codes.js';

export const LOCKED_CELLS = [
  { roleCode: 'R1', permissionCode: PERMISSIONS.PERMISSION_MANAGE },
  { roleCode: 'R1', permissionCode: PERMISSIONS.USER_MANAGE },
] as const satisfies readonly {
  roleCode: string;
  permissionCode: PermissionCode;
}[];

export function isLockedCell(
  roleCode: string,
  permissionCode: string,
): boolean {
  return LOCKED_CELLS.some(
    (cell) =>
      cell.roleCode === roleCode && cell.permissionCode === permissionCode,
  );
}
