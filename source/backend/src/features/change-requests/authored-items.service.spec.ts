import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ChangeRequestStatus,
  ChangeRequestType,
  ChangeTargetType,
  CourseType,
  Prisma,
  RequestOrigin,
  ScopeSource,
  ScopeType,
  SubjectGroupStatus,
  UserStatus,
} from '../../generated/prisma/client.js';
import {
  AccessContext,
  type ActiveAssignment,
} from '../../shared/authz/access-context.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import type { PrismaService } from '../../shared/prisma/prisma.service.js';
import { AuthoredItemsService } from './authored-items.service.js';
import type { ChangeRequestDetailReader } from './change-request-detail.reader.js';
import type { ChangeRequestsService } from './change-requests.service.js';
import type { ReplaceAuthoredItemsDto } from './authored-item.dto.js';
import type { RequestCore } from './request-visibility.js';

const ORG_ACCESS = (groupIds: string[]) => {
  const assignment: ActiveAssignment = {
    assignmentId: null,
    roleId: 'r',
    roleCode: 'R4',
    roleName: 'R4',
    scopeSource: ScopeSource.SUBJECT_GROUP_COORDINATOR,
    scopeType: ScopeType.ASSIGNMENT,
    scopeUnit: null,
    scope: {
      all: false,
      orgUnitIds: new Set(),
      subjectGroupIds: new Set(groupIds),
      programIds: new Set(),
      studentIds: new Set(),
    },
    permissions: new Map([
      [
        PERMISSIONS.CHANGE_REQUEST_CREATE_ORGANIZATIONAL,
        { mode: 'DIRECT', scope: 'SCOPED' },
      ],
    ]),
  };
  return new AccessContext('u1', [assignment]);
};

const request = (patch: Partial<RequestCore>): RequestCore => ({
  id: 'cr1',
  requestType: ChangeRequestType.COURSE_RELATION,
  targetType: ChangeTargetType.COURSE,
  courseId: 'c1',
  programId: null,
  subjectGroupId: null,
  createdById: 'u1',
  status: ChangeRequestStatus.DRAFT,
  submissionRound: 0,
  origin: RequestOrigin.FACULTY,
  basisDocumentNumber: null,
  ...patch,
});

const dto = (...items: object[]) =>
  ({ items }) as unknown as ReplaceAuthoredItemsDto;

