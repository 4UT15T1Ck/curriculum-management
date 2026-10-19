import { Injectable } from '@nestjs/common';
import {
  ChangeRequestStatus,
  ProgramVersionStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import { ApprovalRecorder } from '../change-requests/approval-recorder.js';
import { APPROVAL_ERRORS } from '../change-requests/approval.errors.js';
import { RequestNotifier } from '../change-requests/request-notifier.js';
import { AppException } from '../exception/app.exception.js';
import { toIsoDay, todayDate } from '../time/today.js';
import { lockPrograms, lockSemester } from './release-locks.js';

// PB-06: a Pending version becomes Active once its semester has begun, and the version it replaces goes Historical.
// Safe to run twice: a version that is no longer Pending is left alone, and the request closes (and notifies) once.
@Injectable()
export class VersionActivator {
  constructor(
    private readonly recorder: ApprovalRecorder,
    private readonly notifier: RequestNotifier,
  ) {}

  async activate(
    tx: Prisma.TransactionClient,
    versionId: string,
    today: Date = todayDate(),
  ): Promise<boolean> {
    const version = await tx.programVersion.findUniqueOrThrow({
      where: { id: versionId },
    });
    if (
      version.status !== ProgramVersionStatus.PENDING ||
      !version.effectiveSemesterId
    ) {
      return false;
    }
    // Locks in one order everywhere: semester, request, program (a start-date edit takes the same order).
    await lockSemester(tx, version.effectiveSemesterId);
    const semester = await tx.semester.findUniqueOrThrow({
      where: { id: version.effectiveSemesterId },
    });
    if (!semester.startDate || toIsoDay(semester.startDate) > toIsoDay(today)) {
      return false;
    }
    const requestId = version.originRequestId;
    const claimedRequest = requestId
      ? await this.claimRequest(tx, requestId)
      : false;
    await lockPrograms(tx, [version.programId]);
    const fresh = await tx.programVersion.findUniqueOrThrow({
      where: { id: versionId },
      select: { status: true },
    });
    if (fresh.status !== ProgramVersionStatus.PENDING) return false;
    await tx.programVersion.updateMany({
      where: {
        programId: version.programId,
        status: ProgramVersionStatus.ACTIVE,
      },
      data: { status: ProgramVersionStatus.HISTORICAL },
    });
    const flipped = await tx.programVersion.updateMany({
      where: { id: versionId, status: ProgramVersionStatus.PENDING },
      data: { status: ProgramVersionStatus.ACTIVE },
    });
    if (flipped.count === 0) {
      throw new AppException(APPROVAL_ERRORS.REQUEST_STATE_CHANGED);
    }
    if (requestId && claimedRequest) {
      const waiting = await tx.programVersion.count({
        where: {
          originRequestId: requestId,
          status: ProgramVersionStatus.PENDING,
        },
      });
      if (waiting === 0) {
        await this.recorder.close(tx, requestId, ChangeRequestStatus.EFFECTIVE);
        const request = await tx.changeRequest.findUniqueOrThrow({
          where: { id: requestId },
        });
        await this.notifier.effective(
          tx,
          request,
          version.effectiveSemesterId!,
          version.publishedById ?? request.createdById,
        );
      }
    }
    return true;
  }

  // Touches the request row only while it is Approved: a request already Effective is never closed or notified again.
  private async claimRequest(
    tx: Prisma.TransactionClient,
    requestId: string,
  ): Promise<boolean> {
    const { count } = await tx.changeRequest.updateMany({
      where: { id: requestId, status: ChangeRequestStatus.APPROVED },
      data: { updatedAt: new Date() },
    });
    return count > 0;
  }
}
