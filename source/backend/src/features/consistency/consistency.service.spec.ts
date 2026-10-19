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
} from '../../shared/authz/access-context.js';
import {
  PERMISSIONS,
  type PermissionCode,
} from '../../shared/authz/permission-codes.js';
import type {
  ConsistencyChecker,
  ConsistencyResult,
} from '../../shared/curriculum/consistency-checker.js';
import type { PrismaService } from '../../shared/prisma/prisma.service.js';
import { ConsistencyService } from './consistency.service.js';

function access(
  cells: Array<{ code: PermissionCode; all?: boolean }>,
  programIds: string[] = [],
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
      programIds: new Set(programIds),
      studentIds: new Set(),
    },
    permissions: new Map(
      cells.map((cell) => [
        cell.code,
        { mode: 'DIRECT', scope: cell.all ? 'ALL' : 'SCOPED' },
      ]),
    ),
  };
  return new AccessContext('user-1', [assignment]);
}

const R1 = access([
  { code: PERMISSIONS.PROGRAM_VIEW, all: true },
  { code: PERMISSIONS.PROGRAM_EDIT_INFO, all: true },
]);
const R2 = access([{ code: PERMISSIONS.PROGRAM_VIEW, all: true }]);
const R3_OTHER = access(
  [{ code: PERMISSIONS.PROGRAM_VIEW }, { code: PERMISSIONS.PROGRAM_EDIT_INFO }],
  ['other'],
);

const dec = (value: string) => new Prisma.Decimal(value);
const breakdown = (compulsory: string, elective: string, total: string) => ({
  compulsory: dec(compulsory),
  elective: dec(elective),
  total: dec(total),
});

function result(
  patch: {
    status?: ProgramVersionStatus;
    mismatch?: boolean;
    gap?: [string, string];
  } = {},
): ConsistencyResult {
  const [compulsoryGap, electiveGap] = patch.gap ?? ['-2', '0'];
  return {
    version: {
      id: 'v1',
      programId: 'p1',
      versionNumber: null,
      status: patch.status ?? ProgramVersionStatus.DRAFT,
      programName: 'Chương trình',
      semesterCount: 8,
      totalCredits: dec('150'),
      compulsoryCredits: dec('100'),
      electiveCredits: dec('50'),
      program: { id: 'p1', facultyId: 'f1', programCode: '1024034' },
      creditMismatchReason: null,
      creditMismatchCompulsoryGap: null,
      creditMismatchElectiveGap: null,
      creditMismatchAcceptedAt: null,
      creditMismatchAcceptedBy: null,
      sourceRequest: null,
    },
    credits: {
      declared: breakdown('100', '50', '150'),
      computed: breakdown('98', '50', '148'),
      gap: breakdown(compulsoryGap, electiveGap, '-2'),
      mismatch: patch.mismatch ?? true,
      acceptance: null,
      acceptanceCurrent: false,
    },
    groups: [],
    issues: [],
  };
}

describe('ConsistencyService', () => {
  let checker: { check: ReturnType<typeof vi.fn> };
  let programVersion: { updateMany: ReturnType<typeof vi.fn> };
  let service: ConsistencyService;
  const dto = {
    reason: 'Theo quyết định',
    compulsoryGap: '-2',
    electiveGap: '0',
  };

  beforeEach(() => {
    checker = { check: vi.fn().mockResolvedValue(result()) };
    programVersion = { updateMany: vi.fn().mockResolvedValue({ count: 1 }) };
    service = new ConsistencyService(
      { programVersion } as unknown as PrismaService,
      checker as unknown as ConsistencyChecker,
    );
  });

  it('refuses a report outside the caller scope', async () => {
    await expect(service.report('v1', R3_OTHER)).rejects.toMatchObject({
      code: 'OUT_OF_SCOPE',
    });
  });

  it('lets R2 read but not accept on a Draft', async () => {
    const report = await service.report('v1', R2);
    expect(report.canAcceptMismatch).toBe(false);
    expect(report.passes).toBe(true);
  });

  it('lets R1 accept on a Draft', async () => {
    expect((await service.report('v1', R1)).canAcceptMismatch).toBe(true);
  });

  it('refuses to accept on a version that is not a Draft', async () => {
    checker.check.mockResolvedValue(
      result({ status: ProgramVersionStatus.ACTIVE }),
    );
    await expect(service.acceptMismatch('v1', dto, R1)).rejects.toMatchObject({
      code: 'VERSION_NOT_EDITABLE',
    });
  });

  it('refuses to accept when nothing mismatches', async () => {
    checker.check.mockResolvedValue(result({ mismatch: false }));
    await expect(service.acceptMismatch('v1', dto, R1)).rejects.toMatchObject({
      code: 'NO_CREDIT_MISMATCH',
    });
  });

  it('refuses gaps that moved since the user looked (D6)', async () => {
    checker.check.mockResolvedValue(result({ gap: ['-5', '0'] }));
    await expect(service.acceptMismatch('v1', dto, R1)).rejects.toMatchObject({
      code: 'CREDIT_GAP_CHANGED',
    });
    expect(programVersion.updateMany).not.toHaveBeenCalled();
  });

  it('refuses an accepter without program.editInfo on the program', async () => {
    await expect(
      service.acceptMismatch('v1', dto, R3_OTHER),
    ).rejects.toMatchObject({ code: 'OUT_OF_SCOPE' });
  });

  it('stores the current gaps and the accepter, then returns the report', async () => {
    const report = await service.acceptMismatch('v1', dto, R1);

    const call = programVersion.updateMany.mock.calls[0][0];
    expect(call.where).toEqual({
      id: 'v1',
      status: ProgramVersionStatus.DRAFT,
    });
    expect(call.data).toMatchObject({
      creditMismatchReason: 'Theo quyết định',
      creditMismatchAcceptedById: 'user-1',
    });
    expect(call.data.creditMismatchCompulsoryGap.toString()).toBe('-2');
    expect(report.version.id).toBe('v1');
  });

  it('answers 409 when the version left Draft meanwhile', async () => {
    programVersion.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.acceptMismatch('v1', dto, R1)).rejects.toMatchObject({
      code: 'VERSION_NOT_EDITABLE',
    });
  });
});
