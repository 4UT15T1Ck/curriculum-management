import { getJson, withQuery } from '../../../shared/api/client';
import type { components } from '../../../shared/api/schema';

export type UserSubjectGroupMembership =
  components['schemas']['UserSubjectGroupMembershipDto'];
export function fetchSubjectGroupMemberships(
  userId: string,
): Promise<UserSubjectGroupMembership[]> {
  return getJson(withQuery('/subject-group-memberships', { userId }));
}
