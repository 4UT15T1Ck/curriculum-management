import type { components } from '../api/schema';
import type { Me } from './me';

export type PermissionCode = components['schemas']['PermissionCode'];

export const PERMISSIONS = {
  userManage: 'user.manage',
  permissionView: 'permission.view',
  permissionManage: 'permission.manage',
  orgUnitManage: 'orgUnit.manage',
  subjectGroupView: 'subjectGroup.view',
  courseView: 'course.view',
  courseEdit: 'course.edit',
  courseRelationEdit: 'courseRelation.edit',
} as const satisfies Record<string, PermissionCode>;

export function hasPermission(
  me: Me | null | undefined,
  code: PermissionCode,
): boolean {
  return me?.permissions.includes(code) ?? false;
}
