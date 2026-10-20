import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
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
import type { OutcomeGapsReader } from '../../shared/outcomes/outcome-gaps.reader.js';
import type { PrismaService } from '../../shared/prisma/prisma.service.js';
import {
  courseGroupFilter,
  OutcomeCoverageService,
} from './outcome-coverage.service.js';
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

const R1 = holder([
  [PERMISSIONS.OUTCOME_VIEW, 'DIRECT', 'ALL'],
  [PERMISSIONS.CLO_EDIT, 'DIRECT', 'ALL'],
]);
const R3 = holder(
  [
    [PERMISSIONS.OUTCOME_VIEW, 'DIRECT', 'ALL'],
    [PERMISSIONS.CLO_EDIT, 'VIA_REQUEST', 'SCOPED'],
  ],
  { programIds: ['pA'] },
);
const R2 = holder([[PERMISSIONS.OUTCOME_VIEW, 'DIRECT', 'ALL']]);
const R4_G1 = holder(
  [
    [PERMISSIONS.OUTCOME_VIEW, 'DIRECT', 'ALL'],
    [PERMISSIONS.CLO_EDIT, 'VIA_REQUEST', 'SCOPED'],
  ],
  { subjectGroupIds: ['g1'] },
);
const R6 = holder([[PERMISSIONS.OUTCOME_VIEW, 'DIRECT', 'SCOPED']], {
  programIds: ['pA'],
});

const gap = (itemId: string, ownerGroupId: string | null) => ({
  itemId,
  plannedSemester: 1,
  courseCode: itemId,
  courseName: itemId,
  ownerGroupId,
});

describe('OutcomeCoverageService', () => {
  const gaps = {
    forVersion: vi.fn(),
  };
  let service: OutcomeCoverageService;

  beforeEach(() => {
    gaps.forVersion.mockResolvedValue({
      plosWithoutCourse: [{ id: 'p6', ploCode: 'PLO6', description: 'd' }],
      closWithoutPlo: [
        {
          ...gap('i1', 'g1'),
          cloId: 'c1',
          cloCode: 'CLO1',
          cloDescription: 'd',
        },
        {
          ...gap('i2', 'g2'),
          cloId: 'c2',
          cloCode: 'CLO1',
          cloDescription: 'd',
        },
      ],
      coursesWithoutPlo: [gap('i1', 'g1'), gap('i2', 'g2'), gap('i3', null)],
      coursesWithoutSyllabus: [gap('i2', 'g2')],
    });
    const prisma = {
      programVersion: { findUnique: vi.fn().mockResolvedValue(VERSION) },
    };
    service = new OutcomeCoverageService(
      prisma as unknown as PrismaService,
      gaps as unknown as OutcomeGapsReader,
    );
  });

  it.each([
    ['R1', R1],
    ['R3 of the program', R3],
    ['R2 without clo.edit', R2],
  ])('shows every course to %s', async (_name, access) => {
    const result = await service.read('v1', access);

    expect(result.filteredToGroups).toBe(false);
    expect(result.coursesWithoutPlo).toHaveLength(3);
    expect(result.coursesWithoutSyllabus).toBe(1);
  });

  it('shows a group-scoped caller their group only, with the PLO gaps intact', async () => {
    const result = await service.read('v1', R4_G1);

    expect(result.filteredToGroups).toBe(true);
    expect(result.coursesWithoutPlo.map((c) => c.itemId)).toEqual(['i1']);
    expect(result.closWithoutPlo.map((c) => c.cloId)).toEqual(['c1']);
    expect(result.coursesWithoutSyllabus).toBe(0);
    expect(result.plosWithoutCourse).toHaveLength(1);
    expect(result.coursesWithoutPlo[0]).not.toHaveProperty('ownerGroupId');
  });

  it('refuses a student', async () => {
    await expect(service.read('v1', R6)).rejects.toMatchObject({
      code: 'PERMISSION_DENIED',
    });
  });

  it('courseGroupFilter returns the group ids only for group-scoped holders', () => {
    expect(courseGroupFilter(R4_G1, { programId: 'pA' })).toEqual(
      new Set(['g1']),
    );
    expect(courseGroupFilter(R3, { programId: 'pA' })).toBeNull();
    expect(courseGroupFilter(R3, { programId: 'pB' })?.size).toBe(0);
  });
});
