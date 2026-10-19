import { ProgramVersionStatus } from '../../generated/prisma/client.js';
import type { AccessContext, ScopeTarget } from '../authz/access-context.js';
import {
  assertSchoolWideDirect,
  EDIT_PATH,
  isSchoolWideDirect,
  type EditPath,
  type EditState,
} from '../authz/edit-path.js';
import { PERMISSIONS, type PermissionCode } from '../authz/permission-codes.js';
import {
  assertEditPath,
  type RequestDraftRef,
} from '../change-requests/request-draft.js';

interface CorrectionFacts {
  status: ProgramVersionStatus;
  correctionOfId: string | null;
}

// A correction Draft (US-076) is the one released-program Draft R1 edits directly: PB-08 needs no request, but it
// is never edited through the request path nor by anyone but the academic office (version.correct, school-wide).
export function isCorrectionDraft(version: CorrectionFacts): boolean {
  return (
    version.status === ProgramVersionStatus.DRAFT &&
    Boolean(version.correctionOfId)
  );
}

export function canEditCorrection(access: AccessContext): boolean {
  return isSchoolWideDirect(access, PERMISSIONS.VERSION_CORRECT);
}

// The write guard of every Draft writer: a correction Draft takes the R1 correction branch before the normal edit path.
export async function assertVersionWritePath(
  access: AccessContext,
  code: PermissionCode,
  target: ScopeTarget,
  version: {
    sourceRequest: RequestDraftRef | null;
    correctionOfId: string | null;
  },
  state: () => Promise<EditState>,
): Promise<void> {
  if (version.correctionOfId) {
    assertSchoolWideDirect(access, PERMISSIONS.VERSION_CORRECT);
    return;
  }
  await assertEditPath(access, code, target, version.sourceRequest, state);
}

// The read-side twin: what a correction Draft's screens offer the caller.
export function correctionEditPath(access: AccessContext): EditPath | null {
  return canEditCorrection(access) ? EDIT_PATH.DIRECT : null;
}
