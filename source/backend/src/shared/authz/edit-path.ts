import type { PermissionMode } from '../../generated/prisma/client.js';
import { AppException } from '../exception/app.exception.js';
import { COMMON_ERRORS } from '../exception/error-codes.js';
import type { AccessContext, ScopeTarget } from './access-context.js';
import type { PermissionCode } from './permission-codes.js';

export const EDIT_PATH = {
  DIRECT: 'DIRECT',
  VIA_REQUEST: 'VIA_REQUEST',
} as const;
export type EditPath = (typeof EDIT_PATH)[keyof typeof EDIT_PATH];
export const EDIT_PATHS = Object.values(EDIT_PATH);

export interface EditState {
  // The object (or the version holding it) has left Draft; FR-55 then routes every change through a request.
  released: boolean;
  // Before release, holders of a VIA_REQUEST cell may still edit directly (H-4).
  draftOpenToRequestHolders: boolean;
}

// The path the caller would take, or null when no cell of theirs covers the target.
export function editPathFor(
  access: AccessContext,
  code: PermissionCode,
  target: ScopeTarget,
  state: EditState,
): EditPath | null {
  const mode = access.modeFor(code, target);
  if (mode === null) {
    return null;
  }
  return decide(mode, state);
}

// Throws PERMISSION_DENIED or OUT_OF_SCOPE when the caller may not edit at all.
export function resolveEditPath(
  access: AccessContext,
  code: PermissionCode,
  target: ScopeTarget,
  state: EditState,
): EditPath {
  return decide(access.assertCan(code, target), state);
}

export function assertDirectEdit(
  access: AccessContext,
  code: PermissionCode,
  target: ScopeTarget,
  state: EditState,
): void {
  if (resolveEditPath(access, code, target, state) !== EDIT_PATH.DIRECT) {
    throw new AppException(COMMON_ERRORS.CHANGE_REQUEST_REQUIRED);
  }
}

function decide(mode: PermissionMode, state: EditState): EditPath {
  if (state.released) {
    return EDIT_PATH.VIA_REQUEST;
  }
  return mode === 'DIRECT' || state.draftOpenToRequestHolders
    ? EDIT_PATH.DIRECT
    : EDIT_PATH.VIA_REQUEST;
}
