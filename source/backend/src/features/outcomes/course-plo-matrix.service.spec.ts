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
import type { PrismaService } from '../../shared/prisma/prisma.service.js';
import { WEIGHT_PATTERN } from './course-plo-matrix.dto.js';
import { CoursePloMatrixService } from './course-plo-matrix.service.js';
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
    [PERMISSIONS.PLO_EDIT, 'VIA_REQUEST', 'SCOPED'],
  ],
  { programIds: ['pA'] },
);
const R2 = holder([[PERMISSIONS.OUTCOME_VIEW, 'DIRECT', 'ALL']]);
const R4 = holder([[PERMISSIONS.OUTCOME_VIEW, 'DIRECT', 'ALL']]);
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
    ownerGroupId: null,
  },
  version: VERSION,
};

describe('CoursePloMatrixService', () => {
  let prisma: {
    programVersion: {
      findUnique: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
    };
    curriculumItem: {
      findUnique: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
    pLO: {
      findUnique: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
    coursePLOMapping: Record<
      'findMany' | 'upsert' | 'deleteMany',
      ReturnType<typeof vi.fn>
    >;
    cLOPLOMapping: { groupBy: ReturnType<typeof vi.fn> };
  };
  let service: CoursePloMatrixService;

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
      pLO: {
        findUnique: vi.fn().mockResolvedValue({ versionId: 'v1' }),
        findMany: vi.fn().mockResolvedValue([]),
      },
      coursePLOMapping: {
        findMany: vi.fn().mockResolvedValue([]),
        upsert: vi.fn().mockResolvedValue({
          ploId: 'p1',
          weight: new Prisma.Decimal('0.50'),
          _count: { cloLinks: 2 },
        }),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      cLOPLOMapping: { groupBy: vi.fn().mockResolvedValue([]) },
    };
    service = new CoursePloMatrixService(prisma as unknown as PrismaService);
  });

  it('stores the weight and returns it as a wire decimal with its link count', async () => {
    const cell = await service.setWeight('i1', 'p1', { weight: '0.5' }, R3);

    expect(cell).toEqual({ ploId: 'p1', weight: '0.5', cloLinkCount: 2 });
    const call = prisma.coursePLOMapping.upsert.mock.calls[0][0];
    expect(call.where).toEqual({
      curriculumItemId_ploId: { curriculumItemId: 'i1', ploId: 'p1' },
    });
    expect(call.update.weight.toString()).toBe('0.5');
  });

  it('refuses a PLO of another version', async () => {
    prisma.pLO.findUnique.mockResolvedValue({ versionId: 'other' });

    await expect(
      service.setWeight('i1', 'p1', { weight: '0.5' }, R3),
    ).rejects.toMatchObject({ code: 'PLO_NOT_IN_VERSION' });
    expect(prisma.coursePLOMapping.upsert).not.toHaveBeenCalled();
  });

  it('refuses a holder without plo.edit', async () => {
    await expect(
      service.setWeight('i1', 'p1', { weight: '0.5' }, R4),
    ).rejects.toMatchObject({ code: 'PERMISSION_DENIED' });
  });

  it('answers CELL_NOT_FOUND when clearing a missing cell', async () => {
    prisma.coursePLOMapping.deleteMany.mockResolvedValue({ count: 0 });

    await expect(service.removeWeight('i1', 'p1', R3)).rejects.toMatchObject({
      code: 'COURSE_PLO_CELL_NOT_FOUND',
    });
  });

  describe('read', () => {
    it('refuses a student even for their own program', async () => {
      await expect(service.read('v1', R6)).rejects.toMatchObject({
        code: 'PERMISSION_DENIED',
      });
    });

    it('lets a read-only staff role see the matrix without editing', async () => {
      const result = await service.read('v1', R2);

      expect(result).toMatchObject({ editPath: null, canEdit: false });
    });

    it('returns cells with their CLO link counts', async () => {
      prisma.curriculumItem.findMany.mockResolvedValue([
        {
          id: 'i1',
          plannedSemester: 1,
          course: {
            id: 'c1',
            courseCode: 'IT001',
            courseName: 'Nhập môn',
            credits: new Prisma.Decimal('3.0'),
          },
        },
      ]);
      prisma.coursePLOMapping.findMany.mockResolvedValue([
        {
          curriculumItemId: 'i1',
          ploId: 'p1',
          weight: new Prisma.Decimal('1.00'),
        },
      ]);
      prisma.cLOPLOMapping.groupBy.mockResolvedValue([
        { curriculumItemId: 'i1', ploId: 'p1', _count: { _all: 4 } },
      ]);

      const result = await service.read('v1', R3);

      expect(result.rows[0].course.credits).toBe('3');
      expect(result.rows[0].cells).toEqual([
        { ploId: 'p1', weight: '1', cloLinkCount: 4 },
      ]);
      expect(result.canEdit).toBe(true);
    });
  });

  it.each(['0.01', '0.5', '0.55', '1', '1.0', '1.00'])(
    'accepts %s',
    (value) => {
      expect(WEIGHT_PATTERN.test(value)).toBe(true);
    },
  );

  it.each([
    '0',
    '0.0',
    '0.00',
    '1.5',
    '1.01',
    '0.555',
    '.5',
    '',
    'abc',
    '-0.5',
    '2',
  ])('refuses %s', (value) => {
    expect(WEIGHT_PATTERN.test(value)).toBe(false);
  });
});
