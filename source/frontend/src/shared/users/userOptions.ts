import { getJson, withQuery } from '../api/client';
import type { components } from '../api/schema';

export type UserOption = Pick<
  components['schemas']['UserSummaryDto'],
  'id' | 'userCode' | 'fullName'
>;
type UserPage = components['schemas']['UserPageDto'];
export const USER_OPTIONS_PAGE_SIZE = 20;
// GET /users is R1-only; a screen for other roles passes its own search path (an array of options, not a page).
export const USERS_SEARCH_PATH = '/users';
export const userOptionsQueryKey = (
  q: string,
  searchPath: string = USERS_SEARCH_PATH,
) => ['users', 'options', searchPath, q] as const;
export async function fetchUserOptions(
  q: string,
  searchPath: string = USERS_SEARCH_PATH,
): Promise<UserOption[]> {
  if (searchPath !== USERS_SEARCH_PATH) {
    return getJson<UserOption[]>(withQuery(searchPath, { q }));
  }
  return (
    await getJson<UserPage>(
      withQuery(USERS_SEARCH_PATH, {
        q,
        status: 'ACTIVE',
        page: 1,
        pageSize: USER_OPTIONS_PAGE_SIZE,
      }),
    )
  ).items;
}
