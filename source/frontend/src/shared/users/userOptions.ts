import { getJson, withQuery } from '../api/client';
import type { components } from '../api/schema';

export type UserOption = components['schemas']['UserSummaryDto'];
type UserPage = components['schemas']['UserPageDto'];
export const USER_OPTIONS_PAGE_SIZE = 20;
export const userOptionsQueryKey = (q: string) =>
  ['users', 'options', q] as const;
export async function fetchUserOptions(q: string): Promise<UserOption[]> {
  return (
    await getJson<UserPage>(
      withQuery('/users', {
        q,
        status: 'ACTIVE',
        page: 1,
        pageSize: USER_OPTIONS_PAGE_SIZE,
      }),
    )
  ).items;
}
