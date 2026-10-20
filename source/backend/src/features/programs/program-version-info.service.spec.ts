import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ChangeRequestStatus,
  DegreeLevel,
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
import {
  PERMISSIONS,
  type PermissionCode,
} from '../../shared/authz/permission-codes.js';
import type { CurriculumFactsReader } from '../../shared/curriculum/curriculum-facts.reader.js';
import type { PrismaService } from '../../shared/prisma/prisma.service.js';
import { ProgramVersionInfoService } from './program-version-info.service.js';

function access(
  userId: string,
  grants: [PermissionCode, PermissionMode][],
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
      subjectGroupIds: new Set(),
      programIds: new Set(['p1']),
      studentIds: new Set(),
    },
    permissions: new Map(
      grants.map(([code, mode]) => [code, { mode, scope: 'SCOPED' as const }]),
    ),
  };
  return new AccessContext(userId, [assignment]);
}

const DIRECTOR = access('creator', [
  [PERMISSIONS.PROGRAM_VIEW, 'DIRECT'],
  [PERMISSIONS.PROGRAM_EDIT_INFO, 'DIRECT'],
]);

const copyRow = (patch: object = {}) => ({
  id: 'v-copy',
  versionNumber: null,
  status: ProgramVersionStatus.DRAFT,
  programName: 'KTMT',
  majorCode: 'M1',
  majorName: 'KTMT',
  semesterCount: 10,
  totalCredits: new Prisma.Decimal('150'),
  compulsoryCredits: new Prisma.Decimal('140'),
  electiveCredits: new Prisma.Decimal('10'),
  updatedAt: new Date('2026-10-19T00:00:00Z'),
  programId: 'p1',
  program: {
    id: 'p1',
    facultyId: 'f1',
    programCode: '1024034',
    degreeLevel: DegreeLevel.ENGINEER,
  },
  sourceRequest: {
    id: 'cr1',
    requestCode: 'DX-2026-0001',
    status: ChangeRequestStatus.DRAFT,
    createdById: 'creator',
  },
  ...patch,
});

describe('ProgramVersionInfoService', () => {
  const prisma = {
    programVersion: {
      findUnique: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  };
  const facts = { maxPlannedSemester: vi.fn().mockResolvedValue(null) };
  let service: ProgramVersionInfoService;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma.programVersion.findUnique.mockResolvedValue(copyRow());
    prisma.programVersion.updateMany.mockResolvedValue({ count: 1 });
    facts.maxPlannedSemester.mockResolvedValue(null);
    service = new ProgramVersionInfoService(
      prisma as unknown as PrismaService,
      facts as unknown as CurriculumFactsReader,
    );
  });

  it('reads a copy with its request and tells the creator they can edit', async () => {
    const info = await service.read('v-copy', DIRECTOR);
    expect(info).toMatchObject({
      id: 'v-copy',
      totalCredits: '150',
      canEdit: true,
      sourceRequest: { id: 'cr1' },
      program: { programCode: '1024034' },
    });
    const colleague = access('other', [
      [PERMISSIONS.PROGRAM_VIEW, 'DIRECT'],
      [PERMISSIONS.PROGRAM_EDIT_INFO, 'DIRECT'],
    ]);
    expect((await service.read('v-copy', colleague)).canEdit).toBe(false);
  });

  it('writes the version fields of a copy, only while it is a Draft', async () => {
    await service.update('v-copy', { programName: 'Tên mới' }, DIRECTOR);
    expect(prisma.programVersion.updateMany).toHaveBeenCalledWith({
      where: { id: 'v-copy', status: ProgramVersionStatus.DRAFT },
      data: expect.objectContaining({ programName: 'Tên mới' }),
    });
  });

  it('refuses another user, a submitted request and a version that left Draft', async () => {
    const colleague = access('other', [
      [PERMISSIONS.PROGRAM_VIEW, 'DIRECT'],
      [PERMISSIONS.PROGRAM_EDIT_INFO, 'DIRECT'],
    ]);
    await expect(
      service.update('v-copy', { programName: 'X' }, colleague),
    ).rejects.toMatchObject({
      code: 'REQUEST_NOT_CREATOR',
    });
    prisma.programVersion.findUnique.mockResolvedValue(
      copyRow({
        sourceRequest: {
          id: 'cr1',
          requestCode: 'DX',
          status: ChangeRequestStatus.PENDING_COORDINATOR,
          createdById: 'creator',
        },
      }),
    );
    await expect(
      service.update('v-copy', { programName: 'X' }, DIRECTOR),
    ).rejects.toMatchObject({
      code: 'REQUEST_NOT_DRAFT',
    });
    prisma.programVersion.findUnique.mockResolvedValue(
      copyRow({ status: ProgramVersionStatus.ACTIVE }),
    );
    await expect(
      service.update('v-copy', { programName: 'X' }, DIRECTOR),
    ).rejects.toMatchObject({
      code: 'PROGRAM_VERSION_NOT_EDITABLE',
    });
    expect(prisma.programVersion.updateMany).not.toHaveBeenCalled();
  });

  it('keeps the credit sum and semester coverage rules of the program form', async () => {
    await expect(
      service.update('v-copy', { electiveCredits: '12' }, DIRECTOR),
    ).rejects.toMatchObject({ code: 'CREDITS_MISMATCH' });
    facts.maxPlannedSemester.mockResolvedValue(8);
    await expect(
      service.update('v-copy', { semesterCount: 7 }, DIRECTOR),
    ).rejects.toMatchObject({ code: 'SEMESTERS_BELOW_CURRICULUM' });
    expect(prisma.programVersion.updateMany).not.toHaveBeenCalled();
  });

  it('answers 404 for an unknown version', async () => {
    prisma.programVersion.findUnique.mockResolvedValue(null);
    await expect(service.read('x', DIRECTOR)).rejects.toMatchObject({
      code: 'PROGRAM_VERSION_NOT_FOUND',
    });
  });
});
