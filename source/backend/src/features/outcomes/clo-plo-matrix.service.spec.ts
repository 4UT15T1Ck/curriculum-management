import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Prisma,
  ProgramVersionStatus,
  ScopeSource,
  ScopeType,
} from '../../generated/prisma/client.js';
import {
  AccessContext,
  type ActiveAssignment,
  type PermissionGrant,
} from '../../shared/authz/access-context.js';
import {
  PERMISSIONS,
  type PermissionCode,
} from '../../shared/authz/permission-codes.js';
import { SyllabusStatus } from '../../generated/prisma/client.js';
import type { PrismaService } from '../../shared/prisma/prisma.service.js';
import { CloPloMatrixService } from './clo-plo-matrix.service.js';
type Grant = [PermissionCode, 'DIRECT' | 'VIA_REQUEST', 'ALL' | 'SCOPED'];

function holder(
  grants: Grant[],
  scope: {
    programIds?: string[];
    orgUnitIds?: string[];
    subjectGroupIds?: string[];
  } = {},
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
      orgUnitIds: new Set(scope.orgUnitIds),
      subjectGroupIds: new Set(scope.subjectGroupIds),
      programIds: new Set(scope.programIds),
      studentIds: new Set(),
    },
    permissions: new Map<PermissionCode, PermissionGrant>(
      grants.map(([code, mode, grantScope]) => [
        code,
        { mode, scope: grantScope },
      ]),
    ),
  };
  return new AccessContext('user', [assignment]);
}

const VERSION = {
  id: 'v1',
  status: ProgramVersionStatus.DRAFT,
  versionNumber: null,
  programName: 'CTĐT A',
  programId: 'pA',
  program: { id: 'pA', facultyId: 'f1', programCode: 'A' },
};

const R3 = holder(
  [
    [PERMISSIONS.OUTCOME_VIEW, 'DIRECT', 'ALL'],
    [PERMISSIONS.CLO_EDIT, 'VIA_REQUEST', 'SCOPED'],
  ],
  { programIds: ['pA'] },
);
const R5_G1 = holder(
  [
    [PERMISSIONS.OUTCOME_VIEW, 'DIRECT', 'ALL'],
    [PERMISSIONS.CLO_EDIT, 'VIA_REQUEST', 'SCOPED'],
  ],
  { subjectGroupIds: ['g1'] },
);
const R6 = holder([[PERMISSIONS.OUTCOME_VIEW, 'DIRECT', 'SCOPED']], {
  programIds: ['pA'],
});

const ITEM = {
  id: 'i1',
  versionId: 'v1',
  plannedSemester: 1,
  course: {
    id: 'c1',
    courseCode: 'IT001',
    courseName: 'Nhập môn',
    ownerGroupId: 'g1',
  },
  version: VERSION,
};

const clo = (id: string) => ({
  id,
  cloCode: id.toUpperCase(),
  description: 'Mô tả',
  englishDescription: null,
});

