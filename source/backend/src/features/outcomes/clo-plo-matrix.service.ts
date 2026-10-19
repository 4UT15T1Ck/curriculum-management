import { Injectable } from '@nestjs/common';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { groupBy } from '../../shared/collections/group-by.js';
import { itemTarget } from '../../shared/curriculum/item-target.js';
import { toWireDecimal } from '../../shared/decimal/decimal.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { isForeignKeyViolation } from '../../shared/prisma/unique-violation.js';
import {
  programEditState,
  programTarget,
} from '../../shared/programs/program-target.js';
import { currentRevisionByCourse } from '../../shared/syllabi/current-revision.js';
import {
  CLO_REF_SELECT,
  type CloPloLinkDto,
  type CloRefDto,
  type ItemCloPloMatrixDto,
  type ProgramCloPloMatrixDto,
  type ReplaceCloPloLinksDto,
} from './clo-plo-matrix.dto.js';
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

const CLO_ORDER = [{ sortOrder: 'asc' }, { id: 'asc' }] as const;

// MH-33 (one course) and MH-32 (the whole program): the CLO-to-PLO links of a curriculum row (US-044, US-045).
// The CLOs are those of the course's current revision; the links are the program's own (DEC-03).
@Injectable()
export class CloPloMatrixService {
  constructor(private readonly prisma: PrismaService) {}

  async forItem(
    itemId: string,
    access: AccessContext,
  ): Promise<ItemCloPloMatrixDto> {
    const item = await this.findItem(itemId);
    access.assertCan(
      PERMISSIONS.OUTCOME_VIEW,
      programTarget(item.version.program),
    );
    assertMatrixReader(access);
    const revision =
      (await currentRevisionByCourse(this.prisma, [item.course.id])).get(
        item.course.id,
      ) ?? null;
    const [clos, plos, cells, links, state] = await Promise.all([
      revision
        ? this.prisma.cLO.findMany({
            where: { syllabusId: revision.id },
            select: CLO_REF_SELECT,
            orderBy: [...CLO_ORDER],
          })
        : Promise.resolve([] as CloRefDto[]),
      this.prisma.pLO.findMany({
        where: { versionId: item.versionId },
        select: PLO_HEADER_SELECT,
        orderBy: [...PLO_ORDER],
      }),
      this.prisma.coursePLOMapping.findMany({
        where: { curriculumItemId: itemId },
        select: { ploId: true, weight: true },
      }),
      this.prisma.cLOPLOMapping.findMany({
        where: { curriculumItemId: itemId },
        select: { cloId: true, ploId: true },
      }),
      programEditState(this.prisma, item.version.programId),
    ]);
    const weightByPlo = new Map(
      cells.map((cell) => [cell.ploId, toWireDecimal(cell.weight)]),
    );
    const { editPath, canEdit } = outcomeEditAccess(
      access,
      item.version,
      PERMISSIONS.CLO_EDIT,
      itemTarget(item.version, item.course),
      state,
    );
    return {
      version: toOutcomeVersionDto(item.version),
      item: {
        id: item.id,
        plannedSemester: item.plannedSemester,
        course: {
          id: item.course.id,
          courseCode: item.course.courseCode,
          courseName: item.course.courseName,
        },
      },
      revision,
      clos,
      plos: plos.map((plo) => ({
        ...plo,
        weight: weightByPlo.get(plo.id) ?? null,
      })),
      links,
      editPath,
      canEdit: canEdit && revision !== null,
    };
  }

