import type {
  AuthoredItem,
  AuthoredItemInput,
  ChangeRequestDetail,
} from './api/changeRequests';

// The stored shape of a SET_COURSE_FIELD item: what the editor shows as "before" and "after".
export interface CourseFieldValue {
  value: string | null;
  display?: string | null;
}

export type AuthoredItemOf<T extends AuthoredItemInput['operation']> = Extract<
  AuthoredItemInput,
  { operation: T }
>;

// The payload an authored item stored in newValue; the editors rebuild their rows from it.
export function payloadOf(item: AuthoredItem): AuthoredItemInput | null {
  const value = item.newValue as unknown;
  return value !== null && typeof value === 'object' && 'operation' in value
    ? (value as AuthoredItemInput)
    : null;
}

export function oldValueOf(item: AuthoredItem): Record<string, string | null> {
  return (item.oldValue as Record<string, string | null> | null) ?? {};
}

export type RequestPermissions = ChangeRequestDetail['permissions'];
