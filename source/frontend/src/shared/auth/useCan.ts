import { hasPermission, type PermissionCode } from './permissions';
import { useMe } from './useMe';

export function useCan(code: PermissionCode): boolean {
  const { data: me } = useMe();
  return hasPermission(me, code);
}

// Client mirror of the server's assertSchoolWideDirect (data that belongs to no unit or group).
// `/api/auth/me` lists permission codes only, without mode or scope, so this cannot tell a direct unscoped cell (R1)
// from a request-only or scoped one (R3..R5): it shows the controls to every holder and lets the server's
// PERMISSION_DENIED answer speak. Narrow it here if `me` ever carries mode and scope.
export function useCanEditSchoolWide(code: PermissionCode): boolean {
  return useCan(code);
}
