import { Injectable } from '@nestjs/common';
import type { ChangeRequest, Prisma } from '../../generated/prisma/client.js';
import {
  AUTHORED_OPERATION,
  type AuthoredPayload,
} from '../../shared/change-requests/authored-item.types.js';
import { AppException } from '../../shared/exception/app.exception.js';
import {
  assignDirector,
  endDirector,
} from '../../shared/programs/director.writer.js';
import {
  addMembership,
  endMembership,
} from '../../shared/subject-groups/membership.writer.js';
import { APPROVAL_FEATURE_ERRORS } from './approval-feature.errors.js';

type AppliedRequest = Pick<
  ChangeRequest,
  'id' | 'subjectGroupId' | 'programId'
>;

// US-060 AC2: an approved organisational request changes the group or the director assignment at once, with the owning rules.
@Injectable()
export class OrganizationalApplier {
  // Items run in authored order on one transaction, so a member added by item 1 covers a coordinator row in item 2.
  async apply(
    tx: Prisma.TransactionClient,
    request: AppliedRequest,
    actorId: string,
  ): Promise<void> {
    const items = await tx.changeItem.findMany({
      where: { changeRequestId: request.id },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    for (const item of items) {
      try {
        await this.applyOne(
          tx,
          request,
          item.newValue as unknown as AuthoredPayload,
          actorId,
        );
      } catch (error) {
        if (!(error instanceof AppException)) throw error;
        throw new AppException(
          APPROVAL_FEATURE_ERRORS.ORGANIZATION_APPLY_FAILED,
          [{ field: item.label, constraints: [error.code] }],
        );
      }
    }
  }

  private applyOne(
    tx: Prisma.TransactionClient,
    request: AppliedRequest,
    payload: AuthoredPayload,
    actorId: string,
  ) {
    switch (payload.operation) {
      case AUTHORED_OPERATION.ADD_MEMBER:
        return addMembership(tx, request.subjectGroupId!, payload, actorId);
      case AUTHORED_OPERATION.END_MEMBERSHIP:
        return endMembership(
          tx,
          request.subjectGroupId!,
          payload.memberRowId,
          payload.validTo,
          actorId,
        );
      case AUTHORED_OPERATION.ASSIGN_DIRECTOR:
        return assignDirector(tx, request.programId!, payload, actorId);
      case AUTHORED_OPERATION.END_DIRECTOR:
        return endDirector(
          tx,
          request.programId!,
          payload.assignmentId,
          payload.validTo,
        );
      default:
        throw new Error(`Operation ${payload.operation} is not organisational`);
    }
  }
}
