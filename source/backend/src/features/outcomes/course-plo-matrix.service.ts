import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { groupBy } from '../../shared/collections/group-by.js';
import { toWireDecimal } from '../../shared/decimal/decimal.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import {
  programEditState,
  programTarget,
} from '../../shared/programs/program-target.js';
import {
  assertMatrixReader,
  assertOutcomeWrite,
  assertVersionFound,
  ITEM_WITH_VERSION_SELECT,
  outcomeEditAccess,
  OUTCOME_VERSION_SELECT,
} from './outcome-access.js';
import { OUTCOME_ERRORS } from './outcome.errors.js';
import {
  OUTCOME_ITEM_ORDER,
  PLO_HEADER_SELECT,
  PLO_ORDER,
  toOutcomeVersionDto,
} from './outcome-version.dto.js';
import {
  toCellDto,
  type CoursePloCellDto,
  type CoursePloMatrixDto,
  type SetPloWeightDto,
} from './course-plo-matrix.dto.js';

const cellKey = (row: { curriculumItemId: string; ploId: string }) =>
  `${row.curriculumItemId}:${row.ploId}`;

// MH-34: the program's statement of which courses contribute to which PLO, and how much.
@Injectable()
export class CoursePloMatrixService {
  constructor(private readonly prisma: PrismaService) {}

  async read(
    versionId: string,
    access: AccessContext,
  ): Promise<CoursePloMatrixDto> {
    const version = await this.prisma.programVersion.findUnique({
      where: { id: versionId },
      select: OUTCOME_VERSION_SELECT,
    });
    assertVersionFound(version);
    const target = programTarget(version.program);
    access.assertCan(PERMISSIONS.OUTCOME_VIEW, target);
    assertMatrixReader(access);
    const [plos, items, cells, links, state] = await Promise.all([
      this.prisma.pLO.findMany({
        where: { versionId },
        select: PLO_HEADER_SELECT,
        orderBy: [...PLO_ORDER],
      }),
      this.prisma.curriculumItem.findMany({
        where: { versionId },
        select: {
          id: true,
          plannedSemester: true,
          course: {
            select: {
              id: true,
              courseCode: true,
              courseName: true,
              credits: true,
            },
          },
        },
        orderBy: [...OUTCOME_ITEM_ORDER],
      }),
      this.prisma.coursePLOMapping.findMany({
        where: { curriculumItem: { versionId } },
        select: { curriculumItemId: true, ploId: true, weight: true },
      }),
      this.prisma.cLOPLOMapping.groupBy({
        by: ['curriculumItemId', 'ploId'],
        where: { coursePlo: { curriculumItem: { versionId } } },
        _count: { _all: true },
      }),
      programEditState(this.prisma, version.programId),
    ]);
    const linkCount = new Map(
      links.map((row) => [cellKey(row), row._count._all]),
    );
    const cellsByItem = groupBy(cells, (cell) => cell.curriculumItemId);
    return {
      version: toOutcomeVersionDto(version),
      plos,
      rows: items.map((item) => ({
        itemId: item.id,
        plannedSemester: item.plannedSemester,
        course: { ...item.course, credits: toWireDecimal(item.course.credits) },
        cells: (cellsByItem.get(item.id) ?? []).map((cell) =>
          toCellDto(cell, linkCount.get(cellKey(cell)) ?? 0),
        ),
      })),
      ...outcomeEditAccess(
        access,
        version,
        PERMISSIONS.PLO_EDIT,
        target,
        state,
      ),
    };
  }

  async setWeight(
    itemId: string,
    ploId: string,
    dto: SetPloWeightDto,
    access: AccessContext,
  ): Promise<CoursePloCellDto> {
    const item = await this.findItem(itemId);
    const plo = await this.prisma.pLO.findUnique({
      where: { id: ploId },
      select: { versionId: true },
    });
    if (!plo) {
      throw new AppException(OUTCOME_ERRORS.PLO_NOT_FOUND);
    }
    if (plo.versionId !== item.versionId) {
      throw new AppException(OUTCOME_ERRORS.PLO_NOT_IN_VERSION);
    }
    await assertOutcomeWrite(
      this.prisma,
      access,
      item.version,
      PERMISSIONS.PLO_EDIT,
      programTarget(item.version.program),
    );
    const weight = new Prisma.Decimal(dto.weight);
    const cell = await this.prisma.coursePLOMapping.upsert({
      where: { curriculumItemId_ploId: { curriculumItemId: itemId, ploId } },
      create: { curriculumItemId: itemId, ploId, weight },
      update: { weight },
      select: {
        ploId: true,
        weight: true,
        _count: { select: { cloLinks: true } },
      },
    });
    return toCellDto(cell, cell._count.cloLinks);
  }

  // The database cascades the cell's CLO links (US-046 AC3).
  async removeWeight(
    itemId: string,
    ploId: string,
    access: AccessContext,
  ): Promise<void> {
    const item = await this.findItem(itemId);
    await assertOutcomeWrite(
      this.prisma,
      access,
      item.version,
      PERMISSIONS.PLO_EDIT,
      programTarget(item.version.program),
    );
    const { count } = await this.prisma.coursePLOMapping.deleteMany({
      where: { curriculumItemId: itemId, ploId },
    });
    if (count === 0) {
      throw new AppException(OUTCOME_ERRORS.CELL_NOT_FOUND);
    }
  }

  private async findItem(itemId: string) {
    const item = await this.prisma.curriculumItem.findUnique({
      where: { id: itemId },
      select: ITEM_WITH_VERSION_SELECT,
    });
    if (!item) {
      throw new AppException(OUTCOME_ERRORS.ITEM_NOT_FOUND);
    }
    return item;
  }
}
