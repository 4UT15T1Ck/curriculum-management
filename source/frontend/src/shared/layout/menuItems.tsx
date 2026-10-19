import { Link } from 'react-router';
import { ROUTES } from '../../routes';
import { PERMISSIONS, type PermissionCode } from '../auth/permissions';

export interface AppMenuItem {
  path: string;
  label: string;
  permission?: PermissionCode;
}

export const APP_MENU: readonly AppMenuItem[] = [
  { path: ROUTES.home, label: 'Trang chính' },
  {
    path: ROUTES.users,
    label: 'Tài khoản',
    permission: PERMISSIONS.userManage,
  },
  {
    path: ROUTES.orgUnits,
    label: 'Đơn vị',
    permission: PERMISSIONS.orgUnitManage,
  },
  {
    path: ROUTES.subjectGroups,
    label: 'Nhóm chuyên môn',
    permission: PERMISSIONS.subjectGroupView,
  },
  {
    path: ROUTES.courses,
    label: 'Học phần',
    permission: PERMISSIONS.courseView,
  },
  {
    path: ROUTES.permissionMatrix,
    label: 'Ma trận quyền',
    permission: PERMISSIONS.permissionView,
  },
  { path: ROUTES.health, label: 'Trạng thái hệ thống' },
];

export function toMenuItems(
  items: readonly AppMenuItem[],
  permissions: readonly PermissionCode[],
) {
  return items
    .filter((item) => !item.permission || permissions.includes(item.permission))
    .map((item) => ({
      key: item.path,
      label: <Link to={item.path}>{item.label}</Link>,
    }));
}
