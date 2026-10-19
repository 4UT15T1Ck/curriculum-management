import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CourseStatus,
  Prisma,
  ScopeSource,
  ScopeType,
  SyllabusStatus,
} from '../../generated/prisma/client.js';
import {
  AccessContext,
  type ActiveAssignment,
} from '../../shared/authz/access-context.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import type { PrismaService } from '../../shared/prisma/prisma.service.js';
import { WeeklyContentsService } from './weekly-contents.service.js';

function holder(orgUnitIds: string[]): AccessContext {
  const assignment: ActiveAssignment = {
    assignmentId: null,
    roleId: 'r',
    roleCode: 'R',
    roleName: 'R',
    scopeSource: ScopeSource.NONE,
    scopeType: ScopeType.ASSIGNMENT,
    scopeUnit: null,
    scope: {
      all: false,
      orgUnitIds: new Set(orgUnitIds),
      subjectGroupIds: new Set(),
      programIds: new Set(),
      studentIds: new Set(),
    },
    permissions: new Map([
      [PERMISSIONS.SYLLABUS_EDIT, { mode: 'VIA_REQUEST', scope: 'SCOPED' }],
      [PERMISSIONS.PROGRAM_VIEW, { mode: 'DIRECT', scope: 'ALL' }],
    ]),
  };
  return new AccessContext('user', [assignment]);
}

const R3 = holder(['home']);

function accessRow(status: SyllabusStatus) {
  return {
    id: 's1',
    status,
    courseId: 'c1',
    course: {
      id: 'c1',
      courseCode: 'IT001',
      courseName: 'Nhập môn',
      englishName: null,
      credits: new Prisma.Decimal('3'),
      status: CourseStatus.ACTIVE,
      ownerFacultyId: 'home',
      ownerGroupId: null,
      ownerFaculty: { unitCode: 'KHOA_CNTT' },
    },
  };
}

function week(id: string, sortOrder: number) {
  return {
    id,
    weekLabel: `Tuần ${sortOrder}`,
    sortOrder,
    content: '<p>x</p>',
    teachingActivities: null,
  };
}

describe('WeeklyContentsService', () => {
  let prisma: {
    syllabus: {
      findUnique: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    weeklyContent: {
      findUnique: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let service: WeeklyContentsService;

  beforeEach(() => {
    prisma = {
      syllabus: {
        findUnique: vi.fn().mockResolvedValue(accessRow(SyllabusStatus.DRAFT)),
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue({}),
      },
      weeklyContent: {
        findUnique: vi.fn().mockResolvedValue({
          syllabusId: 's1',
          syllabus: accessRow(SyllabusStatus.DRAFT),
        }),
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
        create: vi.fn(({ data }: { data: { sortOrder: number } }) =>
          Promise.resolve(week('new', data.sortOrder)),
        ),
        update: vi.fn().mockResolvedValue(week('w1', 1)),
        delete: vi.fn().mockResolvedValue({}),
      },
      $transaction: vi.fn(),
    };
    prisma.$transaction.mockImplementation((run: (tx: unknown) => unknown) =>
      run(prisma),
    );
    service = new WeeklyContentsService(prisma as unknown as PrismaService);
  });

  it('appends a row after the existing ones and sanitizes both texts', async () => {
    prisma.weeklyContent.count.mockResolvedValue(2);

    await service.create(
      's1',
      {
        weekLabel: 'Tuần 3',
        content: '<p>Nội dung</p><script>x()</script>',
        teachingActivities: '<p> </p>',
      },
      R3,
    );

    expect(prisma.weeklyContent.create).toHaveBeenCalledWith({
      data: {
        syllabusId: 's1',
        weekLabel: 'Tuần 3',
        sortOrder: 3,
        content: '<p>Nội dung</p>',
        teachingActivities: null,
      },
    });
    expect(prisma.syllabus.update).toHaveBeenCalled();
  });

  it('refuses empty content with a field detail', async () => {
    await expect(
      service.create('s1', { weekLabel: 'Tuần 1', content: '<p> </p>' }, R3),
    ).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
      details: [{ field: 'content' }],
    });
    expect(prisma.weeklyContent.create).not.toHaveBeenCalled();
  });

  it('refuses a row beyond the limit', async () => {
    prisma.weeklyContent.count.mockResolvedValue(60);

    await expect(
      service.create('s1', { weekLabel: 'Tuần 61', content: '<p>x</p>' }, R3),
    ).rejects.toMatchObject({ code: 'SYLLABUS_WEEKLY_ROWS_LIMIT' });
  });

  it('asks for a change request on a published revision', async () => {
    prisma.syllabus.findUnique.mockResolvedValue(
      accessRow(SyllabusStatus.PUBLISHED),
    );
    prisma.syllabus.findFirst.mockResolvedValue({ id: 's1' });

    await expect(
      service.create('s1', { weekLabel: 'Tuần 1', content: '<p>x</p>' }, R3),
    ).rejects.toMatchObject({ code: 'CHANGE_REQUEST_REQUIRED' });
  });

  it('updates only the fields sent', async () => {
    await service.update('w1', { weekLabel: 'Tuần 9' }, R3);

    expect(prisma.weeklyContent.update).toHaveBeenCalledWith({
      where: { id: 'w1' },
      data: { weekLabel: 'Tuần 9' },
    });
  });

  it('is not found for an unknown row', async () => {
    prisma.weeklyContent.findUnique.mockResolvedValue(null);

    await expect(service.update('nope', {}, R3)).rejects.toMatchObject({
      code: 'WEEKLY_CONTENT_NOT_FOUND',
    });
  });

  it('closes the gap after a delete', async () => {
    prisma.weeklyContent.findMany.mockResolvedValue([{ id: 'a' }, { id: 'c' }]);

    await service.remove('b', R3);

    expect(prisma.weeklyContent.delete).toHaveBeenCalledWith({
      where: { id: 'b' },
    });
    expect(prisma.weeklyContent.update.mock.calls.map(([arg]) => arg)).toEqual([
      { where: { id: 'a' }, data: { sortOrder: 1 } },
      { where: { id: 'c' }, data: { sortOrder: 2 } },
    ]);
  });

  describe('reorder', () => {
    beforeEach(() => {
      prisma.weeklyContent.findMany
        .mockResolvedValueOnce([{ id: 'a' }, { id: 'b' }, { id: 'c' }])
        .mockResolvedValue([week('c', 1), week('a', 2), week('b', 3)]);
    });

    it('numbers the rows in the order given', async () => {
      const result = await service.reorder('s1', { ids: ['c', 'a', 'b'] }, R3);

      expect(
        prisma.weeklyContent.update.mock.calls.map(([arg]) => arg),
      ).toEqual([
        { where: { id: 'c' }, data: { sortOrder: 1 } },
        { where: { id: 'a' }, data: { sortOrder: 2 } },
        { where: { id: 'b' }, data: { sortOrder: 3 } },
      ]);
      expect(result.map((row) => row.id)).toEqual(['c', 'a', 'b']);
    });

    it('refuses a list with a missing id', async () => {
      await expect(
        service.reorder('s1', { ids: ['a', 'b'] }, R3),
      ).rejects.toMatchObject({ code: 'SYLLABUS_ORDER_MISMATCH' });
    });

    it('refuses a list with a foreign id', async () => {
      await expect(
        service.reorder('s1', { ids: ['a', 'b', 'z'] }, R3),
      ).rejects.toMatchObject({ code: 'SYLLABUS_ORDER_MISMATCH' });
      expect(prisma.weeklyContent.update).not.toHaveBeenCalled();
    });
  });
});
