import { ChangeRequestStatus } from '../../generated/prisma/client.js';
import type { AccessContext, ScopeTarget } from '../authz/access-context.js';
import { assertDirectEdit, type EditState } from '../authz/edit-path.js';
import type { PermissionCode } from '../authz/permission-codes.js';
import { AppException } from '../exception/app.exception.js';
import { REQUEST_DRAFT_ERRORS } from './change-request.errors.js';

// Selected by every row that can be a request's working copy (program versions, syllabus revisions).
export const REQUEST_DRAFT_SELECT = {
  sourceRequest: {
    select: { id: true, requestCode: true, status: true, createdById: true },
  },
} as const;

export interface RequestDraftRef {
  id: string;
  requestCode: string;
  status: ChangeRequestStatus;
  createdById: string;
}

export interface RequestRef {
  id: string;
  requestCode: string;
  status: ChangeRequestStatus;
}

// The only door into a request's working copy; released data itself still answers CHANGE_REQUEST_REQUIRED.
// Without a request this is the old direct-edit rule; the state thunk is never called for a copy.
export async function assertEditPath(
  access: AccessContext,
  code: PermissionCode,
  target: ScopeTarget,
  request: RequestDraftRef | null,
  state: () => Promise<EditState>,
): Promise<void> {
  if (!request) {
    assertDirectEdit(access, code, target, await state());
    return;
  }
  assertCopyWritable(access, code, target, request);
}

// Permission first, then creator, then Draft: a colleague holding the permission is told why the copy is not theirs.
export function assertCopyWritable(
  access: AccessContext,
  code: PermissionCode,
  target: ScopeTarget,
  request: RequestDraftRef,
): void {
  access.assertCan(code, target);
  if (request.createdById !== access.userId) {
    throw new AppException(REQUEST_DRAFT_ERRORS.NOT_CREATOR);
  }
  if (request.status !== ChangeRequestStatus.DRAFT) {
    throw new AppException(REQUEST_DRAFT_ERRORS.NOT_DRAFT);
  }
}

// The read-side twin of assertEditPath: may this caller edit the copy right now.
export function canEditCopy(
  access: AccessContext,
  code: PermissionCode,
  target: ScopeTarget,
  request: RequestDraftRef,
): boolean {
  return (
    request.createdById === access.userId &&
    request.status === ChangeRequestStatus.DRAFT &&
    access.modeFor(code, target) !== null
  );
}

export function toRequestRef(
  request: RequestDraftRef | null,
): RequestRef | null {
  return (
    request && {
      id: request.id,
      requestCode: request.requestCode,
      status: request.status,
    }
  );
}
