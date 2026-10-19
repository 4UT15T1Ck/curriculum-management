import { Injectable } from '@nestjs/common';
import {
  ApprovalAction,
  type ApprovalStep,
  type ChangeRequest,
  type ChangeRequestStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import { AppException } from '../exception/app.exception.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { isAcademicOfficeHolder } from './academic-office.js';
import { levelOfStatus } from './approval-rules.js';
import {
  APPROVAL_LEVEL,
  PENDING_STATUS_BY_LEVEL,
  type ApprovalLevel,
} from './approval.constants.js';
import { APPROVAL_ERRORS } from './approval.errors.js';

type Db = PrismaService | Prisma.TransactionClient;

export type DecisionSubject = Pick<
  ChangeRequest,
  'id' | 'status' | 'submissionRound' | 'createdById' | 'requestType'
>;

export type ClosingAction =
  typeof ApprovalAction.RETURN | typeof ApprovalAction.REJECT;
export type DecisionAction = typeof ApprovalAction.APPROVE | ClosingAction;

export interface Decision {
  action: DecisionAction;
  remark: string | null;
  performedById: string;
  isOverride: boolean;
}

export type AdvanceResult =
  | { kind: 'WAITING' }
  | { kind: 'NEXT_LEVEL'; level: ApprovalLevel }
  | { kind: 'COMPLETE' };

// The one writer of decisions and level moves (D1): F-14's approve / return / reject / override and F-15's final approval share it.
@Injectable()
export class ApprovalRecorder {
  // Serialises decisions on one request: a second decider waits on this row and then sees the first one's rows.
  async claim(
    tx: Prisma.TransactionClient,
    request: DecisionSubject,
  ): Promise<void> {
    const { count } = await tx.changeRequest.updateMany({
      where: {
        id: request.id,
        status: request.status,
        submissionRound: request.submissionRound,
      },
      data: { updatedAt: new Date() },
    });
    if (count === 0) {
      throw new AppException(APPROVAL_ERRORS.REQUEST_STATE_CHANGED);
    }
  }

  // Rows the user may decide now. Level 3 has no named approver: any active academic-office holder acts (D11).
  async actionableRows(
    db: Db,
    request: DecisionSubject,
    userId: string,
    today: Date,
  ): Promise<ApprovalStep[]> {
    const level = levelOfStatus(request.status);
    if (level === null || userId === request.createdById) return [];
    const isFinalLevel = level === APPROVAL_LEVEL.ACADEMIC_OFFICE;
    if (isFinalLevel && !(await isAcademicOfficeHolder(db, userId, today))) {
      return [];
    }
    return db.approvalStep.findMany({
      where: {
        changeRequestId: request.id,
        submissionRound: request.submissionRound,
        approvalLevel: level,
        action: ApprovalAction.PENDING,
        ...(!isFinalLevel && { approverId: userId }),
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
  }

  async record(
    tx: Prisma.TransactionClient,
    rowIds: readonly string[],
    decision: Decision,
  ): Promise<void> {
    const { count } = await tx.approvalStep.updateMany({
      where: { id: { in: [...rowIds] }, action: ApprovalAction.PENDING },
      data: { ...decision, recordedAt: new Date() },
    });
    if (count !== rowIds.length) {
      throw new AppException(APPROVAL_ERRORS.STEP_ALREADY_DECIDED);
    }
  }

  // After an APPROVE: stay while the level still has PENDING rows, else move to the lowest higher level that has one.
  async advance(
    tx: Prisma.TransactionClient,
    request: DecisionSubject,
  ): Promise<AdvanceResult> {
    const level = levelOfStatus(request.status)!;
    const pending = await tx.approvalStep.findMany({
      where: {
        changeRequestId: request.id,
        submissionRound: request.submissionRound,
        action: ApprovalAction.PENDING,
        approvalLevel: { gte: level },
      },
      select: { approvalLevel: true },
      orderBy: { approvalLevel: 'asc' },
    });
    if (pending.some((row) => row.approvalLevel === level)) {
      return { kind: 'WAITING' };
    }
    if (pending.length === 0) return { kind: 'COMPLETE' };
    const next = pending[0].approvalLevel as ApprovalLevel;
    await tx.changeRequest.update({
      where: { id: request.id },
      data: {
        status: PENDING_STATUS_BY_LEVEL[next],
        levelEnteredAt: new Date(),
      },
    });
    return { kind: 'NEXT_LEVEL', level: next };
  }

  // Leaves PENDING_*: the time-at-level clock stops (D12).
  async close(
    tx: Prisma.TransactionClient,
    requestId: string,
    status: ChangeRequestStatus,
  ): Promise<void> {
    await tx.changeRequest.update({
      where: { id: requestId },
      data: { status, levelEnteredAt: null },
    });
  }
}
