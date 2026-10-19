import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CourseRelationType,
  CourseStatus,
  Prisma,
  ProgramVersionStatus,
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
import type { VersionRow } from './curriculum-access.js';
import type { CurriculumReadService } from './curriculum-read.service.js';
import { CurriculumRequisitesService } from './curriculum-requisites.service.js';

const VERSION: VersionRow = {
  id: 'v1',
  status: ProgramVersionStatus.DRAFT,
  semesterCount: 8,
  programId: 'p1',
  programName: 'Kỹ thuật máy tính',
  versionNumber: null,
  program: { id: 'p1', facultyId: 'home', programCode: '1024034' },
};

function access(
  mode: PermissionMode,
  all: boolean,
  subjectGroupIds: string[] = [],
): AccessContext {
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
      orgUnitIds: new Set(),
      subjectGroupIds: new Set(subjectGroupIds),
      programIds: new Set(),
      studentIds: new Set(),
    },
    permissions: new Map([
      [
        PERMISSIONS.CURRICULUM_EDIT,
        { mode, scope: all ? ('ALL' as const) : ('SCOPED' as const) },
      ],
    ]),
  };
  return new AccessContext('user', [assignment]);
}

const R1 = access('DIRECT', true);

// The row under edit is course B of group G1.
const ITEM = {
  id: 'i1',
  versionId: 'v1',
  courseId: 'B',
  plannedSemester: 2,
  electiveGroupId: null,
  version: VERSION,
  course: { courseCode: 'B', ownerGroupId: 'G1' },
};

const prerequisite = (sourceCourseId: string, minScore?: string) => ({
  sourceCourseId,
  relationType: CourseRelationType.PREREQUISITE,
  minScore,
});

