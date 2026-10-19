import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  OrgUnitStatus,
  OrgUnitType,
  Prisma,
  SubjectGroupMemberRole,
  SubjectGroupStatus,
} from '../../generated/prisma/client.js';
import {
  AccessContext,
  type ResolvedScope,
} from '../../shared/authz/access-context.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { COMMON_ERRORS } from '../../shared/exception/error-codes.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import {
  toSubjectGroupSummaryDto,
  type SubjectGroupWithActiveMembers,
} from './subject-group.dto.js';
import { SubjectGroupsService } from './subject-groups.service.js';

const GROUP: SubjectGroupWithActiveMembers = {
  id: 'group',
  groupCode: 'GROUP',
  groupName: 'Group',
  facultyId: 'faculty',
  status: SubjectGroupStatus.ACTIVE,
  createdAt: new Date('2026-10-19T00:00:00.000Z'),
  updatedAt: new Date('2026-10-19T00:00:00.000Z'),
  faculty: { id: 'faculty', unitCode: 'FACULTY', unitName: 'Faculty' },
  members: [],
};
const SCOPED: ResolvedScope = {
  all: false,
  orgUnitIds: new Set(),
  subjectGroupIds: new Set(),
  programIds: new Set(),
  studentIds: new Set(),
};

describe('SubjectGroupsService', () => {
  let findMany: ReturnType<typeof vi.fn>;
  let findUnique: ReturnType<typeof vi.fn>;
  let create: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let faculty: ReturnType<typeof vi.fn>;
  let service: SubjectGroupsService;

  beforeEach(() => {
    findMany = vi.fn().mockResolvedValue([GROUP]);
    findUnique = vi.fn().mockResolvedValue(GROUP);
    create = vi.fn().mockResolvedValue(GROUP);
    update = vi.fn().mockResolvedValue(GROUP);
    faculty = vi.fn().mockResolvedValue({
      unitType: OrgUnitType.FACULTY,
      status: OrgUnitStatus.ACTIVE,
    });
    service = new SubjectGroupsService({
      subjectGroup: { findMany, findUnique, create, update },
      orgUnit: { findUnique: faculty },
      subjectGroupMember: { findMany: vi.fn().mockResolvedValue([]) },
    } as unknown as PrismaService);
  });

  it.each([
    [{ all: true }, undefined],
    [
      { ...SCOPED, subjectGroupIds: new Set(['group']) },
      [{ id: { in: ['group'] } }, { facultyId: { in: [] } }],
    ],
    [
      { ...SCOPED, orgUnitIds: new Set(['faculty']) },
      [{ id: { in: [] } }, { facultyId: { in: ['faculty'] } }],
    ],
  ] as const)('filters lists by scope %o', async (scope, expected) => {
    const access = { scopeFor: () => scope } as unknown as AccessContext;
    await service.list({}, access);
    expect(findMany.mock.calls[0][0].where.OR).toEqual(expected);
  });

  it('checks scope on existing groups but returns missing groups first', async () => {
    const access = new AccessContext('user', []);
    const assertCan = vi.spyOn(access, 'assertCan').mockImplementation(() => {
      throw new AppException(COMMON_ERRORS.OUT_OF_SCOPE);
    });
    await expect(service.detail(GROUP.id, access)).rejects.toMatchObject({
      code: 'OUT_OF_SCOPE',
    });
    findUnique.mockResolvedValue(null);
    assertCan.mockClear();
    await expect(service.detail('missing', access)).rejects.toMatchObject({
      code: 'SUBJECT_GROUP_NOT_FOUND',
    });
    expect(assertCan).not.toHaveBeenCalled();
  });

  it('rejects non-faculty and inactive owners and maps duplicate codes', async () => {
    const dto = {
      groupCode: 'GROUP',
      groupName: 'Group',
      facultyId: 'faculty',
    };
    faculty.mockResolvedValue({
      unitType: OrgUnitType.OFFICE,
      status: OrgUnitStatus.ACTIVE,
    });
    await expect(service.create(dto, 'actor')).rejects.toMatchObject({
      code: 'FACULTY_INVALID',
    });
    faculty.mockResolvedValue({
      unitType: OrgUnitType.FACULTY,
      status: OrgUnitStatus.INACTIVE,
    });
    await expect(service.create(dto, 'actor')).rejects.toMatchObject({
      code: 'FACULTY_INVALID',
    });
    faculty.mockResolvedValue({
      unitType: OrgUnitType.FACULTY,
      status: OrgUnitStatus.ACTIVE,
    });
    create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );
    await expect(service.create(dto, 'actor')).rejects.toMatchObject({
      code: 'GROUP_CODE_TAKEN',
      details: [{ field: 'groupCode', constraints: ['unique'] }],
    });
  });

  it('counts people once, lists several coordinators, and hides inactive group counts', () => {
    const lecturer = { id: 'lecturer', fullName: 'Lecturer' };
    const other = { id: 'other', fullName: 'Other' };
    const row = {
      ...GROUP,
      members: [
        { memberRole: SubjectGroupMemberRole.MEMBER, lecturer },
        { memberRole: SubjectGroupMemberRole.COORDINATOR, lecturer },
        { memberRole: SubjectGroupMemberRole.COORDINATOR, lecturer: other },
      ],
    };
    expect(toSubjectGroupSummaryDto(row)).toMatchObject({
      activeMemberCount: 2,
      activeCoordinators: [lecturer, other],
      hasActiveCoordinator: true,
    });
    expect(
      toSubjectGroupSummaryDto({ ...row, status: SubjectGroupStatus.INACTIVE }),
    ).toMatchObject({
      activeMemberCount: 0,
      activeCoordinators: [],
      hasActiveCoordinator: false,
    });
  });

  it('leaves status writes idempotent and checks faculty before reactivation', async () => {
    expect(await service.activate(GROUP.id, 'actor')).toMatchObject({
      status: SubjectGroupStatus.ACTIVE,
    });
    expect(update).not.toHaveBeenCalled();
    findUnique.mockResolvedValue({
      ...GROUP,
      status: SubjectGroupStatus.INACTIVE,
    });
    expect(await service.deactivate(GROUP.id, 'actor')).toMatchObject({
      status: SubjectGroupStatus.INACTIVE,
    });
    expect(update).not.toHaveBeenCalled();
    faculty.mockResolvedValue(null);
    await expect(service.activate(GROUP.id, 'actor')).rejects.toMatchObject({
      code: 'FACULTY_INVALID',
    });
  });

  it('returns the stable deactivation impact shape', async () => {
    expect(await service.deactivationImpact(GROUP.id)).toEqual({
      activeMemberCount: 0,
      activeCoordinators: [],
      courses: [],
    });
  });
});
