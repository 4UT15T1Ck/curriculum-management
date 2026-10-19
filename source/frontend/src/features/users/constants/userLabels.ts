import type { UserStatus } from '../api/users';
import type { RoleAssignment } from '../api/roleAssignments';

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: 'Hoạt động',
  DISABLED: 'Vô hiệu hóa',
};
export const USER_STATUS_COLORS: Record<UserStatus, string> = {
  ACTIVE: 'green',
  DISABLED: 'default',
};
export const SCOPE_TYPE_LABELS: Record<RoleAssignment['scopeType'], string> = {
  SYSTEM: 'Toàn hệ thống',
  UNIT: 'Đơn vị',
  ASSIGNMENT: 'Theo phân công',
};