describe('CurriculumRequisitesService', () => {
  let courseRelation: { findMany: ReturnType<typeof vi.fn> };
  let curriculumRequisite: Record<
    'findMany' | 'createMany' | 'deleteMany',
    ReturnType<typeof vi.fn>
  >;
  let course: { findMany: ReturnType<typeof vi.fn> };
  let executeRaw: ReturnType<typeof vi.fn>;
  let reader: Record<'findItem' | 'itemDto', ReturnType<typeof vi.fn>>;
  let service: CurriculumRequisitesService;

  beforeEach(() => {
    courseRelation = { findMany: vi.fn().mockResolvedValue([]) };
    curriculumRequisite = {
      findMany: vi.fn().mockResolvedValue([]),
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    };
    course = {
      findMany: vi.fn().mockImplementation(({ where }) =>
        Promise.resolve(
          (where.id.in as string[]).map((id) => ({
            id,
            courseCode: id,
            status: CourseStatus.ACTIVE,
          })),
        ),
      ),
    };
    executeRaw = vi.fn().mockResolvedValue(1);
    reader = {
      findItem: vi.fn().mockResolvedValue(ITEM),
      itemDto: vi.fn().mockResolvedValue({ id: 'i1' }),
    };
    const client: Record<string, unknown> = {
      courseRelation,
      curriculumRequisite,
      course,
      programVersion: { findFirst: vi.fn().mockResolvedValue(null) },
      $executeRaw: executeRaw,
    };
    client.$transaction = (work: (tx: unknown) => Promise<unknown>) =>
      work(client);
    service = new CurriculumRequisitesService(
      client as unknown as PrismaService,
      reader as unknown as CurriculumReadService,
    );
  });

  describe('seedFromCatalog', () => {
    it('copies catalog requisites of the course, never replacements or cancelled sources', async () => {
      courseRelation.findMany.mockResolvedValue([
        {
          sourceCourseId: 'A',
          relationType: CourseRelationType.PREREQUISITE,
          minScore: new Prisma.Decimal('2'),
        },
      ]);
      const tx = { courseRelation, curriculumRequisite };

      await service.seedFromCatalog(tx as never, 'i1', 'B');

      expect(courseRelation.findMany.mock.calls[0][0].where).toEqual({
        targetCourseId: 'B',
        relationType: {
          in: [
            CourseRelationType.PRIOR,
            CourseRelationType.PREREQUISITE,
            CourseRelationType.COREQUISITE,
          ],
        },
        sourceCourse: { status: { not: CourseStatus.CANCELLED } },
      });
      expect(curriculumRequisite.createMany).toHaveBeenCalledWith({
        data: [
          {
            itemId: 'i1',
            sourceCourseId: 'A',
            relationType: CourseRelationType.PREREQUISITE,
            minScore: new Prisma.Decimal('2'),
          },
        ],
      });
    });

    it('writes nothing when the catalog has no requisite for the course', async () => {
      await service.seedFromCatalog(
        { courseRelation, curriculumRequisite } as never,
        'i1',
        'B',
      );
      expect(curriculumRequisite.createMany).not.toHaveBeenCalled();
    });
  });

  describe('replace', () => {
    it('refuses the row own course as a requisite', async () => {
      await expect(
        service.replace('i1', { requisites: [prerequisite('B')] }, R1),
      ).rejects.toMatchObject({ code: 'REQUISITE_SELF' });
    });

    it('refuses a threshold on a corequisite', async () => {
      await expect(
        service.replace(
          'i1',
          {
            requisites: [
              {
                sourceCourseId: 'A',
                relationType: CourseRelationType.COREQUISITE,
                minScore: '2',
              },
            ],
          },
          R1,
        ),
      ).rejects.toMatchObject({ code: 'MIN_SCORE_NOT_ALLOWED' });
    });

    it('refuses the same source and type twice', async () => {
      await expect(
        service.replace(
          'i1',
          { requisites: [prerequisite('A'), prerequisite('A')] },
          R1,
        ),
      ).rejects.toMatchObject({ code: 'REQUISITE_DUPLICATE' });
    });

    it('refuses a cancelled source', async () => {
      course.findMany.mockResolvedValue([
        { id: 'A', status: CourseStatus.CANCELLED },
      ]);
      await expect(
        service.replace('i1', { requisites: [prerequisite('A')] }, R1),
      ).rejects.toMatchObject({ code: 'REQUISITE_COURSE_CANCELLED' });
    });

    it('refuses an unknown source course', async () => {
      course.findMany.mockResolvedValue([]);
      await expect(
        service.replace('i1', { requisites: [prerequisite('A')] }, R1),
      ).rejects.toMatchObject({ code: 'COURSE_NOT_FOUND' });
    });

    it('refuses a loop with this version other requisites and shows the path (KB-020)', async () => {
      // This version already says B is needed before A (A has requisite B); adding A before B closes a loop.
      curriculumRequisite.findMany.mockResolvedValue([
        { sourceCourseId: 'B', item: { courseId: 'A' } },
      ]);
      await expect(
        service.replace('i1', { requisites: [prerequisite('A')] }, R1),
      ).rejects.toMatchObject({
        code: 'REQUISITE_CYCLE',
        message: expect.stringMatching(/B → A → B\.$/),
      });
      expect(curriculumRequisite.createMany).not.toHaveBeenCalled();
    });

    it('refuses a loop closed only by the catalog', async () => {
      courseRelation.findMany.mockResolvedValue([
        { sourceCourseId: 'B', targetCourseId: 'A' },
      ]);
      await expect(
        service.replace('i1', { requisites: [prerequisite('A')] }, R1),
      ).rejects.toMatchObject({ code: 'REQUISITE_CYCLE' });
    });

    it('reads only this version requisites, so another version cannot close a loop', async () => {
      await service.replace('i1', { requisites: [prerequisite('A')] }, R1);
      expect(curriculumRequisite.findMany.mock.calls[0][0].where).toEqual({
        item: { versionId: 'v1' },
        relationType: {
          in: [CourseRelationType.PRIOR, CourseRelationType.PREREQUISITE],
        },
      });
      expect(curriculumRequisite.createMany).toHaveBeenCalledOnce();
    });

    it('refuses the second of two new edges that close a loop together', async () => {
      // A needs C; adding B <- A and then C <- B... here the row is B: A->B, then B's own second source C
      // where the catalog says B->C: the second edge is the one refused.
      courseRelation.findMany.mockResolvedValue([
        { sourceCourseId: 'B', targetCourseId: 'C' },
      ]);
      await expect(
        service.replace(
          'i1',
          { requisites: [prerequisite('A'), prerequisite('C')] },
          R1,
        ),
      ).rejects.toMatchObject({ code: 'REQUISITE_CYCLE' });
    });

    it('takes the graph lock before it reads or writes an edge', async () => {
      const order: string[] = [];
      executeRaw.mockImplementation(() => {
        order.push('lock');
        return Promise.resolve(1);
      });
      curriculumRequisite.deleteMany.mockImplementation(() => {
        order.push('delete');
        return Promise.resolve({ count: 0 });
      });
      await service.replace('i1', { requisites: [prerequisite('A')] }, R1);
      expect(order).toEqual(['lock', 'delete']);
    });

    it('removes everything for an empty list and writes nothing', async () => {
      await service.replace('i1', { requisites: [] }, R1);
      expect(curriculumRequisite.deleteMany).toHaveBeenCalledWith({
        where: { itemId: 'i1' },
      });
      expect(curriculumRequisite.createMany).not.toHaveBeenCalled();
    });

    it('does not cycle-check corequisites, which may point both ways', async () => {
      courseRelation.findMany.mockResolvedValue([]);
      curriculumRequisite.findMany.mockResolvedValue([]);
      await expect(
        service.replace(
          'i1',
          {
            requisites: [
              {
                sourceCourseId: 'A',
                relationType: CourseRelationType.COREQUISITE,
              },
            ],
          },
          R1,
        ),
      ).resolves.toBeDefined();
    });

    it('refuses R4 on a row of another group', async () => {
      await expect(
        service.replace(
          'i1',
          { requisites: [] },
          access('VIA_REQUEST', false, ['H']),
        ),
      ).rejects.toMatchObject({ code: 'OUT_OF_SCOPE' });
    });
  });
});
