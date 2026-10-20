import { STUDENT_ROLE_CODE } from '../layout/menuItems';
import { useMe } from '../auth/useMe';
import { hasPermission } from '../auth/permissions';

// The matrices and the coverage report are staff screens: the server answers 403 to a student (F11-05).
// A user whose only role is the student's sees the PLO list and nothing else of EP-11.
export function useSeesMatrices(): boolean {
  const { data: me } = useMe();
  if (!hasPermission(me, 'outcome.view')) return false;
  const roles = me?.roles ?? [];
  return !(
    roles.length > 0 &&
    roles.every((role) => role.roleCode === STUDENT_ROLE_CODE)
  );
}
