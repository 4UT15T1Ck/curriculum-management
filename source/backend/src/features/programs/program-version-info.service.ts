import { Injectable, Logger } from '@nestjs/common';
import { ProgramVersionStatus } from '../../generated/prisma/client.js';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { EDIT_PATH, editPathFor } from '../../shared/authz/edit-path.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { canEditCopy } from '../../shared/change-requests/request-draft.js';
import {
  assertVersionWritePath,
  canEditCorrection,
  isCorrectionDraft,
} from '../../shared/releases/correction-access.js';
import { CurriculumFactsReader } from '../../shared/curriculum/curriculum-facts.reader.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import {
  programEditState,
  programTarget,
} from '../../shared/programs/program-target.js';
import { assertCreditsAddUp } from './credits-check.js';
import { PROGRAM_ERRORS } from './programs.errors.js';
import { assertSemestersCoverCurriculum } from './semester-check.js';
import {
  toVersionInfoEditDto,
  VERSION_INFO_ROW_SELECT,
  type UpdateVersionInfoDto,
  type VersionInfoEditDto,
  type VersionInfoRowWithProgram,
} from './version-info.dto.js';
import { versionData } from './version-data.js';

// The info fields of one version by its id: the only route that writes a request's working copy (F-13).
// ProgramsService.update stays the route for the program's own Draft.
@Injectable()
export class ProgramVersionInfoService {
  private readonly logger = new Logger(ProgramVersionInfoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly curriculumFacts: CurriculumFactsReader,
  ) {}

  async read(
    versionId: string,
    access: AccessContext,
  ): Promise<VersionInfoEditDto> {
    const row = await this.findOrThrow(versionId);
    access.assertCan(PERMISSIONS.PROGRAM_VIEW, programTarget(row.program));
    return toVersionInfoEditDto(row, await this.canEdit(row, access));
  }

  async update(
    versionId: string,
    dto: UpdateVersionInfoDto,
    access: AccessContext,
  ): Promise<VersionInfoEditDto> {
    const row = await this.findOrThrow(versionId);
    if (row.status !== ProgramVersionStatus.DRAFT) {
      throw new AppException(PROGRAM_ERRORS.VERSION_NOT_EDITABLE);
    }
    await assertVersionWritePath(
      access,
      PERMISSIONS.PROGRAM_EDIT_INFO,
      programTarget(row.program),
      row,
      () => programEditState(this.prisma, row.programId),
    );
    await assertSemestersCoverCurriculum(
      this.curriculumFacts,
      row.id,
      dto.semesterCount,
    );
    assertCreditsAddUp({
      totalCredits: dto.totalCredits ?? row.totalCredits.toString(),
      compulsoryCredits:
        dto.compulsoryCredits ?? row.compulsoryCredits.toString(),
      electiveCredits: dto.electiveCredits ?? row.electiveCredits.toString(),
    });
    // Conditional on Draft: a submit racing this edit wins, and the next read shows the frozen state.
    await this.prisma.programVersion.updateMany({
      where: { id: row.id, status: ProgramVersionStatus.DRAFT },
      data: versionData(dto),
    });
    this.logger.log(`Version ${row.id} info updated by ${access.userId}`);
    return toVersionInfoEditDto(await this.findOrThrow(versionId), true);
  }

  private async canEdit(
    row: VersionInfoRowWithProgram,
    access: AccessContext,
  ): Promise<boolean> {
    if (row.status !== ProgramVersionStatus.DRAFT) {
      return false;
    }
    const target = programTarget(row.program);
    if (isCorrectionDraft(row)) return canEditCorrection(access);
    if (row.sourceRequest) {
      return canEditCopy(
        access,
        PERMISSIONS.PROGRAM_EDIT_INFO,
        target,
        row.sourceRequest,
      );
    }
    return (
      editPathFor(
        access,
        PERMISSIONS.PROGRAM_EDIT_INFO,
        target,
        await programEditState(this.prisma, row.programId),
      ) === EDIT_PATH.DIRECT
    );
  }

  private async findOrThrow(
    versionId: string,
  ): Promise<VersionInfoRowWithProgram> {
    const row = await this.prisma.programVersion.findUnique({
      where: { id: versionId },
      select: VERSION_INFO_ROW_SELECT,
    });
    if (!row) {
      throw new AppException(PROGRAM_ERRORS.VERSION_NOT_FOUND);
    }
    return row;
  }
}
