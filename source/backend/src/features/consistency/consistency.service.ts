import { Injectable, Logger } from '@nestjs/common';
import { ProgramVersionStatus } from '../../generated/prisma/client.js';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import {
  assertCopyWritable,
  canEditCopy,
} from '../../shared/change-requests/request-draft.js';
import {
  ConsistencyChecker,
  type CheckedVersion,
} from '../../shared/curriculum/consistency-checker.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { programTarget } from '../../shared/programs/program-target.js';
import type { AcceptCreditMismatchDto } from './accept-credit-mismatch.dto.js';
import {
  toConsistencyReportDto,
  type ConsistencyReportDto,
} from './consistency.dto.js';
import { CONSISTENCY_FEATURE_ERRORS } from './consistency.errors.js';

function canAccept(version: CheckedVersion, access: AccessContext): boolean {
  const target = programTarget(version.program);
  if (version.status !== ProgramVersionStatus.DRAFT) {
    return false;
  }
  // A request's working copy: only its creator, while the request is a Draft (F-13).
  return version.sourceRequest
    ? canEditCopy(
        access,
        PERMISSIONS.PROGRAM_EDIT_INFO,
        target,
        version.sourceRequest,
      )
    : access.modeFor(PERMISSIONS.PROGRAM_EDIT_INFO, target) !== null;
}

@Injectable()
export class ConsistencyService {
  private readonly logger = new Logger(ConsistencyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly checker: ConsistencyChecker,
  ) {}

  async report(
    versionId: string,
    access: AccessContext,
  ): Promise<ConsistencyReportDto> {
    const result = await this.checker.check(versionId);
    access.assertCan(
      PERMISSIONS.PROGRAM_VIEW,
      programTarget(result.version.program),
    );
    return toConsistencyReportDto(
      result,
      new Date(),
      canAccept(result.version, access),
    );
  }

  async acceptMismatch(
    versionId: string,
    dto: AcceptCreditMismatchDto,
    access: AccessContext,
  ): Promise<ConsistencyReportDto> {
    const { version, credits } = await this.checker.check(versionId);
    const target = programTarget(version.program);
    access.assertCan(PERMISSIONS.PROGRAM_EDIT_INFO, target);
    if (version.status !== ProgramVersionStatus.DRAFT) {
      throw new AppException(CONSISTENCY_FEATURE_ERRORS.VERSION_NOT_EDITABLE);
    }
    if (version.sourceRequest) {
      assertCopyWritable(
        access,
        PERMISSIONS.PROGRAM_EDIT_INFO,
        target,
        version.sourceRequest,
      );
    }
    if (!credits.mismatch) {
      throw new AppException(CONSISTENCY_FEATURE_ERRORS.NO_CREDIT_MISMATCH);
    }
    if (
      !credits.gap.compulsory.equals(dto.compulsoryGap) ||
      !credits.gap.elective.equals(dto.electiveGap)
    ) {
      throw new AppException(CONSISTENCY_FEATURE_ERRORS.CREDIT_GAP_CHANGED);
    }
    // Not one transaction with the check, on purpose: the stored gaps are a fingerprint, so an edit landing in between voids the acceptance.
    const { count } = await this.prisma.programVersion.updateMany({
      where: { id: versionId, status: ProgramVersionStatus.DRAFT },
      data: {
        creditMismatchReason: dto.reason,
        creditMismatchCompulsoryGap: credits.gap.compulsory,
        creditMismatchElectiveGap: credits.gap.elective,
        creditMismatchAcceptedById: access.userId,
        creditMismatchAcceptedAt: new Date(),
      },
    });
    if (count === 0) {
      throw new AppException(CONSISTENCY_FEATURE_ERRORS.VERSION_NOT_EDITABLE);
    }
    this.logger.log(
      `Credit mismatch accepted on version ${versionId} by ${access.userId}`,
    );
    return this.report(versionId, access);
  }
}
