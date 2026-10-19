import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CourseStatus,
  Prisma,
  ScopeSource,
  ScopeType,
  type PermissionMode,
} from '../../generated/prisma/client.js';
import {
  AccessContext,
  type ActiveAssignment,
} from '../../shared/authz/access-context.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { EquivalenceGroupQueryDto } from './equivalence-group-query.dto.js';
import type { GroupRow } from './equivalence-group.dto.js';
import { EquivalenceGroupsService } from './equivalence-groups.service.js';

const NOW = new Date('2026-10-19T00:00:00.000Z');
const CODE = PERMISSIONS.COURSE_RELATION_EDIT;

function access(mode: PermissionMode, all: boolean): AccessContext {
  const assignment: ActiveAssignment = {
    assignmentId: 'a',
    roleId: 'r',
    roleCode: 'R',
    roleName: 'R',
    scopeSource: ScopeSource.NONE,
    scopeType: ScopeType.UNIT,
    scopeUnit: null,
    scope: {
      all: false,
      orgUnitIds: new Set(['home']),
      subjectGroupIds: new Set(['g1']),
      programIds: new Set(),
      studentIds: new Set(),
    },
    permissions: new Map([[CODE, { mode, scope: all ? 'ALL' : 'SCOPED' }]]),
  };
  return new AccessContext('user', [assignment]);
}

const R1 = access('DIRECT', true);
const R3 = access('VIA_REQUEST', true);
const R4 = access('VIA_REQUEST', false);

function member(id: string) {
  return {
    id,
    courseCode: id.toUpperCase(),
    courseName: `Học phần ${id}`,
    credits: new Prisma.Decimal('3.00'),
    status: CourseStatus.ACTIVE,
  };
}

function group(
  id: string,
  memberIds: string[],
  groupCode = id.toUpperCase(),
): GroupRow {
  return {
    id,
    groupCode,
    note: null,
    members: memberIds.map(member),
    createdAt: NOW,
    updatedAt: NOW,
  };
}

const P2002 = new Prisma.PrismaClientKnownRequestError('dup', {
  code: 'P2002',
  clientVersion: 'test',
});

