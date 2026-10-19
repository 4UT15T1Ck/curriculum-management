import { getJson, sendJson, withQuery } from '../../../shared/api/client';
import type { PageParams } from '../../../shared/api/pagination';
import type { components } from '../../../shared/api/schema';

export type UserSummary = components['schemas']['UserSummaryDto'];
export type UserDetail = components['schemas']['UserDetailDto'];
export type UserPage = components['schemas']['UserPageDto'];
export type CreateUserRequest = components['schemas']['CreateUserDto'];
export type UpdateUserRequest = components['schemas']['UpdateUserDto'];
export type CreatedUser = components['schemas']['CreatedUserDto'];
export type TemporaryPassword = components['schemas']['TemporaryPasswordDto'];
export type UserStatus = UserSummary['status'];

export interface UserListParams extends PageParams {
  q?: string;
  orgUnitId?: string;
  status?: UserStatus;
}

const USERS_PATH = '/users';
const userPath = (userId: string) =>
  `${USERS_PATH}/${encodeURIComponent(userId)}`;

export const fetchUsers = (params: UserListParams) =>
  getJson<UserPage>(withQuery(USERS_PATH, { ...params }));
export const fetchUser = (userId: string) =>
  getJson<UserDetail>(userPath(userId));
export const createUser = (body: CreateUserRequest) =>
  sendJson<CreatedUser>('POST', USERS_PATH, body);
export const updateUser = (userId: string, body: UpdateUserRequest) =>
  sendJson<UserDetail>('PATCH', userPath(userId), body);
export const disableUser = (userId: string) =>
  sendJson<UserDetail>('POST', `${userPath(userId)}/disable`);
export const enableUser = (userId: string) =>
  sendJson<UserDetail>('POST', `${userPath(userId)}/enable`);
export const resetUserPassword = (userId: string) =>
  sendJson<TemporaryPassword>('POST', `${userPath(userId)}/reset-password`);
