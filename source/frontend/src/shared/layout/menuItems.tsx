import { Link } from 'react-router';
import { ROUTES } from '../../routes';
import { PERMISSIONS, type PermissionCode } from '../auth/permissions';

// A leaf has a `path`; a group has `children` and no path of its own.
export interface AppMenuItem {
  path?: string;
  label: string;
  permission?: PermissionCode;
  children?: readonly AppMenuItem[];
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
    label: 'Học phần',
    children: [
      {
        path: ROUTES.courses,
        label: 'Danh mục học phần',
        permission: PERMISSIONS.courseView,
      },
      {
        path: ROUTES.equivalenceGroups,
        label: 'Nhóm tương đương',
        permission: PERMISSIONS.courseView,
      },
    ],
  },
  {
    path: ROUTES.permissionMatrix,
    label: 'Ma trận quyền',
    permission: PERMISSIONS.permissionView,
  },
  { path: ROUTES.health, label: 'Trạng thái hệ thống' },
];

type MenuEntry =
  | { key: string; label: React.ReactNode }
  | { key: string; label: string; children: MenuEntry[] };

const groupKey = (item: AppMenuItem) => `group:${item.label}`;

function isVisible(
  item: AppMenuItem,
  permissions: readonly PermissionCode[],
): boolean {
  return item.children
    ? item.children.some((child) => isVisible(child, permissions))
    : !item.permission || permissions.includes(item.permission);
}

export function toMenuItems(
  items: readonly AppMenuItem[],
  permissions: readonly PermissionCode[],
): MenuEntry[] {
  return items
    .filter((item) => isVisible(item, permissions))
    .map((item) =>
      item.children
        ? {
            key: groupKey(item),
            label: item.label,
            children: toMenuItems(item.children, permissions),
          }
        : {
            key: item.path ?? item.label,
            label: <Link to={item.path ?? ROUTES.home}>{item.label}</Link>,
          },
    );
}

function leaves(items: readonly AppMenuItem[]): AppMenuItem[] {
  return items.flatMap((item) =>
    item.children ? leaves(item.children) : item,
  );
}

// The leaf whose path is the current page or the page's parent (`/courses/c1` selects `/courses`).
export function selectedMenuPath(
  items: readonly AppMenuItem[],
  pathname: string,
): string {
  return (
    leaves(items).find(
      (item) =>
        item.path !== undefined &&
        (pathname === item.path ||
          (item.path !== ROUTES.home && pathname.startsWith(`${item.path}/`))),
    )?.path ?? pathname
  );
}

// Groups that contain the selected leaf, so the submenu is open on arrival.
export function openMenuGroups(
  items: readonly AppMenuItem[],
  selectedPath: string,
): string[] {
  return items
    .filter((item) =>
      item.children
        ? leaves(item.children).some((leaf) => leaf.path === selectedPath)
        : false,
    )
    .map(groupKey);
}
