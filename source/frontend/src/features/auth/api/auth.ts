import { sendJson } from '../../../shared/api/client';
import type { components } from '../../../shared/api/schema';
import type { Me } from '../../../shared/auth/me';

export type LoginRequest = components['schemas']['LoginDto'];
export type ChangePasswordRequest = components['schemas']['ChangePasswordDto'];
const LOGIN_PATH = '/auth/login';
const CHANGE_PASSWORD_PATH = '/auth/change-password';

export function login(body: LoginRequest): Promise<Me> {
  return sendJson<Me>('POST', LOGIN_PATH, body);
}
export function changePassword(body: ChangePasswordRequest): Promise<void> {
  return sendJson<void>('POST', CHANGE_PASSWORD_PATH, body);
}