describe('EquivalenceGroupsService', () => {
  let groups: Map<string, GroupRow>;
  let groupModel: Record<
    | 'findMany'
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'create'
    | 'update'
    | 'delete'
    | 'count',
    ReturnType<typeof vi.fn>
  >;
  let courseModel: Record<
    'findMany' | 'updateMany' | 'update',
    ReturnType<typeof vi.fn>
  >;
  let service: EquivalenceGroupsService;

  const free = (id: string) => ({
    ...member(id),
    status: CourseStatus.ACTIVE,
    equivalenceGroup: null,
  });

  beforeEach(() => {
    groups = new Map([
      ['g1', group('g1', ['a', 'b'])],
      ['g2', group('g2', ['x', 'y', 'z'])],
    ]);
    groupModel = {
      findMany: vi.fn().mockResolvedValue([group('g1', ['a', 'b'])]),
      findUnique: vi.fn(({ where }: { where: { id: string } }) =>
        Promise.resolve(groups.get(where.id) ?? null),
      ),
      findUniqueOrThrow: vi.fn().mockResolvedValue(group('new', ['a', 'b'])),
      create: vi.fn().mockResolvedValue({ id: 'new' }),
      update: vi.fn().mockResolvedValue(group('g1', ['a', 'b'])),
      delete: vi.fn().mockResolvedValue({}),
      count: vi.fn().mockResolvedValue(1),
    };
    courseModel = {
      findMany: vi.fn(({ where }: { where: { id: { in: string[] } } }) =>
        Promise.resolve(where.id.in.map(free)),
      ),
      updateMany: vi.fn(({ where }: { where: { id?: { in: string[] } } }) =>
        Promise.resolve({ count: where.id?.in.length ?? 2 }),
      ),
      update: vi.fn().mockResolvedValue({}),
    };
    const client: Record<string, unknown> = {
      equivalentCourseGroup: groupModel,
      course: courseModel,
    };
    client.$transaction = (work: unknown) =>
      typeof work === 'function'
        ? (work as (tx: unknown) => Promise<unknown>)(client)
        : Promise.all(work as Promise<unknown>[]);
    service = new EquivalenceGroupsService(client as unknown as PrismaService);
  });

  describe('permissions', () => {
    it.each([
      ['R3 (Đ)', R3],
      ['R4 (Đ(P))', R4],
    ])('refuses %s on every write', async (_label, caller) => {
      const writes = [
        () => service.create({ groupCode: 'X', courseIds: ['a', 'b'] }, caller),
        () => service.update('g1', { groupCode: 'X' }, caller),
        () => service.addMember('g1', 'c', caller),
        () => service.removeMember('g1', 'a', caller),
        () => service.merge('g1', 'g2', caller),
        () => service.dissolve('g1', caller),
      ];
      for (const write of writes) {
        await expect(write()).rejects.toMatchObject({
          code: 'PERMISSION_DENIED',
        });
      }
      expect(groupModel.create).not.toHaveBeenCalled();
      expect(courseModel.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('matches the group code or a member course code', async () => {
      await service.list(
        Object.assign(new EquivalenceGroupQueryDto(), { q: 'it0' }),
      );
      expect(groupModel.findMany.mock.calls[0][0].where).toEqual({
        OR: [
          { groupCode: { contains: 'it0', mode: 'insensitive' } },
          {
            members: {
              some: { courseCode: { contains: 'it0', mode: 'insensitive' } },
            },
          },
        ],
      });
    });

    it('lists everything without a term and pages the result', async () => {
      const page = await service.list(new EquivalenceGroupQueryDto());
      expect(groupModel.findMany.mock.calls[0][0].where).toEqual({});
      expect(page).toMatchObject({ total: 1, page: 1, pageSize: 20 });
      expect(page.items[0].members.map((m) => m.courseCode)).toEqual([
        'A',
        'B',
      ]);
    });
  });

  describe('create', () => {
    it('creates a group of two ungrouped courses as R1', async () => {
      const created = await service.create(
        { groupCode: 'EQ1', courseIds: ['a', 'b'] },
        R1,
      );
      expect(created.members).toHaveLength(2);
      expect(courseModel.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['a', 'b'] },
          equivalenceGroupId: null,
          status: { not: CourseStatus.CANCELLED },
        },
        data: { equivalenceGroupId: 'new' },
      });
    });

    it('names the group of a course that already belongs to one', async () => {
      courseModel.findMany.mockResolvedValue([
        free('a'),
        { ...free('b'), equivalenceGroup: { groupCode: 'OLD' } },
      ]);
      await expect(
        service.create({ groupCode: 'EQ1', courseIds: ['a', 'b'] }, R1),
      ).rejects.toSatisfy(
        (error: { code: string; message: string }) =>
          error.code === 'COURSE_ALREADY_GROUPED' &&
          error.message.includes('B (nhóm OLD)'),
      );
      expect(groupModel.create).not.toHaveBeenCalled();
    });

    it('refuses a Cancelled member and an unknown course', async () => {
      courseModel.findMany.mockResolvedValue([
        free('a'),
        { ...free('b'), status: CourseStatus.CANCELLED },
      ]);
      await expect(
        service.create({ groupCode: 'EQ1', courseIds: ['a', 'b'] }, R1),
      ).rejects.toMatchObject({ code: 'MEMBER_COURSE_CANCELLED' });
      courseModel.findMany.mockResolvedValue([free('a')]);
      await expect(
        service.create({ groupCode: 'EQ1', courseIds: ['a', 'b'] }, R1),
      ).rejects.toMatchObject({ code: 'MEMBER_COURSE_NOT_FOUND' });
    });

    it('loses a race cleanly: a count mismatch means someone grouped a course first', async () => {
      courseModel.updateMany.mockResolvedValue({ count: 1 });
      await expect(
        service.create({ groupCode: 'EQ1', courseIds: ['a', 'b'] }, R1),
      ).rejects.toMatchObject({ code: 'COURSE_ALREADY_GROUPED' });
    });

    it('maps a duplicate group code', async () => {
      groupModel.create.mockRejectedValue(P2002);
      await expect(
        service.create({ groupCode: 'EQ1', courseIds: ['a', 'b'] }, R1),
      ).rejects.toMatchObject({ code: 'EQUIVALENCE_GROUP_CODE_TAKEN' });
    });
  });

  describe('update', () => {
    it('changes code and note, and maps a duplicate code', async () => {
      await service.update('g1', { groupCode: 'NEW', note: 'Ghi chú' }, R1);
      expect(groupModel.update.mock.calls[0][0].data).toEqual({
        groupCode: 'NEW',
        note: 'Ghi chú',
      });
      groupModel.update.mockRejectedValue(P2002);
      await expect(
        service.update('g1', { groupCode: 'NEW' }, R1),
      ).rejects.toMatchObject({ code: 'EQUIVALENCE_GROUP_CODE_TAKEN' });
    });

    it('refuses an unknown group', async () => {
      await expect(service.update('nope', {}, R1)).rejects.toMatchObject({
        code: 'EQUIVALENCE_GROUP_NOT_FOUND',
      });
    });
  });

  describe('addMember', () => {
    it('adds a third course (US-017 AC2)', async () => {
      await service.addMember('g1', 'c', R1);
      expect(courseModel.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { equivalenceGroupId: 'g1' } }),
      );
    });

    it('offers a merge when the course is in another group (US-017 AC3)', async () => {
      courseModel.findMany.mockResolvedValue([
        { ...free('c'), equivalenceGroup: { groupCode: 'G2' } },
      ]);
      await expect(service.addMember('g1', 'c', R1)).rejects.toSatisfy(
        (error: { code: string; message: string }) =>
          error.code === 'COURSE_ALREADY_GROUPED' &&
          error.message.includes('hãy gộp hai nhóm') &&
          error.message.includes('C (nhóm G2)'),
      );
    });
  });

  describe('removeMember', () => {
    it('refuses to leave a group with one course', async () => {
      await expect(service.removeMember('g1', 'a', R1)).rejects.toMatchObject({
        code: 'GROUP_MIN_MEMBERS',
      });
      expect(courseModel.update).not.toHaveBeenCalled();
    });

    it('removes one of three', async () => {
      await service.removeMember('g2', 'x', R1);
      expect(courseModel.update).toHaveBeenCalledWith({
        where: { id: 'x' },
        data: { equivalenceGroupId: null },
      });
    });

    it('refuses a course that is not a member', async () => {
      await expect(service.removeMember('g2', 'a', R1)).rejects.toMatchObject({
        code: 'EQUIVALENCE_NOT_A_MEMBER',
      });
    });
  });

  describe('merge', () => {
    it('refuses merging a group with itself', async () => {
      await expect(service.merge('g1', 'g1', R1)).rejects.toMatchObject({
        code: 'MERGE_SAME_GROUP',
      });
    });

    it('refuses an unknown group on either side', async () => {
      await expect(service.merge('g1', 'nope', R1)).rejects.toMatchObject({
        code: 'EQUIVALENCE_GROUP_NOT_FOUND',
      });
    });

    it('moves the other group members here, then deletes it', async () => {
      await service.merge('g1', 'g2', R1);
      expect(courseModel.updateMany).toHaveBeenCalledWith({
        where: { equivalenceGroupId: 'g2' },
        data: { equivalenceGroupId: 'g1' },
      });
      expect(groupModel.delete).toHaveBeenCalledWith({ where: { id: 'g2' } });
      expect(courseModel.updateMany.mock.invocationCallOrder[0]).toBeLessThan(
        groupModel.delete.mock.invocationCallOrder[0],
      );
    });
  });

  describe('dissolve', () => {
    it('clears every member, then deletes the group', async () => {
      await service.dissolve('g2', R1);
      expect(courseModel.updateMany).toHaveBeenCalledWith({
        where: { equivalenceGroupId: 'g2' },
        data: { equivalenceGroupId: null },
      });
      expect(groupModel.delete).toHaveBeenCalledWith({ where: { id: 'g2' } });
    });
  });
});
