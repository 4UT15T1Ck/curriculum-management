import { Injectable } from '@nestjs/common';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { mapUniqueViolation } from '../../shared/prisma/unique-violation.js';
import {
  programEditState,
  programTarget,
} from '../../shared/programs/program-target.js';
import {
  assertOutcomeWrite,
  assertVersionFound,
  outcomeEditAccess,
  OUTCOME_VERSION_SELECT,
  type OutcomeVersionRow,
} from './outcome-access.js';
import { OUTCOME_ERRORS, OUTCOME_LIMITS } from './outcome.errors.js';
import { PLO_ORDER, toOutcomeVersionDto } from './outcome-version.dto.js';
import {
  NO_USAGE,
  PLO_FIELD,
  toPloDto,
  type CreatePloDto,
  type PloDto,
  type PloListDto,
  type ReorderOutcomeRowsDto,
  type UpdatePloDto,
} from './plo.dto.js';

// The PLOs of a program version (US-042) and the list screen that carries their usage counts.
@Injectable()
export class PlosService {
  constructor(private readonly prisma: PrismaService) {}

  async list(versionId: string, access: AccessContext): Promise<PloListDto> {
    const version = await this.findVersion(versionId);
    const target = programTarget(version.program);
    access.assertCan(PERMISSIONS.OUTCOME_VIEW, target);
    const state = await programEditState(this.prisma, version.programId);
    return {
      version: toOutcomeVersionDto(version),
      plos: await this.plosOf(versionId),
      ...outcomeEditAccess(
        access,
        version,
        PERMISSIONS.PLO_EDIT,
        target,
        state,
      ),
    };
  }

  async create(
    versionId: string,
    dto: CreatePloDto,
    access: AccessContext,
  ): Promise<PloDto> {
    const version = await this.findVersion(versionId);
    await assertOutcomeWrite(
      this.prisma,
      access,
      version,
      PERMISSIONS.PLO_EDIT,
      programTarget(version.program),
    );
    return this.prisma.$transaction(async (tx) => {
      const count = await tx.pLO.count({ where: { versionId } });
      if (count >= OUTCOME_LIMITS.PLOS_MAX) {
        throw new AppException(OUTCOME_ERRORS.PLOS_LIMIT);
      }
      try {
        const created = await tx.pLO.create({
          data: {
            versionId,
            ploCode: dto.ploCode,
            description: dto.description,
            sortOrder: count + 1,
            englishDescription: dto.englishDescription ?? null,
            competencyGroup: dto.competencyGroup ?? null,
          },
        });
        return toPloDto(created, NO_USAGE);
      } catch (error) {
        throw mapUniqueViolation(
          error,
          OUTCOME_ERRORS.PLO_CODE_TAKEN,
          PLO_FIELD.CODE,
        );
      }
    });
  }

  async update(
    ploId: string,
    dto: UpdatePloDto,
    access: AccessContext,
  ): Promise<PloDto> {
    const plo = await this.findPlo(ploId);
    await assertOutcomeWrite(
      this.prisma,
      access,
      plo.version,
      PERMISSIONS.PLO_EDIT,
      programTarget(plo.version.program),
    );
    try {
      const updated = await this.prisma.pLO.update({
        where: { id: ploId },
        data: {
          ...(dto.ploCode !== undefined && { ploCode: dto.ploCode }),
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.englishDescription !== undefined && {
            englishDescription: dto.englishDescription,
          }),
          ...(dto.competencyGroup !== undefined && {
            competencyGroup: dto.competencyGroup,
          }),
        },
      });
      return toPloDto(updated, await this.usageOf(ploId));
    } catch (error) {
      throw mapUniqueViolation(
        error,
        OUTCOME_ERRORS.PLO_CODE_TAKEN,
        PLO_FIELD.CODE,
      );
    }
  }

  // The database cascades the PLO's course cells and, through them, their CLO links; the rest are renumbered 1..n.
  async remove(ploId: string, access: AccessContext): Promise<void> {
    const plo = await this.findPlo(ploId);
    await assertOutcomeWrite(
      this.prisma,
      access,
      plo.version,
      PERMISSIONS.PLO_EDIT,
      programTarget(plo.version.program),
    );
    await this.prisma.$transaction(async (tx) => {
      await tx.pLO.delete({ where: { id: ploId } });
      const rest = await tx.pLO.findMany({
        where: { versionId: plo.versionId },
        orderBy: [...PLO_ORDER],
        select: { id: true },
      });
      for (const [index, { id }] of rest.entries()) {
        await tx.pLO.update({ where: { id }, data: { sortOrder: index + 1 } });
      }
    });
  }

  // The list must be exactly the version's PLOs; a partial list is refused so none loses its place silently.
  async reorder(
    versionId: string,
    dto: ReorderOutcomeRowsDto,
    access: AccessContext,
  ): Promise<PloDto[]> {
    const version = await this.findVersion(versionId);
    await assertOutcomeWrite(
      this.prisma,
      access,
      version,
      PERMISSIONS.PLO_EDIT,
      programTarget(version.program),
    );
    await this.prisma.$transaction(async (tx) => {
      const rows = await tx.pLO.findMany({
        where: { versionId },
        select: { id: true },
      });
      const current = new Set(rows.map((row) => row.id));
      if (
        rows.length !== dto.ids.length ||
        dto.ids.some((id) => !current.has(id))
      ) {
        throw new AppException(OUTCOME_ERRORS.ORDER_MISMATCH);
      }
      for (const [index, id] of dto.ids.entries()) {
        await tx.pLO.update({
          where: { id },
          data: { sortOrder: index + 1 },
        });
      }
    });
    return this.plosOf(versionId);
  }

  private async plosOf(versionId: string): Promise<PloDto[]> {
    const plos = await this.prisma.pLO.findMany({
      where: { versionId },
      include: { _count: { select: { courseMappings: true } } },
      orderBy: [...PLO_ORDER],
    });
    const links = await this.prisma.cLOPLOMapping.groupBy({
      by: ['ploId'],
      where: { ploId: { in: plos.map((plo) => plo.id) } },
      _count: { _all: true },
    });
    const linkCount = new Map(links.map((row) => [row.ploId, row._count._all]));
    return plos.map((plo) =>
      toPloDto(plo, {
        courseCount: plo._count.courseMappings,
        cloLinkCount: linkCount.get(plo.id) ?? 0,
      }),
    );
  }

  private async usageOf(ploId: string) {
    const [courseCount, cloLinkCount] = await Promise.all([
      this.prisma.coursePLOMapping.count({ where: { ploId } }),
      this.prisma.cLOPLOMapping.count({ where: { ploId } }),
    ]);
    return { courseCount, cloLinkCount };
  }

  private async findVersion(versionId: string): Promise<OutcomeVersionRow> {
    const version = await this.prisma.programVersion.findUnique({
      where: { id: versionId },
      select: OUTCOME_VERSION_SELECT,
    });
    assertVersionFound(version);
    return version;
  }

  private async findPlo(ploId: string) {
    const plo = await this.prisma.pLO.findUnique({
      where: { id: ploId },
      select: {
        id: true,
        versionId: true,
        version: { select: OUTCOME_VERSION_SELECT },
      },
    });
    if (!plo) {
      throw new AppException(OUTCOME_ERRORS.PLO_NOT_FOUND);
    }
    return plo;
  }
}
