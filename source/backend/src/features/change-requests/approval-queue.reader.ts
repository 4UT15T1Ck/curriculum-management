import { Injectable } from '@nestjs/common';
import {
  ApprovalAction,
  ChangeRequestStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { isAcademicOfficeHolder } from '../../shared/change-requests/academic-office.js';
import { isActionable } from '../../shared/change-requests/approval-rules.js';
import { APPROVAL_LEVEL } from '../../shared/change-requests/approval.constants.js';
import { groupBy } from '../../shared/collections/group-by.js';
import { USER_REF_SELECT } from '../../shared/dtos/ref.dto.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { daysSince } from '../../shared/time/days-since.js';
import { todayDate } from '../../shared/time/today.js';
import type {
  ApprovalQueueItemDto,
  ApprovalQueueQueryDto,
} from './approval-queue.dto.js';

const QUEUE_REQUEST_FIELDS = {
  id: true,
  requestCode: true,
  title: true,
  requestType: true,
  status: true,
  submissionRound: true,
  levelEnteredAt: true,
  createdBy: { select: USER_REF_SELECT },
} as const satisfies Prisma.ChangeRequestSelect;

const QUEUE_STEP_SELECT = {
  submissionRound: true,
  approvalLevel: true,
  action: true,
  createdAt: true,
  forSubjectGroup: { select: { groupCode: true } },
  forProgram: { select: { programCode: true } },
  changeRequest: { select: QUEUE_REQUEST_FIELDS },
} as const satisfies Prisma.ApprovalStepSelect;
type QueueStep = Prisma.ApprovalStepGetPayload<{
  select: typeof QUEUE_STEP_SELECT;
}>;

const QUEUE_FINAL_SELECT = {
  ...QUEUE_REQUEST_FIELDS,
  steps: {
    where: { approvalLevel: APPROVAL_LEVEL.ACADEMIC_OFFICE },
    select: { submissionRound: true, createdAt: true },
  },
} as const satisfies Prisma.ChangeRequestSelect;

type QueueRequest = QueueStep['changeRequest'];

// "Chờ tôi duyệt" (US-061): the caller's PENDING rows of the current round at the request's current level,
// plus every level-3 request for the academic office. A Return leaves the other rows dead, so they match nothing here.
@Injectable()
export class ApprovalQueueReader {
  constructor(private readonly prisma: PrismaService) {}

  async read(
    query: ApprovalQueueQueryDto,
    access: AccessContext,
  ): Promise<ApprovalQueueItemDto[]> {
    const today = todayDate();
    const typeFilter = query.requestType
      ? { requestType: query.requestType }
      : {};
    // Candidates by SQL; "same round, request at this row's level" compares two tables, so it is checked in code.
    const named = await this.prisma.approvalStep.findMany({
      where: {
        approverId: access.userId,
        action: ApprovalAction.PENDING,
        changeRequest: {
          status: {
            in: [
              ChangeRequestStatus.PENDING_COORDINATOR,
              ChangeRequestStatus.PENDING_DIRECTOR,
            ],
          },
          createdById: { not: access.userId },
          ...typeFilter,
        },
      },
      select: QUEUE_STEP_SELECT,
    });
    const rows = named.filter((step) => isActionable(step, step.changeRequest));
    const finals = (await isAcademicOfficeHolder(
      this.prisma,
      access.userId,
      today,
    ))
      ? await this.prisma.changeRequest.findMany({
          where: {
            status: ChangeRequestStatus.PENDING_ACADEMIC_OFFICE,
            createdById: { not: access.userId },
            ...typeFilter,
          },
          select: QUEUE_FINAL_SELECT,
        })
      : [];
    return [
      ...[...groupBy(rows, (step) => step.changeRequest.id).values()].map(
        (group) => toQueueItem(group, today),
      ),
      ...finals.map((request) => toFinalQueueItem(request, today)),
    ].sort(
      (a, b) =>
        b.daysWaiting - a.daysWaiting ||
        a.requestCode.localeCompare(b.requestCode),
    );
  }
}

function base(request: QueueRequest, today: Date) {
  return {
    requestId: request.id,
    requestCode: request.requestCode,
    title: request.title,
    requestType: request.requestType,
    status: request.status,
    createdBy: request.createdBy,
    daysWaiting: request.levelEnteredAt
      ? daysSince(request.levelEnteredAt, today)
      : 0,
  };
}

// One person standing for two groups (or programs) has two rows for one request: one item, both codes.
function toQueueItem(group: QueueStep[], today: Date): ApprovalQueueItemDto {
  const first = group[0];
  const codes = group.flatMap((step) => {
    const code =
      step.forSubjectGroup?.groupCode ?? step.forProgram?.programCode;
    return code ? [code] : [];
  });
  return {
    ...base(first.changeRequest, today),
    approvalLevel: first.approvalLevel,
    standsFor: codes.length > 0 ? [...new Set(codes)].sort().join(', ') : null,
    submittedAt: first.createdAt.toISOString(),
  };
}

function toFinalQueueItem(
  request: QueueRequest & {
    steps: { submissionRound: number; createdAt: Date }[];
  },
  today: Date,
): ApprovalQueueItemDto {
  const step =
    request.steps.find(
      (candidate) => candidate.submissionRound === request.submissionRound,
    ) ?? request.steps[0];
  return {
    ...base(request, today),
    approvalLevel: APPROVAL_LEVEL.ACADEMIC_OFFICE,
    standsFor: null,
    submittedAt: step.createdAt.toISOString(),
  };
}
