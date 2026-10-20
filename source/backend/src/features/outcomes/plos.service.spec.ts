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
import { PlosService } from './plos.service.js';
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

// R3 of program A, R4 (no plo.edit), R6 (outcome.view scoped to own program).
const R3 = holder(
  [
    [PERMISSIONS.OUTCOME_VIEW, 'DIRECT', 'ALL'],
    [PERMISSIONS.PLO_EDIT, 'VIA_REQUEST', 'SCOPED'],
  ],
  { programIds: ['pA'] },
);
const R3_OTHER = holder([[PERMISSIONS.PLO_EDIT, 'VIA_REQUEST', 'SCOPED']], {
  programIds: ['pB'],
});
const R4 = holder([[PERMISSIONS.OUTCOME_VIEW, 'DIRECT', 'ALL']]);
const R6 = holder([[PERMISSIONS.OUTCOME_VIEW, 'DIRECT', 'SCOPED']], {
  programIds: ['pA'],
});

const plo = (id: string, sortOrder: number) => ({
  id,
  versionId: 'v1',
  ploCode: id.toUpperCase(),
  description: 'Mô tả',
  englishDescription: null,
  competencyGroup: null,
  sortOrder,
  _count: { courseMappings: 0 },
});

describe('PlosService', () => {
  let prisma: {
    programVersion: {
      findUnique: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
    };
    pLO: Record<
      'findUnique' | 'findMany' | 'count' | 'create' | 'update' | 'delete',
      ReturnType<typeof vi.fn>
    >;
    coursePLOMapping: { count: ReturnType<typeof vi.fn> };
    cLOPLOMapping: {
      count: ReturnType<typeof vi.fn>;
      groupBy: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let service: PlosService;

  beforeEach(() => {
    prisma = {
      programVersion: {
        findUnique: vi.fn().mockResolvedValue(VERSION),
        findFirst: vi.fn().mockResolvedValue(null),
      },
      pLO: {
        findUnique: vi
          .fn()
          .mockResolvedValue({ id: 'p1', versionId: 'v1', version: VERSION }),
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
        create: vi.fn(({ data }: { data: { sortOrder: number } }) =>
          Promise.resolve(plo('new', data.sortOrder)),
        ),
        update: vi.fn().mockResolvedValue(plo('p1', 1)),
        delete: vi.fn().mockResolvedValue({}),
      },
      coursePLOMapping: { count: vi.fn().mockResolvedValue(0) },
      cLOPLOMapping: {
        count: vi.fn().mockResolvedValue(0),
        groupBy: vi.fn().mockResolvedValue([]),
      },
      $transaction: vi.fn(),
    };
    prisma.$transaction.mockImplementation((run: (tx: unknown) => unknown) =>
      run(prisma),
    );
    service = new PlosService(prisma as unknown as PrismaService);
  });

  const input = { ploCode: 'PLO1', description: 'Áp dụng kiến thức' };

  it('appends the PLO last', async () => {
    prisma.pLO.count.mockResolvedValue(2);

    const created = await service.create('v1', input, R3);

    expect(prisma.pLO.create.mock.calls[0][0].data).toMatchObject({
      versionId: 'v1',
      ploCode: 'PLO1',
      sortOrder: 3,
      englishDescription: null,
      competencyGroup: null,
    });
    expect(created).toMatchObject({ courseCount: 0, cloLinkCount: 0 });
  });

  it('maps a duplicate code to PLO_CODE_TAKEN on ploCode', async () => {
    prisma.pLO.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: 'x',
      }),
    );

    await expect(service.create('v1', input, R3)).rejects.toMatchObject({
      code: 'PLO_CODE_TAKEN',
      details: [{ field: 'ploCode' }],
    });
  });

  it('refuses the 31st PLO', async () => {
    prisma.pLO.count.mockResolvedValue(30);

    await expect(service.create('v1', input, R3)).rejects.toMatchObject({
      code: 'PLOS_LIMIT',
    });
  });

  it("keeps a program out of reach of another program's R3", async () => {
    await expect(service.create('v1', input, R3_OTHER)).rejects.toMatchObject({
      code: 'OUT_OF_SCOPE',
    });
  });

  it('refuses a holder of outcome.view only', async () => {
    await expect(service.create('v1', input, R4)).rejects.toMatchObject({
      code: 'PERMISSION_DENIED',
    });
  });

  it('freezes a version that has left Draft', async () => {
    prisma.programVersion.findUnique.mockResolvedValue({
      ...VERSION,
      status: ProgramVersionStatus.ACTIVE,
    });

    await expect(service.create('v1', input, R3)).rejects.toMatchObject({
      code: 'VERSION_NOT_EDITABLE',
    });
  });

  it('asks for a change request on the Draft of a released program', async () => {
    prisma.programVersion.findFirst.mockResolvedValue({ id: 'old' });

    await expect(service.create('v1', input, R3)).rejects.toMatchObject({
      code: 'CHANGE_REQUEST_REQUIRED',
    });
  });

  it('is not found for an unknown version or PLO', async () => {
    prisma.programVersion.findUnique.mockResolvedValue(null);
    await expect(service.list('nope', R3)).rejects.toMatchObject({
      code: 'PROGRAM_VERSION_NOT_FOUND',
    });
    prisma.pLO.findUnique.mockResolvedValue(null);
    await expect(service.remove('nope', R3)).rejects.toMatchObject({
      code: 'PLO_NOT_FOUND',
    });
  });

  describe('list', () => {
    it('carries the usage counts and the edit access', async () => {
      prisma.pLO.findMany.mockResolvedValue([
        { ...plo('p1', 1), _count: { courseMappings: 3 } },
      ]);
      prisma.cLOPLOMapping.groupBy.mockResolvedValue([
        { ploId: 'p1', _count: { _all: 5 } },
      ]);

      const result = await service.list('v1', R3);

      expect(result.plos[0]).toMatchObject({ courseCount: 3, cloLinkCount: 5 });
      expect(result).toMatchObject({ editPath: 'DIRECT', canEdit: true });
    });

    it('lets a student read their own program read-only', async () => {
      const result = await service.list('v1', R6);

      expect(result).toMatchObject({ editPath: null, canEdit: false });
    });

    it('keeps a student out of another program', async () => {
      prisma.programVersion.findUnique.mockResolvedValue({
        ...VERSION,
        program: { id: 'pB', facultyId: 'f1', programCode: 'B' },
      });

      await expect(service.list('v1', R6)).rejects.toMatchObject({
        code: 'OUT_OF_SCOPE',
      });
    });
  });

  it('closes the gap after a delete', async () => {
    prisma.pLO.findMany.mockResolvedValue([{ id: 'a' }, { id: 'c' }]);

    await service.remove('p1', R3);

    expect(prisma.pLO.update.mock.calls.map(([arg]) => arg)).toEqual([
      { where: { id: 'a' }, data: { sortOrder: 1 } },
      { where: { id: 'c' }, data: { sortOrder: 2 } },
    ]);
  });

  it('refuses a reorder with a foreign id and writes nothing', async () => {
    prisma.pLO.findMany.mockResolvedValueOnce([{ id: 'a' }, { id: 'b' }]);

    await expect(
      service.reorder('v1', { ids: ['a', 'z'] }, R3),
    ).rejects.toMatchObject({ code: 'OUTCOME_ORDER_MISMATCH' });
    expect(prisma.pLO.update).not.toHaveBeenCalled();
  });
});
