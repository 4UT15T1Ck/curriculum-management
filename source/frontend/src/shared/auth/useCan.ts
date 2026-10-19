import { hasPermission, type PermissionCode } from './permissions';
import { useMe } from './useMe';

export function useCan(code: PermissionCode): boolean {
  const { data: me } = useMe();
  return hasPermission(me, code);
}
