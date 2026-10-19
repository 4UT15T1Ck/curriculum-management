import {
  ProgramVersionStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import type {
  AccessContext,
  ScopeTarget,
} from '../../shared/authz/access-context.js';
import { assertDirectEdit } from '../../shared/authz/edit-path.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { AppException } from '../../shared/exception/app.exception.js';
import type { PrismaService } from '../../shared/prisma/prisma.service.js';
import {
  programEditState,
  programTarget,
} from '../../shared/programs/program-target.js';
import {
  CURRICULUM_CONSTRAINT,
  CURRICULUM_ERRORS,
} from './curriculum.errors.js';

// Everything a write needs to decide on the version, plus what the read screen prints about it.
export const VERSION_SELECT = {
  id: true,
  status: true,
  semesterCount: true,
  programId: true,
  programName: true,
  versionNumber: true,
  totalCredits: true,
  compulsoryCredits: true,
  electiveCredits: true,
  program: { select: { id: true, facultyId: true, programCode: true } },
} as const satisfies Prisma.ProgramVersionSelect;
export type VersionRow = Prisma.ProgramVersionGetPayload<{
  select: typeof VERSION_SELECT;
}>;

// A row is reachable through its program (R1, R3) or through its course's subject group (R4, R5).
export function itemTarget(
  version: VersionRow,
  course: { ownerGroupId: string | null },
): ScopeTarget {
  return {
    ...programTarget(version.program),
    subjectGroupIds: course.ownerGroupId ? [course.ownerGroupId] : [],
  };
}

export function assertDraft(version: Pick<VersionRow, 'status'>): void {
  if (version.status !== ProgramVersionStatus.DRAFT) {
    throw new AppException(CURRICULUM_ERRORS.VERSION_NOT_EDITABLE);
  }
}

// Draft check first: a Pending version of a never-released program is still frozen.
export async function assertCurriculumWrite(
  prisma: PrismaService | Prisma.TransactionClient,
  access: AccessContext,
  version: VersionRow,
  target: ScopeTarget,
): Promise<void> {
  assertDraft(version);
  assertDirectEdit(
    access,
    PERMISSIONS.CURRICULUM_EDIT,
    target,
    await programEditState(prisma, version.programId),
  );
}

export function assertSemesterInRange(
  version: Pick<VersionRow, 'semesterCount'>,
  semester: number,
): void {
  if (semester <= version.semesterCount) {
    return;
  }
  const base = CURRICULUM_ERRORS.SEMESTER_OUT_OF_RANGE;
  throw new AppException(
    { ...base, message: `${base.message} (${version.semesterCount} học kỳ).` },
    [
      {
        field: 'plannedSemester',
        constraints: [CURRICULUM_CONSTRAINT.SEMESTER_RANGE],
      },
    ],
  );
}

// R4/R5 hold curriculum.edit scoped to subject groups; whether a given course matches is decided per row.
export function holdsGroupScope(access: AccessContext): boolean {
  const scope = access.scopeFor(PERMISSIONS.CURRICULUM_EDIT);
  return scope.all || scope.subjectGroupIds.size > 0;
}