describe('CloPloMatrixService', () => {
  let prisma: {
    programVersion: {
      findUnique: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
    };
    curriculumItem: {
      findUnique: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
    syllabus: { findMany: ReturnType<typeof vi.fn> };
    cLO: { findMany: ReturnType<typeof vi.fn> };
    pLO: { findMany: ReturnType<typeof vi.fn> };
    coursePLOMapping: { findMany: ReturnType<typeof vi.fn> };
    cLOPLOMapping: {
      findMany: ReturnType<typeof vi.fn>;
      deleteMany: ReturnType<typeof vi.fn>;
      createMany: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let service: CloPloMatrixService;

  beforeEach(() => {
    prisma = {
      programVersion: {
        findUnique: vi.fn().mockResolvedValue(VERSION),
        findFirst: vi.fn().mockResolvedValue(null),
      },
      curriculumItem: {
        findUnique: vi.fn().mockResolvedValue(ITEM),
        findMany: vi.fn().mockResolvedValue([]),
      },
      syllabus: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 's1',
            courseId: 'c1',
            revisionNumber: 1,
            status: SyllabusStatus.PUBLISHED,
          },
        ]),
      },
      cLO: { findMany: vi.fn().mockResolvedValue([clo('c1'), clo('c2')]) },
      pLO: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'p2', ploCode: 'PLO2', description: 'd' },
          { id: 'p3', ploCode: 'PLO3', description: 'd' },
        ]),
      },
      coursePLOMapping: {
        findMany: vi
          .fn()
          .mockResolvedValue([
            { ploId: 'p2', weight: new Prisma.Decimal('0.50') },
          ]),
      },
      cLOPLOMapping: {
        findMany: vi.fn().mockResolvedValue([]),
        deleteMany: vi.fn().mockReturnValue('delete'),
        createMany: vi.fn().mockReturnValue('create'),
      },
      $transaction: vi.fn().mockResolvedValue([]),
    };
    service = new CloPloMatrixService(prisma as unknown as PrismaService);
  });

  describe('forItem', () => {
    it('marks only the PLOs the course maps', async () => {
      const result = await service.forItem('i1', R3);

      expect(result.plos).toEqual([
        { id: 'p2', ploCode: 'PLO2', description: 'd', weight: '0.5' },
        { id: 'p3', ploCode: 'PLO3', description: 'd', weight: null },
      ]);
      expect(result.revision).toMatchObject({ id: 's1', status: 'PUBLISHED' });
      expect(result.canEdit).toBe(true);
    });

    it('answers an empty, read-only grid for a course without a syllabus', async () => {
      prisma.syllabus.findMany.mockResolvedValue([]);

      const result = await service.forItem('i1', R3);

      expect(result).toMatchObject({
        revision: null,
        clos: [],
        canEdit: false,
      });
      expect(prisma.cLO.findMany).not.toHaveBeenCalled();
    });

    it('refuses a student', async () => {
      await expect(service.forItem('i1', R6)).rejects.toMatchObject({
        code: 'PERMISSION_DENIED',
      });
    });
  });

  describe('replaceLinks', () => {
    it('stores a link on a mapped PLO', async () => {
      await service.replaceLinks(
        'i1',
        { links: [{ cloId: 'c1', ploId: 'p2' }] },
        R3,
      );

      expect(prisma.cLOPLOMapping.createMany).toHaveBeenCalledWith({
        data: [{ curriculumItemId: 'i1', cloId: 'c1', ploId: 'p2' }],
      });
      expect(prisma.cLOPLOMapping.deleteMany).toHaveBeenCalledWith({
        where: { curriculumItemId: 'i1' },
      });
    });

    it('refuses a PLO the course does not map and writes nothing', async () => {
      await expect(
        service.replaceLinks(
          'i1',
          { links: [{ cloId: 'c1', ploId: 'p3' }] },
          R3,
        ),
      ).rejects.toMatchObject({ code: 'PLO_NOT_MAPPED_TO_COURSE' });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('refuses a CLO of another course', async () => {
      await expect(
        service.replaceLinks(
          'i1',
          { links: [{ cloId: 'other', ploId: 'p2' }] },
          R3,
        ),
      ).rejects.toMatchObject({ code: 'CLO_NOT_IN_REVISION' });
    });

    it('stores duplicate pairs once', async () => {
      await service.replaceLinks(
        'i1',
        {
          links: [
            { cloId: 'c1', ploId: 'p2' },
            { cloId: 'c1', ploId: 'p2' },
          ],
        },
        R3,
      );

      expect(
        prisma.cLOPLOMapping.createMany.mock.calls[0][0].data,
      ).toHaveLength(1);
    });

    it('lets an R5 of the course group edit, and not of another group', async () => {
      await expect(
        service.replaceLinks('i1', { links: [] }, R5_G1),
      ).resolves.toBeDefined();
      prisma.curriculumItem.findUnique.mockResolvedValue({
        ...ITEM,
        course: { ...ITEM.course, ownerGroupId: 'g2' },
      });
      await expect(
        service.replaceLinks('i1', { links: [] }, R5_G1),
      ).rejects.toMatchObject({ code: 'OUT_OF_SCOPE' });
    });

    it('maps a foreign key violation to PLO_NOT_MAPPED_TO_COURSE', async () => {
      prisma.$transaction.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('fk', {
          code: 'P2003',
          clientVersion: 'x',
        }),
      );

      await expect(
        service.replaceLinks(
          'i1',
          { links: [{ cloId: 'c1', ploId: 'p2' }] },
          R3,
        ),
      ).rejects.toMatchObject({ code: 'PLO_NOT_MAPPED_TO_COURSE' });
    });

    it('asks for a change request on the Draft of a released program', async () => {
      prisma.programVersion.findFirst.mockResolvedValue({ id: 'old' });

      await expect(
        service.replaceLinks('i1', { links: [] }, R3),
      ).rejects.toMatchObject({ code: 'CHANGE_REQUEST_REQUIRED' });
    });
  });

  it('builds the program-wide rows from the course revisions', async () => {
    prisma.curriculumItem.findMany.mockResolvedValue([
      {
        id: 'i1',
        plannedSemester: 1,
        course: { id: 'c1', courseCode: 'IT001', courseName: 'A' },
      },
      {
        id: 'i2',
        plannedSemester: 2,
        course: { id: 'c2', courseCode: 'IT002', courseName: 'B' },
      },
    ]);
    prisma.cLO.findMany.mockResolvedValue([{ ...clo('c1'), syllabusId: 's1' }]);
    prisma.coursePLOMapping.findMany.mockResolvedValue([
      { curriculumItemId: 'i1', ploId: 'p2' },
    ]);
    prisma.cLOPLOMapping.findMany.mockResolvedValue([
      { curriculumItemId: 'i1', cloId: 'c1', ploId: 'p2' },
    ]);

    const result = await service.forVersion('v1', R3);

    expect(result.rows[0]).toMatchObject({
      itemId: 'i1',
      revisionNumber: 1,
      mappedPloIds: ['p2'],
      links: [{ cloId: 'c1', ploId: 'p2' }],
    });
    expect(result.rows[0].clos.map((c) => c.id)).toEqual(['c1']);
    expect(result.rows[1]).toMatchObject({
      revisionNumber: null,
      clos: [],
      mappedPloIds: [],
    });
  });
});
