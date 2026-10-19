import {
  ChangeRequestStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { AppException } from '../../shared/exception/app.exception.js';
import type { PrismaService } from '../../shared/prisma/prisma.service.js';
import { CHANGE_REQUEST_ERRORS } from './change-request-feature.errors.js';

// D9: unscoped viewers see every submitted request; everyone sees their own; a never-submitted draft is private.
// A scoped viewer also sees what they approve and what lies inside their scope.
export function visibleWhere(
  access: AccessContext,
): Prisma.ChangeRequestWhereInput {
  const mine: Prisma.ChangeRequestWhereInput = { createdById: access.userId };
  const scope = access.scopeFor(PERMISSIONS.CHANGE_REQUEST_VIEW);
  if (scope.all) {
    return { OR: [mine, { submissionRound: { gt: 0 } }] };
  }
  const orgUnitIds = [...scope.orgUnitIds];
  const subjectGroupIds = [...scope.subjectGroupIds];
  const programIds = [...scope.programIds];
  return {
    OR: [
      mine,
      {
        submissionRound: { gt: 0 },
        OR: [
          { steps: { some: { approverId: access.userId } } },
          {
            course: {
              OR: [
                { ownerGroupId: { in: subjectGroupIds } },
                { ownerFacultyId: { in: orgUnitIds } },
              ],
            },
          },
          {
            program: {
              OR: [
                { id: { in: programIds } },
                { facultyId: { in: orgUnitIds } },
              ],
            },
          },
          {
            subjectGroup: {
              OR: [
                { id: { in: subjectGroupIds } },
                { facultyId: { in: orgUnitIds } },
              ],
            },
          },
        ],
      },
    ],
  };
}

// What the services that act on a request (documents, items, submit, withdraw) need to know about it.
export const REQUEST_CORE_SELECT = {
  id: true,
  requestType: true,
  targetType: true,
  courseId: true,
  programId: true,
  subjectGroupId: true,
  createdById: true,
  status: true,
  submissionRound: true,
  origin: true,
  basisDocumentNumber: true,
} as const satisfies Prisma.ChangeRequestSelect;
export type RequestCore = Prisma.ChangeRequestGetPayload<{
  select: typeof REQUEST_CORE_SELECT;
}>;

// A request outside the caller's visibility answers 404, not 403: another user's private draft does not exist for them.
export async function findVisibleRequest(
  db: Pick<PrismaService, 'changeRequest'>,
  id: string,
  access: AccessContext,
): Promise<RequestCore> {
  const row = await db.changeRequest.findFirst({
    where: { id, ...visibleWhere(access) },
    select: REQUEST_CORE_SELECT,
  });
  if (!row) {
    throw new AppException(CHANGE_REQUEST_ERRORS.REQUEST_NOT_FOUND);
  }
  return row;
}

export const isFinished = (status: ChangeRequestStatus): boolean =>
  status === ChangeRequestStatus.EFFECTIVE ||
  status === ChangeRequestStatus.REJECTED ||
  status === ChangeRequestStatus.WITHDRAWN;
