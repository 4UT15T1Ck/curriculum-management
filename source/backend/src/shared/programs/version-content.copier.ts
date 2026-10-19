import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';

// Copies everything that hangs off a program version into another version, inside the caller's transaction.
// Each feature that adds version-owned tables adds its step here: clone (FR-25) and the Draft of a change request depend on it.
// F-07 added the elective groups, curriculum rows and their requisites; F-11 adds the PLO and matrices after them
// (the old id -> new id map of the rows is what a matrix step needs).
@Injectable()
export class VersionContentCopier {
  async copy(
    tx: Prisma.TransactionClient,
    fromVersionId: string,
    toVersionId: string,
  ): Promise<void> {
    const groupIds = await this.copyElectiveGroups(
      tx,
      fromVersionId,
      toVersionId,
    );
    const itemIds = await this.copyCurriculumItems(
      tx,
      fromVersionId,
      toVersionId,
      groupIds,
    );
    await this.copyRequisites(tx, itemIds);
  }

  // Returns old id -> new id, matched back through the natural key (groupCode) because createMany returns no rows.
  private async copyElectiveGroups(
    tx: Prisma.TransactionClient,
    from: string,
    to: string,
  ): Promise<Map<string, string>> {
    const groups = await tx.electiveGroup.findMany({
      where: { versionId: from },
    });
    if (groups.length === 0) {
      return new Map();
    }
    await tx.electiveGroup.createMany({
      data: groups.map(({ groupCode, groupName, minCredits, minCourses }) => ({
        versionId: to,
        groupCode,
        groupName,
        minCredits,
        minCourses,
      })),
    });
    const created = await tx.electiveGroup.findMany({
      where: { versionId: to },
      select: { id: true, groupCode: true },
    });
    const newIdByCode = new Map(
      created.map((group) => [group.groupCode, group.id]),
    );
    return new Map(
      groups.map((group) => [group.id, newIdByCode.get(group.groupCode)!]),
    );
  }

  // Returns old id -> new id, matched back through the natural key (courseId).
  private async copyCurriculumItems(
    tx: Prisma.TransactionClient,
    from: string,
    to: string,
    groupIds: ReadonlyMap<string, string>,
  ): Promise<Map<string, string>> {
    const items = await tx.curriculumItem.findMany({
      where: { versionId: from },
    });
    if (items.length === 0) {
      return new Map();
    }
    await tx.curriculumItem.createMany({
      data: items.map((item) => ({
        versionId: to,
        plannedSemester: item.plannedSemester,
        sortOrder: item.sortOrder,
        courseId: item.courseId,
        blockSymbol: item.blockSymbol,
        isElective: item.isElective,
        electiveGroupId: item.electiveGroupId
          ? groupIds.get(item.electiveGroupId)!
          : null,
        htDa: item.htDa,
        tqDa: item.tqDa,
        minStudiedScore: item.minStudiedScore,
        minTransferScore: item.minTransferScore,
        note: item.note,
      })),
    });
    const created = await tx.curriculumItem.findMany({
      where: { versionId: to },
      select: { id: true, courseId: true },
    });
    const newIdByCourse = new Map(
      created.map((item) => [item.courseId, item.id]),
    );
    return new Map(
      items.map((item) => [item.id, newIdByCourse.get(item.courseId)!]),
    );
  }

  private async copyRequisites(
    tx: Prisma.TransactionClient,
    itemIds: ReadonlyMap<string, string>,
  ): Promise<void> {
    if (itemIds.size === 0) {
      return;
    }
    const requisites = await tx.curriculumRequisite.findMany({
      where: { itemId: { in: [...itemIds.keys()] } },
    });
    if (requisites.length === 0) {
      return;
    }
    await tx.curriculumRequisite.createMany({
      data: requisites.map(
        ({ itemId, sourceCourseId, relationType, minScore }) => ({
          itemId: itemIds.get(itemId)!,
          sourceCourseId,
          relationType,
          minScore,
        }),
      ),
    });
  }
}
