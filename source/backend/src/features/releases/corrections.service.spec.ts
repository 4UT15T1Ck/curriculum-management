import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ScopeSource, ScopeType } from '../../generated/prisma/client.js';
import {
  AccessContext,
  type ActiveAssignment,
} from '../../shared/authz/access-context.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import type { ConsistencyChecker } from '../../shared/curriculum/consistency-checker.js';
import type { PrismaService } from '../../shared/prisma/prisma.service.js';
import type { VersionContentCopier } from '../../shared/programs/version-content.copier.js';
import type { VersionActivator } from '../../shared/releases/version.activator.js';
import type { VersionPublisher } from '../../shared/releases/version.publisher.js';
import { CorrectionsService } from './corrections.service.js';
import type { VersionHistoryReader } from './version-history.reader.js';

function holder(mode: 'DIRECT' | 'VIA_REQUEST', scope: 'ALL' | 'SCOPED') {
  const assignment: ActiveAssignment = {
    assignmentId: null,
    roleId: 'r',
    roleCode: 'R',
    roleName: 'R',
    scopeSource: ScopeSource.NONE,
    scopeType: ScopeType.SYSTEM,
    scopeUnit: null,
    scope: {
      all: scope === 'ALL',
      orgUnitIds: new Set(),
      subjectGroupIds: new Set(),
      programIds: new Set(),
      studentIds: new Set(),
    },
    permissions: new Map([[PERMISSIONS.VERSION_CORRECT, { mode, scope }]]),
  };
  return new AccessContext('office', [assignment]);
}
const R1 = holder('DIRECT', 'ALL');
const R3 = holder('VIA_REQUEST', 'SCOPED');

const original = {
  id: 'v1',
  programId: 'p1',
  status: 'ACTIVE',
  versionNumber: '1.9',
  decisionNumber: 'QD-1',
  signedDate: new Date('2026-09-01T00:00:00.000Z'),
  effectiveSemesterId: 'sem',
  originRequestId: 'req',
  programName: 'CT',
  majorCode: 'M',
  majorName: 'N',
  semesterCount: 8,
  totalCredits: 150,
  compulsoryCredits: 140,
  electiveCredits: 10,
};

