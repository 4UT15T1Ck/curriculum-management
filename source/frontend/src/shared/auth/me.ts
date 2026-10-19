import { ApiError, getJson, sendJson } from '../api/client';
import { UNAUTHORIZED } from '../api/errorCodes';
import type { components } from '../api/schema';

export type Me = components['schemas']['MeDto'];
export const meQueryKey = ['auth', 'me'] as const;
const ME_PATH = '/auth/me';
const LOGOUT_PATH = '/auth/logout';

export async function fetchMe(): Promise<Me | null> {
  try {
    return await getJson<Me>(ME_PATH);
  } catch (error) {
    if (error instanceof ApiError && error.status === UNAUTHORIZED) return null;
    throw error;
  }
}

export function logout(): Promise<void> {
  return sendJson<void>('POST', LOGOUT_PATH);
}