describe('AuthoredItemsService', () => {
  const tx = {
    changeRequest: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
    changeItem: { deleteMany: vi.fn(), createMany: vi.fn() },
  };
  const prisma = {
    $transaction: vi.fn((run: (client: unknown) => unknown) => run(tx)),
    course: { findUniqueOrThrow: vi.fn(), findMany: vi.fn() },
    subjectGroup: { findUnique: vi.fn(), findUniqueOrThrow: vi.fn() },
    courseRelation: { findUnique: vi.fn() },
    subjectGroupMember: { findUnique: vi.fn() },
    programDirectorAssignment: { findUnique: vi.fn() },
    program: { findUniqueOrThrow: vi.fn() },
    user: { findUnique: vi.fn(), findMany: vi.fn() },
  };
  const requests = { findOwnDraft: vi.fn() };
  const details = { read: vi.fn().mockResolvedValue({ id: 'cr1' }) };
  let service: AuthoredItemsService;
  const ANYONE = new AccessContext('u1', []);

  beforeEach(() => {
    vi.clearAllMocks();
    tx.changeRequest.updateMany.mockResolvedValue({ count: 1 });
    requests.findOwnDraft.mockResolvedValue(request({}));
    prisma.course.findUniqueOrThrow.mockResolvedValue({
      courseName: 'Lập trình',
      englishName: null,
      credits: new Prisma.Decimal('3'),
      courseType: CourseType.THEORY,
      ownerGroupId: 'g1',
      ownerFacultyId: 'f1',
      ownerGroup: { groupCode: 'G1' },
    });
    service = new AuthoredItemsService(
      prisma as unknown as PrismaService,
      requests as unknown as ChangeRequestsService,
      details as unknown as ChangeRequestDetailReader,
    );
  });

  const saved = () => tx.changeItem.createMany.mock.calls[0][0].data;

  it('keeps items only on the types that author them', async () => {
    requests.findOwnDraft.mockResolvedValue(
      request({ requestType: ChangeRequestType.CURRICULUM }),
    );
    await expect(service.replace('cr1', dto(), ANYONE)).rejects.toMatchObject({
      code: 'ITEMS_NOT_AUTHORED',
    });
    requests.findOwnDraft.mockResolvedValue(request({}));
    await expect(
      service.replace(
        'cr1',
        dto({
          operation: 'ADD_MEMBER',
          lecturerId: 'u',
          memberRole: 'MEMBER',
          validFrom: '2026-11-01',
          validTo: null,
        }),
        ANYONE,
      ),
    ).rejects.toMatchObject({
      code: 'OPERATION_NOT_FOR_TYPE',
      details: [{ field: 'items.0' }],
    });
  });

  it('refuses a value equal to the current one and an invalid credits value', async () => {
    await expect(
      service.replace(
        'cr1',
        dto({ operation: 'SET_COURSE_FIELD', field: 'credits', value: '3.00' }),
        ANYONE,
      ),
    ).rejects.toMatchObject({ code: 'ITEM_UNCHANGED' });
    await expect(
      service.replace(
        'cr1',
        dto({ operation: 'SET_COURSE_FIELD', field: 'credits', value: 'abc' }),
        ANYONE,
      ),
    ).rejects.toMatchObject({ code: 'ITEM_INVALID' });
    await expect(
      service.replace(
        'cr1',
        dto({
          operation: 'SET_COURSE_FIELD',
          field: 'courseType',
          value: 'NOPE',
        }),
        ANYONE,
      ),
    ).rejects.toMatchObject({ code: 'ITEM_INVALID' });
  });

  it('stores a course field change with its before value, replacing the old list in one transaction', async () => {
    await service.replace(
      'cr1',
      dto({ operation: 'SET_COURSE_FIELD', field: 'credits', value: '4' }),
      ANYONE,
    );
    expect(tx.changeItem.deleteMany).toHaveBeenCalledWith({
      where: { changeRequestId: 'cr1' },
    });
    expect(saved()).toEqual([
      expect.objectContaining({
        entityType: 'COURSE_FIELD',
        itemKey: 'credits',
        label: 'Số tín chỉ',
        oldValue: { value: '3' },
        newValue: {
          operation: 'SET_COURSE_FIELD',
          field: 'credits',
          value: '4',
        },
      }),
    ]);
  });

  it('checks that a new owner group is an active group of the same faculty and keeps its code to show', async () => {
    prisma.subjectGroup.findUnique.mockResolvedValue({
      groupCode: 'G2',
      status: SubjectGroupStatus.ACTIVE,
      facultyId: 'other-faculty',
    });
    await expect(
      service.replace(
        'cr1',
        dto({
          operation: 'SET_COURSE_FIELD',
          field: 'ownerGroupId',
          value: 'g2',
        }),
        ANYONE,
      ),
    ).rejects.toMatchObject({ code: 'ITEM_INVALID' });
    prisma.subjectGroup.findUnique.mockResolvedValue({
      groupCode: 'G2',
      status: SubjectGroupStatus.ACTIVE,
      facultyId: 'f1',
    });
    await service.replace(
      'cr1',
      dto({
        operation: 'SET_COURSE_FIELD',
        field: 'ownerGroupId',
        value: 'g2',
      }),
      ANYONE,
    );
    expect(saved()[0].newValue).toMatchObject({ value: 'g2', display: 'G2' });
    expect(saved()[0].oldValue).toMatchObject({ value: 'g1', display: 'G1' });
  });

  describe('relations', () => {
    const add = (patch: object = {}) => ({
      operation: 'ADD_RELATION',
      sourceCourseId: 'c1',
      targetCourseId: 'c2',
      relationType: 'PREREQUISITE',
      minScore: '2',
      ...patch,
    });

    it('needs the request course on one end and refuses a relation that exists', async () => {
      await expect(
        service.replace(
          'cr1',
          dto(add({ sourceCourseId: 'x', targetCourseId: 'y' })),
          ANYONE,
        ),
      ).rejects.toMatchObject({ code: 'OPERATION_TARGET_MISMATCH' });
      prisma.course.findMany.mockResolvedValue([
        { id: 'c1', courseCode: 'IT1' },
        { id: 'c2', courseCode: 'IT2' },
      ]);
      prisma.courseRelation.findUnique.mockResolvedValue({ id: 'r' });
      await expect(
        service.replace('cr1', dto(add()), ANYONE),
      ).rejects.toMatchObject({ code: 'ITEM_INVALID' });
    });

    it('labels an addition by course codes and type', async () => {
      prisma.course.findMany.mockResolvedValue([
        { id: 'c1', courseCode: 'IT1' },
        { id: 'c2', courseCode: 'IT2' },
      ]);
      prisma.courseRelation.findUnique.mockResolvedValue(null);
      await service.replace('cr1', dto(add()), ANYONE);
      expect(saved()[0]).toMatchObject({
        entityType: 'COURSE_RELATION',
        itemKey: 'IT1|IT2|PREREQUISITE',
        label: 'IT1 → IT2 (Tiên quyết)',
        oldValue: expect.anything(),
        newValue: { operation: 'ADD_RELATION', minScore: '2' },
      });
    });

    it('updates and removes a relation by id, and refuses one that does not touch the course or is unchanged', async () => {
      const row = {
        id: 'r1',
        relationType: 'PREREQUISITE',
        minScore: new Prisma.Decimal('2'),
        sourceCourseId: 'c1',
        targetCourseId: 'c9',
        sourceCourse: { courseCode: 'IT1' },
        targetCourse: { courseCode: 'IT9' },
      };
      prisma.courseRelation.findUnique.mockResolvedValue(row);
      await expect(
        service.replace(
          'cr1',
          dto({
            operation: 'UPDATE_RELATION',
            relationId: 'r1',
            minScore: '2.00',
          }),
          ANYONE,
        ),
      ).rejects.toMatchObject({ code: 'ITEM_UNCHANGED' });
      prisma.courseRelation.findUnique.mockResolvedValue({
        ...row,
        sourceCourseId: 'x',
        targetCourseId: 'y',
      });
      await expect(
        service.replace(
          'cr1',
          dto({ operation: 'REMOVE_RELATION', relationId: 'r1' }),
          ANYONE,
        ),
      ).rejects.toMatchObject({ code: 'OPERATION_TARGET_MISMATCH' });
      prisma.courseRelation.findUnique.mockResolvedValue(row);
      await service.replace(
        'cr1',
        dto({ operation: 'REMOVE_RELATION', relationId: 'r1' }),
        ANYONE,
      );
      expect(saved()[0]).toMatchObject({
        oldValue: { minScore: '2' },
        newValue: { operation: 'REMOVE_RELATION', relationId: 'r1' },
        recordId: 'r1',
      });
    });
  });

  describe('organisational items', () => {
    beforeEach(() => {
      requests.findOwnDraft.mockResolvedValue(
        request({
          requestType: ChangeRequestType.ORGANIZATION,
          targetType: ChangeTargetType.SUBJECT_GROUP,
          courseId: null,
          subjectGroupId: 'g1',
        }),
      );
      prisma.subjectGroup.findUniqueOrThrow.mockResolvedValue({
        facultyId: 'f1',
      });
      prisma.user.findUnique.mockResolvedValue({
        fullName: 'Nguyễn Văn A',
        status: UserStatus.ACTIVE,
      });
    });
    const addMember = {
      operation: 'ADD_MEMBER',
      lecturerId: 'u9',
      memberRole: 'COORDINATOR',
      validFrom: '2026-11-01',
      validTo: null,
    };

    it('re-checks the scope on every save', async () => {
      await expect(
        service.replace('cr1', dto(addMember), ORG_ACCESS(['elsewhere'])),
      ).rejects.toMatchObject({ code: 'OUT_OF_SCOPE' });
    });

    it('writes a readable label and refuses a disabled user or a period that ends before it starts', async () => {
      await service.replace('cr1', dto(addMember), ORG_ACCESS(['g1']));
      expect(saved()[0]).toMatchObject({
        entityType: 'ORG_MEMBERSHIP',
        itemKey: 'ADD|u9|COORDINATOR|2026-11-01',
        label: 'Thêm Nguyễn Văn A — Điều phối, từ 01/11/2026',
      });
      prisma.user.findUnique.mockResolvedValue({
        fullName: 'B',
        status: UserStatus.DISABLED,
      });
      await expect(
        service.replace('cr1', dto(addMember), ORG_ACCESS(['g1'])),
      ).rejects.toMatchObject({ code: 'ITEM_REFERENCE_NOT_FOUND' });
      prisma.user.findUnique.mockResolvedValue({
        fullName: 'A',
        status: UserStatus.ACTIVE,
      });
      await expect(
        service.replace(
          'cr1',
          dto({ ...addMember, validTo: '2026-10-01' }),
          ORG_ACCESS(['g1']),
        ),
      ).rejects.toMatchObject({ code: 'VALIDITY_INVALID' });
    });

    it('ends only a live membership of the request group', async () => {
      const row = {
        id: 'm1',
        subjectGroupId: 'g1',
        memberRole: 'MEMBER',
        validFrom: new Date('2026-01-01T00:00:00Z'),
        validTo: null,
        revokedAt: null,
        lecturer: { fullName: 'Trần B' },
      };
      const end = {
        operation: 'END_MEMBERSHIP',
        memberRowId: 'm1',
        validTo: '2026-12-31',
      };
      prisma.subjectGroupMember.findUnique.mockResolvedValue({
        ...row,
        subjectGroupId: 'other',
      });
      await expect(
        service.replace('cr1', dto(end), ORG_ACCESS(['g1'])),
      ).rejects.toMatchObject({
        code: 'OPERATION_TARGET_MISMATCH',
      });
      prisma.subjectGroupMember.findUnique.mockResolvedValue(row);
      await service.replace('cr1', dto(end), ORG_ACCESS(['g1']));
      expect(saved()[0]).toMatchObject({
        itemKey: 'END|m1',
        label: 'Kết thúc Trần B — Thành viên, đến 31/12/2026',
        oldValue: { validTo: null },
      });
    });

    it('refuses a group operation on a program request and the reverse', async () => {
      requests.findOwnDraft.mockResolvedValue(
        request({
          requestType: ChangeRequestType.ORGANIZATION,
          targetType: ChangeTargetType.PROGRAM,
          courseId: null,
          programId: 'p1',
        }),
      );
      await expect(
        service.replace('cr1', dto(addMember), ORG_ACCESS(['g1'])),
      ).rejects.toMatchObject({
        code: 'OPERATION_TARGET_MISMATCH',
      });
    });
  });

  it('refuses two identical items and a request that was submitted meanwhile', async () => {
    const same = {
      operation: 'SET_COURSE_FIELD',
      field: 'credits',
      value: '4',
    };
    await expect(
      service.replace('cr1', dto(same, same), ANYONE),
    ).rejects.toMatchObject({
      code: 'ITEM_DUPLICATE',
      details: [{ field: 'items.1' }],
    });
    tx.changeRequest.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.replace('cr1', dto(same), ANYONE),
    ).rejects.toMatchObject({ code: 'REQUEST_NOT_DRAFT' });
    expect(tx.changeItem.createMany).not.toHaveBeenCalled();
  });

  it('offers at most the option limit of active users, matched by code, name or username', async () => {
    prisma.user.findMany.mockResolvedValue([]);
    await service.userOptions('  an ');
    const call = prisma.user.findMany.mock.calls[0][0];
    expect(call.where.status).toBe(UserStatus.ACTIVE);
    expect(call.where.OR).toHaveLength(3);
    expect(call.take).toBe(20);
  });
});
