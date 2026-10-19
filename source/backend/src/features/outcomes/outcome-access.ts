import {
  ProgramVersionStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import type {
  AccessContext,
  ScopeTarget,
} from '../../shared/authz/access-context.js';
import {
  assertDirectEdit,
  EDIT_PATH,
  editPathFor,
  type EditState,
} from '../../shared/authz/edit-path.js';
import {
  PERMISSIONS,
  type PermissionCode,
} from '../../shared/authz/permission-codes.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { COMMON_ERRORS } from '../../shared/exception/error-codes.js';
import type { PrismaService } from '../../shared/prisma/prisma.service.js';
import { programEditState } from '../../shared/programs/program-target.js';
import { OUTCOME_ERRORS } from './outcome.errors.js';

// Mirrors the curriculum feature's version select (features do not import each other).
export const OUTCOME_VERSION_SELECT = {
  id: true,
  status: true,
  versionNumber: true,
  programName: true,
  programId: true,
  program: { select: { id: true, facultyId: true, programCode: true } },
} as const satisfies Prisma.ProgramVersionSelect;
export type OutcomeVersionRow = Prisma.ProgramVersionGetPayload<{
  select: typeof OUTCOME_VERSION_SELECT;
}>;

// A curriculum row with the version and course facts every matrix write starts from.
export const ITEM_WITH_VERSION_SELECT = {
  id: true,
  versionId: true,
  plannedSemester: true,
  course: {
    select: {
      id: true,
      courseCode: true,
      courseName: true,
      ownerGroupId: true,
    },
  },
  version: { select: OUTCOME_VERSION_SELECT },
} as const satisfies Prisma.CurriculumItemSelect;
export type OutcomeItemRow = Prisma.CurriculumItemGetPayload<{
  select: typeof ITEM_WITH_VERSION_SELECT;
}>;

export function assertVersionFound(
  version: OutcomeVersionRow | null,
): asserts version is OutcomeVersionRow {
  if (!version) {
    throw new AppException(OUTCOME_ERRORS.VERSION_NOT_FOUND);
  }
}

// Draft check first, as for curriculum rows: a Pending version of a never-released program is still frozen.
export async function assertOutcomeWrite(
  prisma: PrismaService | Prisma.TransactionClient,
  access: AccessContext,
  version: OutcomeVersionRow,
  permission: PermissionCode,
  target: ScopeTarget,
): Promise<void> {
  if (version.status !== ProgramVersionStatus.DRAFT) {
    throw new AppException(OUTCOME_ERRORS.VERSION_NOT_EDITABLE);
  }
  assertDirectEdit(
    access,
    permission,
    target,
    await programEditState(prisma, version.programId),
  );
}

// Matrices and coverage are staff screens; the one scoped holder of outcome.view is a student (F11-05).
export function assertMatrixReader(access: AccessContext): void {
  if (!access.scopeFor(PERMISSIONS.OUTCOME_VIEW).all) {
    throw new AppException(COMMON_ERRORS.PERMISSION_DENIED);
  }
}

export function outcomeEditAccess(
  access: AccessContext,
  version: Pick<OutcomeVersionRow, 'status'>,
  permission: PermissionCode,
  target: ScopeTarget,
  state: EditState,
) {
  const editPath = editPathFor(access, permission, target, state);
  return {
    editPath,
    canEdit:
      version.status === ProgramVersionStatus.DRAFT &&
      editPath === EDIT_PATH.DIRECT,
  };
}