  // The whole set of the row is replaced in one transaction (D4); an empty set clears it.
  async replaceLinks(
    itemId: string,
    dto: ReplaceCloPloLinksDto,
    access: AccessContext,
  ): Promise<ItemCloPloMatrixDto> {
    const item = await this.findItem(itemId);
    await assertOutcomeWrite(
      this.prisma,
      access,
      item.version,
      PERMISSIONS.CLO_EDIT,
      itemTarget(item.version, item.course),
    );
    const links = uniqueLinks(dto.links);
    const revision = (
      await currentRevisionByCourse(this.prisma, [item.course.id])
    ).get(item.course.id);
    const [clos, cells] = await Promise.all([
      revision
        ? this.prisma.cLO.findMany({
            where: { syllabusId: revision.id },
            select: { id: true },
          })
        : Promise.resolve([] as { id: string }[]),
      this.prisma.coursePLOMapping.findMany({
        where: { curriculumItemId: itemId },
        select: { ploId: true },
      }),
    ]);
    const cloIds = new Set(clos.map((clo) => clo.id));
    const mappedPlos = new Set(cells.map((cell) => cell.ploId));
    if (links.some((link) => !cloIds.has(link.cloId))) {
      throw new AppException(OUTCOME_ERRORS.CLO_NOT_IN_REVISION);
    }
    if (links.some((link) => !mappedPlos.has(link.ploId))) {
      throw new AppException(OUTCOME_ERRORS.PLO_NOT_MAPPED_TO_COURSE);
    }
    try {
      await this.prisma.$transaction([
        this.prisma.cLOPLOMapping.deleteMany({
          where: { curriculumItemId: itemId },
        }),
        this.prisma.cLOPLOMapping.createMany({
          data: links.map(({ cloId, ploId }) => ({
            curriculumItemId: itemId,
            cloId,
            ploId,
          })),
        }),
      ]);
    } catch (error) {
      // A course cell cleared between the check and the write.
      if (isForeignKeyViolation(error)) {
        throw new AppException(OUTCOME_ERRORS.PLO_NOT_MAPPED_TO_COURSE);
      }
      throw error;
    }
    return this.forItem(itemId, access);
  }

  async forVersion(
    versionId: string,
    access: AccessContext,
  ): Promise<ProgramCloPloMatrixDto> {
    const version = await this.prisma.programVersion.findUnique({
      where: { id: versionId },
      select: OUTCOME_VERSION_SELECT,
    });
    assertVersionFound(version);
    access.assertCan(PERMISSIONS.OUTCOME_VIEW, programTarget(version.program));
    assertMatrixReader(access);
    const [plos, items, cells, links] = await Promise.all([
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
            select: { id: true, courseCode: true, courseName: true },
          },
        },
        orderBy: [...OUTCOME_ITEM_ORDER],
      }),
      this.prisma.coursePLOMapping.findMany({
        where: { curriculumItem: { versionId } },
        select: { curriculumItemId: true, ploId: true },
      }),
      this.prisma.cLOPLOMapping.findMany({
        where: { coursePlo: { curriculumItem: { versionId } } },
        select: { curriculumItemId: true, cloId: true, ploId: true },
      }),
    ]);
    const revisions = await currentRevisionByCourse(
      this.prisma,
      items.map((item) => item.course.id),
    );
    const closByRevision = await this.closOf(
      [...revisions.values()].map((revision) => revision.id),
    );
    const cellsByItem = groupBy(cells, (cell) => cell.curriculumItemId);
    const linksByItem = groupBy(links, (link) => link.curriculumItemId);
    return {
      version: toOutcomeVersionDto(version),
      plos,
      rows: items.map((item) => {
        const revision = revisions.get(item.course.id);
        return {
          itemId: item.id,
          plannedSemester: item.plannedSemester,
          course: item.course,
          revisionNumber: revision?.revisionNumber ?? null,
          clos: revision ? (closByRevision.get(revision.id) ?? []) : [],
          mappedPloIds: (cellsByItem.get(item.id) ?? []).map(
            (cell) => cell.ploId,
          ),
          links: (linksByItem.get(item.id) ?? []).map(({ cloId, ploId }) => ({
            cloId,
            ploId,
          })),
        };
      }),
    };
  }

  private async closOf(
    syllabusIds: string[],
  ): Promise<Map<string, CloRefDto[]>> {
    if (syllabusIds.length === 0) {
      return new Map();
    }
    const clos = await this.prisma.cLO.findMany({
      where: { syllabusId: { in: syllabusIds } },
      select: { ...CLO_REF_SELECT, syllabusId: true },
      orderBy: [...CLO_ORDER],
    });
    return groupBy(
      clos.map(({ syllabusId, ...clo }) => ({ syllabusId, clo })),
      (row) => row.syllabusId,
      (row) => row.clo,
    );
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

function uniqueLinks(links: readonly CloPloLinkDto[]): CloPloLinkDto[] {
  const seen = new Map(
    links.map((link) => [
      `${link.cloId}:${link.ploId}`,
      { cloId: link.cloId, ploId: link.ploId },
    ]),
  );
  return [...seen.values()];
}
