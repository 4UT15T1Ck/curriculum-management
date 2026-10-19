import { Injectable, Logger } from '@nestjs/common';
import {
  ProgramVersionStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { assertSchoolWideDirect } from '../../shared/authz/edit-path.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { lockRequisiteGraph } from '../../shared/courses/requisite-graph.js';
import { ConsistencyChecker } from '../../shared/curriculum/consistency-checker.js';
import { WARNING_SEVERITY } from '../../shared/curriculum/curriculum-warnings.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import {
  lockPrograms,
  RELEASE_TRANSACTION,
} from '../../shared/releases/release-locks.js';
import { RELEASE_ERRORS } from '../../shared/releases/release.errors.js';
import {
  assertCohortsExist,
  requireSemesterStart,
} from '../../shared/releases/semester-start.js';
import {
  assertNoSyllabusIssues,
  collectSyllabusIssues,
} from '../../shared/releases/syllabus-release-issues.js';
import { VersionPublisher } from '../../shared/releases/version.publisher.js';
import { FIRST_VERSION_NUMBER } from '../../shared/releases/version-number.js';
import { fromIsoDay, todayDate } from '../../shared/time/today.js';
import { ReleaseCheckDto } from './dto/release-check.dto.js';
import { ReleaseVersionDto } from './dto/release-version.dto.js';
import type { VersionDetailDto } from './dto/version-detail.dto.js';
import { VersionHistoryReader } from './version-history.reader.js';

type Db = PrismaService | Prisma.TransactionClient;

// MH-45: the one plain Draft a program has never released becomes its first version, whole or not at all.
@Injectable()
export class ReleasesService {
  private readonly logger = new Logger(ReleasesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly consistency: ConsistencyChecker,
    private readonly publisher: VersionPublisher,
    private readonly history: VersionHistoryReader,
  ) {}

  async check(
    programId: string,
    versionId: string,
    access: AccessContext,
  ): Promise<ReleaseCheckDto> {
    assertSchoolWideDirect(access, PERMISSIONS.VERSION_PUBLISH);
    await plainFirstDraft(this.prisma, programId, versionId);
    const { issues } = await this.consistency.check(versionId);
    const syllabusIssues = await collectSyllabusIssues(this.prisma, versionId);
    const blocked =
      issues.some((issue) => issue.severity === WARNING_SEVERITY.ERROR) ||
      syllabusIssues.length > 0;
    return {
      versionId,
      canRelease: !blocked,
      consistencyIssues: issues,
      syllabusIssues,
    };
  }

  async release(
    programId: string,
    versionId: string,
    dto: ReleaseVersionDto,
    access: AccessContext,
  ): Promise<VersionDetailDto> {
    assertSchoolWideDirect(access, PERMISSIONS.VERSION_PUBLISH);
    const released = await this.prisma.$transaction(async (tx) => {
      await lockPrograms(tx, [programId]);
      await plainFirstDraft(tx, programId, versionId);
      const semester = await requireSemesterStart(tx, dto.effectiveSemesterId);
      await assertCohortsExist(tx, dto.cohortIds);
      await lockRequisiteGraph(tx);
      await this.consistency.assertPasses(versionId, tx);
      await assertNoSyllabusIssues(tx, versionId);
      return this.publisher.promote(tx, {
        versionId,
        programId,
        versionNumber: dto.versionNumber ?? FIRST_VERSION_NUMBER,
        decisionNumber: dto.decisionNumber,
        signedDate: fromIsoDay(dto.signedDate),
        effectiveSemesterId: semester.id,
        effectiveStart: semester.startDate,
        publisherId: access.userId,
        now: new Date(),
        today: todayDate(),
        cohortIds: dto.cohortIds,
      });
    }, RELEASE_TRANSACTION);
    this.logger.log(
      `Program ${programId} released as ${released.versionNumber} (${released.status}) by ${access.userId}`,
    );
    return this.history.detail(programId, released.id, access);
  }
}

// The program's one never-released plain Draft. A program with any issued version answers ALREADY_RELEASED,
// whether or not another plain Draft is still lying around (PB-03).
async function plainFirstDraft(
  db: Db,
  programId: string,
  versionId: string,
): Promise<void> {
  const program = await db.program.findUnique({
    where: { id: programId },
    select: { id: true },
  });
  if (!program) throw new AppException(RELEASE_ERRORS.PROGRAM_NOT_FOUND);
  const issued = await db.programVersion.count({
    where: {
      programId,
      sourceRequestId: null,
      status: { not: ProgramVersionStatus.DRAFT },
    },
  });
  if (issued > 0) throw new AppException(RELEASE_ERRORS.ALREADY_RELEASED);
  const draft = await db.programVersion.findFirst({
    where: {
      id: versionId,
      programId,
      status: ProgramVersionStatus.DRAFT,
      sourceRequestId: null,
      correctionOfId: null,
    },
    select: { id: true },
  });
  if (!draft) throw new AppException(RELEASE_ERRORS.VERSION_NOT_FOUND);
}
