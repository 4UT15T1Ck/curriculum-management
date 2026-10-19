import { Injectable, Logger } from '@nestjs/common';
import {
  CourseRelationType,
  CourseStatus,
  type Prisma,
} from '../../generated/prisma/client.js';
import type { AccessContext } from '../../shared/authz/access-context.js';
import {
  CYCLE_CHECKED_TYPES,
  findRequisiteCycle,
  lockRequisiteGraph,
  RELATION_CONSTRAINT,
  type RequisiteEdge,
} from '../../shared/courses/requisite-graph.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { assertCurriculumWrite, itemTarget } from './curriculum-access.js';
import { CurriculumReadService } from './curriculum-read.service.js';
import type { CurriculumItemDto } from './curriculum.dto.js';
import { CURRICULUM_ERRORS } from './curriculum.errors.js';
import {
  CURRICULUM_REQUISITE_TYPES,
  ReplaceRequisitesDto,
  type RequisiteInputDto,
} from './replace-requisites.dto.js';

@Injectable()
export class CurriculumRequisitesService {
  private readonly logger = new Logger(CurriculumRequisitesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reader: CurriculumReadService,
  ) {}

  // The catalog is the starting point; the edges are copied, not linked, so later catalog edits do not reach this curriculum.
  // No cycle check (D8): the copied edges are catalog edges, already acyclic with the catalog.
  async seedFromCatalog(
    tx: Prisma.TransactionClient,
    itemId: string,
    courseId: string,
  ): Promise<void> {
    const relations = await tx.courseRelation.findMany({
      where: {
        targetCourseId: courseId,
        relationType: { in: [...CURRICULUM_REQUISITE_TYPES] },
        sourceCourse: { status: { not: CourseStatus.CANCELLED } },
      },
      select: { sourceCourseId: true, relationType: true, minScore: true },
    });
    if (relations.length === 0) {
      return;
    }
    await tx.curriculumRequisite.createMany({
      data: relations.map((relation) => ({ itemId, ...relation })),
    });
  }

  async replace(
    itemId: string,
    dto: ReplaceRequisitesDto,
    access: AccessContext,
  ): Promise<CurriculumItemDto> {
    const item = await this.reader.findItem(itemId);
    await assertCurriculumWrite(
      this.prisma,
      access,
      item.version,
      itemTarget(item.version, item.course),
    );
    assertRequisiteInput(item.courseId, dto.requisites);
    await this.assertSourcesUsable(dto.requisites);
    await this.prisma.$transaction(async (tx) => {
      await lockRequisiteGraph(tx);
      await tx.curriculumRequisite.deleteMany({ where: { itemId } });
      await this.assertNoCycle(
        tx,
        item.versionId,
        item.courseId,
        dto.requisites,
      );
      if (dto.requisites.length > 0) {
        await tx.curriculumRequisite.createMany({
          data: dto.requisites.map(
            ({ sourceCourseId, relationType, minScore }) => ({
              itemId,
              sourceCourseId,
              relationType,
              minScore: minScore ?? null,
            }),
          ),
        });
      }
    });
    this.logger.log(
      `Requisites of curriculum item ${itemId} replaced (${dto.requisites.length}) by ${access.userId}`,
    );
    return this.reader.itemDto(itemId, access);
  }

  // The graph is the catalog plus this version's own requisites; the item's old edges are already deleted in the transaction.
  private async assertNoCycle(
    tx: Prisma.TransactionClient,
    versionId: string,
    courseId: string,
    requisites: readonly RequisiteInputDto[],
  ): Promise<void> {
    const [catalog, curriculum] = await Promise.all([
      tx.courseRelation.findMany({
        where: { relationType: { in: [...CYCLE_CHECKED_TYPES] } },
        select: { sourceCourseId: true, targetCourseId: true },
      }),
      tx.curriculumRequisite.findMany({
        where: {
          item: { versionId },
          relationType: { in: [...CYCLE_CHECKED_TYPES] },
        },
        select: { sourceCourseId: true, item: { select: { courseId: true } } },
      }),
    ]);
    const edges: RequisiteEdge[] = [
      ...catalog,
      ...curriculum.map((edge) => ({
        sourceCourseId: edge.sourceCourseId,
        targetCourseId: edge.item.courseId,
      })),
    ];
    for (const requisite of requisites.filter((entry) =>
      CYCLE_CHECKED_TYPES.includes(entry.relationType),
    )) {
      const newEdge = {
        sourceCourseId: requisite.sourceCourseId,
        targetCourseId: courseId,
      };
      const cycle = findRequisiteCycle(edges, newEdge);
      if (cycle) {
        await throwCycle(tx, cycle);
      }
      edges.push(newEdge);
    }
  }

  private async assertSourcesUsable(
    requisites: readonly RequisiteInputDto[],
  ): Promise<void> {
    const ids = [...new Set(requisites.map((entry) => entry.sourceCourseId))];
    const courses = await this.prisma.course.findMany({
      where: { id: { in: ids } },
      select: { id: true, status: true },
    });
    if (courses.length !== ids.length) {
      throw new AppException(CURRICULUM_ERRORS.COURSE_NOT_FOUND, [
        { field: 'requisites', constraints: [] },
      ]);
    }
    if (courses.some((course) => course.status === CourseStatus.CANCELLED)) {
      throw new AppException(CURRICULUM_ERRORS.REQUISITE_COURSE_CANCELLED);
    }
  }
}

function assertRequisiteInput(
  courseId: string,
  requisites: readonly RequisiteInputDto[],
): void {
  const keys = new Set<string>();
  for (const requisite of requisites) {
    if (requisite.sourceCourseId === courseId) {
      throw new AppException(CURRICULUM_ERRORS.REQUISITE_SELF);
    }
    if (
      requisite.minScore &&
      requisite.relationType !== CourseRelationType.PREREQUISITE
    ) {
      throw new AppException(CURRICULUM_ERRORS.MIN_SCORE_NOT_ALLOWED, [
        { field: 'minScore', constraints: [RELATION_CONSTRAINT.GRADE_POINT] },
      ]);
    }
    const key = `${requisite.sourceCourseId}:${requisite.relationType}`;
    if (keys.has(key)) {
      throw new AppException(CURRICULUM_ERRORS.REQUISITE_DUPLICATE);
    }
    keys.add(key);
  }
}

async function throwCycle(
  tx: Prisma.TransactionClient,
  cycle: readonly string[],
): Promise<never> {
  const courses = await tx.course.findMany({
    where: { id: { in: [...cycle] } },
    select: { id: true, courseCode: true },
  });
  const codeOf = new Map(
    courses.map((course) => [course.id, course.courseCode]),
  );
  const base = CURRICULUM_ERRORS.REQUISITE_CYCLE;
  throw new AppException({
    ...base,
    message: `${base.message}: ${cycle.map((id) => codeOf.get(id)).join(' → ')}.`,
  });
}