describe('CorrectionsService', () => {
  let calls: string[];
  let programVersion: Record<string, ReturnType<typeof vi.fn>>;
  let cohortVersion: { updateMany: ReturnType<typeof vi.fn> };
  let copier: { copy: ReturnType<typeof vi.fn> };
  let publisher: { promote: ReturnType<typeof vi.fn> };
  let activator: { activate: ReturnType<typeof vi.fn> };
  let consistency: { assertPasses: ReturnType<typeof vi.fn> };
  let history: { detail: ReturnType<typeof vi.fn> };
  let service: CorrectionsService;

  beforeEach(() => {
    calls = [];
    programVersion = {
      findFirst: vi
        .fn()
        .mockImplementation(
          ({ where }: { where: { id: string; correctionOfId?: string } }) =>
            Promise.resolve(
              where.correctionOfId
                ? {
                    id: 'd1',
                    programId: 'p1',
                    status: 'DRAFT',
                    correctionOfId: 'v1',
                  }
                : { ...original, id: where.id },
            ),
        ),
      findUnique: vi.fn().mockResolvedValue(null),
      findMany: vi
        .fn()
        .mockResolvedValue([
          { versionNumber: '1.0' },
          { versionNumber: '1.9' },
          { versionNumber: '2.0' },
          { versionNumber: null },
        ]),
      create: vi.fn().mockResolvedValue({ id: 'd1' }),
      update: vi.fn((args: { data: { status: string } }) => {
        calls.push(`original:${args.data.status}`);
        return Promise.resolve({});
      }),
      delete: vi.fn().mockResolvedValue({}),
    };
    cohortVersion = { updateMany: vi.fn().mockResolvedValue({ count: 2 }) };
    copier = { copy: vi.fn().mockResolvedValue(undefined) };
    publisher = {
      promote: vi.fn(() => {
        calls.push('promote');
        return Promise.resolve({ id: 'd1', status: 'ACTIVE' });
      }),
    };
    activator = { activate: vi.fn().mockResolvedValue(true) };
    consistency = { assertPasses: vi.fn().mockResolvedValue(undefined) };
    history = { detail: vi.fn().mockResolvedValue({ id: 'd1' }) };
    const db = {
      programVersion,
      cohortVersion,
      curriculumItem: { findMany: vi.fn().mockResolvedValue([]) },
      syllabus: { findMany: vi.fn().mockResolvedValue([]) },
      semester: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'sem',
          startDate: new Date('2026-09-07T00:00:00.000Z'),
        }),
      },
      $queryRaw: vi.fn().mockResolvedValue([]),
      $executeRaw: vi.fn().mockResolvedValue(0),
    };
    const prisma = {
      ...db,
      $transaction: vi.fn((run: (tx: unknown) => unknown) => run(db)),
    };
    service = new CorrectionsService(
      prisma as unknown as PrismaService,
      copier as unknown as VersionContentCopier,
      publisher as unknown as VersionPublisher,
      activator as unknown as VersionActivator,
      consistency as unknown as ConsistencyChecker,
      history as unknown as VersionHistoryReader,
    );
  });

  describe('create', () => {
    it('copies an Active or Pending version into a Draft that remembers what it corrects', async () => {
      await service.create('p1', 'v1', R1);

      expect(programVersion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          programId: 'p1',
          status: 'DRAFT',
          correctionOfId: 'v1',
          programName: 'CT',
        }),
        select: { id: true },
      });
      expect(copier.copy).toHaveBeenCalledWith(expect.anything(), 'v1', 'd1');
      expect(history.detail).toHaveBeenCalledWith('p1', 'd1', R1);
    });

    it('returns the correction Draft already open instead of making a second one', async () => {
      programVersion.findUnique.mockResolvedValue({
        id: 'open',
        status: 'DRAFT',
      });

      await service.create('p1', 'v1', R1);

      expect(programVersion.create).not.toHaveBeenCalled();
      expect(history.detail).toHaveBeenCalledWith('p1', 'open', R1);
    });

    it('refuses a version already corrected, a Historical or a Draft one, and a stranger to the program', async () => {
      programVersion.findUnique.mockResolvedValue({
        id: 'done',
        status: 'ACTIVE',
      });
      await expect(service.create('p1', 'v1', R1)).rejects.toMatchObject({
        code: 'VERSION_NOT_CORRECTABLE',
      });
      programVersion.findUnique.mockResolvedValue(null);
      for (const status of ['HISTORICAL', 'DRAFT']) {
        programVersion.findFirst.mockResolvedValue({ ...original, status });
        await expect(service.create('p1', 'v1', R1)).rejects.toMatchObject({
          code: 'VERSION_NOT_CORRECTABLE',
        });
      }
      programVersion.findFirst.mockResolvedValue(null);
      await expect(service.create('p1', 'v1', R1)).rejects.toMatchObject({
        code: 'PROGRAM_VERSION_NOT_FOUND',
      });
    });

    it('is for R1 only', async () => {
      await expect(service.create('p1', 'v1', R3)).rejects.toMatchObject({
        code: 'PERMISSION_DENIED',
      });
    });
  });

  describe('issue', () => {
    it('numbers the correction above the highest minor of the major, numerically, and keeps the decision and semester', async () => {
      await service.issue('p1', 'v1', 'd1', { reason: 'Sai mã học phần' }, R1);

      expect(publisher.promote).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          versionId: 'd1',
          versionNumber: '1.10',
          decisionNumber: 'QD-1',
          signedDate: original.signedDate,
          effectiveSemesterId: 'sem',
          statusOverride: 'ACTIVE',
          previousVersionId: 'v1',
          correctionOfId: 'v1',
          correctionReason: 'Sai mã học phần',
          originRequestId: 'req',
          cohortIds: [],
        }),
      );
    });

    it('retires the corrected version before the correction takes its status', async () => {
      await service.issue('p1', 'v1', 'd1', { reason: 'x' }, R1);

      expect(calls).toEqual(['original:HISTORICAL', 'promote']);
    });

    it('moves the cohorts by default and leaves them when asked to', async () => {
      await service.issue('p1', 'v1', 'd1', { reason: 'x' }, R1);
      expect(cohortVersion.updateMany).toHaveBeenCalledWith({
        where: { programVersionId: 'v1' },
        data: { programVersionId: 'd1' },
      });

      cohortVersion.updateMany.mockClear();
      await service.issue(
        'p1',
        'v1',
        'd1',
        { reason: 'x', moveCohorts: false },
        R1,
      );
      expect(cohortVersion.updateMany).not.toHaveBeenCalled();
    });

    it('keeps a Pending correction Pending and activates it at once only if its semester has begun', async () => {
      programVersion.findFirst.mockImplementation(
        ({ where }: { where: { correctionOfId?: string } }) =>
          Promise.resolve(
            where.correctionOfId
              ? {
                  id: 'd1',
                  programId: 'p1',
                  status: 'DRAFT',
                  correctionOfId: 'v1',
                }
              : { ...original, status: 'PENDING' },
          ),
      );
      publisher.promote.mockResolvedValue({ id: 'd1', status: 'PENDING' });

      await service.issue('p1', 'v1', 'd1', { reason: 'x' }, R1);

      expect(publisher.promote.mock.calls[0][1].statusOverride).toBe('PENDING');
      expect(activator.activate).toHaveBeenCalledWith(expect.anything(), 'd1');
    });

    it('does not run the activator for an Active correction', async () => {
      await service.issue('p1', 'v1', 'd1', { reason: 'x' }, R1);

      expect(activator.activate).not.toHaveBeenCalled();
    });

    it("refuses a correction Draft that is not this version's, writing nothing", async () => {
      programVersion.findFirst.mockImplementation(
        ({ where }: { where: { correctionOfId?: string } }) =>
          Promise.resolve(where.correctionOfId ? null : original),
      );

      await expect(
        service.issue('p1', 'v1', 'other', { reason: 'x' }, R1),
      ).rejects.toMatchObject({ code: 'CORRECTION_NOT_FOUND' });
      expect(publisher.promote).not.toHaveBeenCalled();
      expect(calls).toEqual([]);
    });

    it('stops on a consistency error before retiring anything', async () => {
      consistency.assertPasses.mockRejectedValue(
        new Error('CONSISTENCY_FAILED'),
      );

      await expect(
        service.issue('p1', 'v1', 'd1', { reason: 'x' }, R1),
      ).rejects.toThrow('CONSISTENCY_FAILED');
      expect(calls).toEqual([]);
    });

    it('is for R1 only', async () => {
      await expect(
        service.issue('p1', 'v1', 'd1', { reason: 'x' }, R3),
      ).rejects.toMatchObject({ code: 'PERMISSION_DENIED' });
    });
  });

  describe('discard', () => {
    it('deletes only an unissued correction Draft', async () => {
      await service.discard('p1', 'v1', 'd1', R1);
      expect(programVersion.delete).toHaveBeenCalledWith({
        where: { id: 'd1' },
      });

      programVersion.delete.mockClear();
      programVersion.findFirst.mockResolvedValue(null);
      await expect(service.discard('p1', 'v1', 'd1', R1)).rejects.toMatchObject(
        {
          code: 'CORRECTION_NOT_FOUND',
        },
      );
      expect(programVersion.delete).not.toHaveBeenCalled();
    });
  });
});
