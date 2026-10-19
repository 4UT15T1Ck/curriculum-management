import { describe, expect, it, vi } from 'vitest';
import { CourseRelationType, Prisma } from '../../generated/prisma/client.js';
import { VersionContentCopier } from './version-content.copier.js';

type Tx = Prisma.TransactionClient;

function txWith(source: {
  groups: object[];
  items: object[];
  requisites: object[];
  newGroups?: object[];
  newItems?: object[];
}) {
  const groupFind = vi
    .fn()
    .mockResolvedValueOnce(source.groups)
    .mockResolvedValueOnce(source.newGroups ?? []);
  const itemFind = vi
    .fn()
    .mockResolvedValueOnce(source.items)
    .mockResolvedValueOnce(source.newItems ?? []);
  const requisiteFind = vi.fn().mockResolvedValue(source.requisites);
  const tx = {
    electiveGroup: { findMany: groupFind, createMany: vi.fn() },
    curriculumItem: { findMany: itemFind, createMany: vi.fn() },
    curriculumRequisite: { findMany: requisiteFind, createMany: vi.fn() },
  };
  return {
    tx,
    copy: () =>
      new VersionContentCopier().copy(tx as unknown as Tx, 'from', 'to'),
  };
}

const dec = (value: string) => new Prisma.Decimal(value);

describe('VersionContentCopier.copy', () => {
  it('copies nothing and issues no createMany for an empty version', async () => {
    const { tx, copy } = txWith({ groups: [], items: [], requisites: [] });

    await copy();

    expect(tx.electiveGroup.createMany).not.toHaveBeenCalled();
    expect(tx.curriculumItem.createMany).not.toHaveBeenCalled();
    expect(tx.curriculumRequisite.createMany).not.toHaveBeenCalled();
    expect(tx.curriculumRequisite.findMany).not.toHaveBeenCalled();
  });

  it('points copied rows at the new group and item ids', async () => {
    const { tx, copy } = txWith({
      groups: [
        {
          id: 'g1',
          groupCode: 'TC1',
          groupName: 'Nhóm 1',
          minCredits: dec('6'),
          minCourses: null,
        },
        {
          id: 'g2',
          groupCode: 'TC2',
          groupName: 'Nhóm 2',
          minCredits: null,
          minCourses: 2,
        },
      ],
      newGroups: [
        { id: 'ng2', groupCode: 'TC2' },
        { id: 'ng1', groupCode: 'TC1' },
      ],
      items: [
        {
          id: 'i1',
          courseId: 'c1',
          plannedSemester: 1,
          sortOrder: 1,
          blockSymbol: 'A',
          isElective: false,
          electiveGroupId: null,
          htDa: true,
          tqDa: false,
          minStudiedScore: dec('2'),
          minTransferScore: null,
          note: 'x',
        },
        {
          id: 'i2',
          courseId: 'c2',
          plannedSemester: 2,
          sortOrder: 1,
          blockSymbol: null,
          isElective: true,
          electiveGroupId: 'g1',
          htDa: false,
          tqDa: false,
          minStudiedScore: null,
          minTransferScore: null,
          note: null,
        },
        {
          id: 'i3',
          courseId: 'c3',
          plannedSemester: 2,
          sortOrder: 2,
          blockSymbol: null,
          isElective: true,
          electiveGroupId: null,
          htDa: false,
          tqDa: false,
          minStudiedScore: null,
          minTransferScore: null,
          note: null,
        },
      ],
      newItems: [
        { id: 'ni3', courseId: 'c3' },
        { id: 'ni1', courseId: 'c1' },
        { id: 'ni2', courseId: 'c2' },
      ],
      requisites: [
        {
          id: 'r1',
          itemId: 'i2',
          sourceCourseId: 'c1',
          relationType: CourseRelationType.PREREQUISITE,
          minScore: dec('2'),
        },
        {
          id: 'r2',
          itemId: 'i3',
          sourceCourseId: 'c1',
          relationType: CourseRelationType.COREQUISITE,
          minScore: null,
        },
      ],
    });

    await copy();

    expect(tx.electiveGroup.createMany).toHaveBeenCalledWith({
      data: [
        {
          versionId: 'to',
          groupCode: 'TC1',
          groupName: 'Nhóm 1',
          minCredits: dec('6'),
          minCourses: null,
        },
        {
          versionId: 'to',
          groupCode: 'TC2',
          groupName: 'Nhóm 2',
          minCredits: null,
          minCourses: 2,
        },
      ],
    });
    const items = tx.curriculumItem.createMany.mock.calls[0][0].data;
    expect(items).toHaveLength(3);
    expect(
      items.every((row: { versionId: string }) => row.versionId === 'to'),
    ).toBe(true);
    expect(items[1].electiveGroupId).toBe('ng1');
    expect(items[0].electiveGroupId).toBeNull();
    expect(items[0]).toMatchObject({
      courseId: 'c1',
      htDa: true,
      note: 'x',
      blockSymbol: 'A',
    });
    expect(tx.curriculumRequisite.findMany).toHaveBeenCalledWith({
      where: { itemId: { in: ['i1', 'i2', 'i3'] } },
    });
    expect(tx.curriculumRequisite.createMany).toHaveBeenCalledWith({
      data: [
        {
          itemId: 'ni2',
          sourceCourseId: 'c1',
          relationType: CourseRelationType.PREREQUISITE,
          minScore: dec('2'),
        },
        {
          itemId: 'ni3',
          sourceCourseId: 'c1',
          relationType: CourseRelationType.COREQUISITE,
          minScore: null,
        },
      ],
    });
  });

  it('never writes to the source version', async () => {
    const { tx, copy } = txWith({
      groups: [],
      items: [
        {
          id: 'i1',
          courseId: 'c1',
          plannedSemester: 1,
          sortOrder: 1,
          blockSymbol: null,
          isElective: false,
          electiveGroupId: null,
          htDa: false,
          tqDa: false,
          minStudiedScore: null,
          minTransferScore: null,
          note: null,
        },
      ],
      newItems: [{ id: 'ni1', courseId: 'c1' }],
      requisites: [],
    });

    await copy();

    const created = tx.curriculumItem.createMany.mock.calls[0][0].data;
    expect(
      created.every((row: { versionId: string }) => row.versionId === 'to'),
    ).toBe(true);
    expect(tx.curriculumRequisite.createMany).not.toHaveBeenCalled();
  });
});
