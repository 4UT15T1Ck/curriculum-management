import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ProgramStatus,
  ScopeSource,
  ScopeType,
  UserStatus,
} from '../../generated/prisma/client.js';
import {
  AccessContext,
  type ActiveAssignment,
} from '../../shared/authz/access-context.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { fromIsoDay } from '../../shared/time/today.js';
import type { AssignDirectorDto } from './assign-director.dto.js';
import { ProgramDirectorsService } from './program-directors.service.js';

const START = fromIsoDay('2026-01-01');
const ROW = {
  id: 'row',
  programId: 'p1',
  validFrom: START,
  validTo: null,
  revokedAt: null,
  director: { id: 'u1', fullName: 'Giám đốc' },
  assignedBy: null,
  revokedBy: null,
};
const DTO = {
  directorId: 'u1',
  validFrom: '2026-01-01',
} satisfies AssignDirectorDto;

function viewer(all: boolean): AccessContext {
  const assignment: ActiveAssignment = {
    assignmentId: null,
    roleId: 'r',
    roleCode: 'R',
    roleName: 'R',
    scopeSource: ScopeSource.NONE,
    scopeType: ScopeType.SYSTEM,
    scopeUnit: null,
    scope: { all: true },
    permissions: new Map(
      all ? [[PERMISSIONS.PROGRAM_VIEW, { mode: 'DIRECT', scope: 'ALL' }]] : [],
    ),
  };
  return new AccessContext('user', [assignment]);
}

describe('ProgramDirectorsService', () => {
  let program: ReturnType<typeof vi.fn>;
  let user: ReturnType<typeof vi.fn>;
  let findFirst: ReturnType<typeof vi.fn>;
  let findMany: ReturnType<typeof vi.fn>;
  let create: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let service: ProgramDirectorsService;

  beforeEach(() => {
    program = vi.fn().mockResolvedValue({
      id: 'p1',
      facultyId: 'f',
      status: ProgramStatus.ACTIVE,
    });
    user = vi.fn().mockResolvedValue({ status: UserStatus.ACTIVE });
    findFirst = vi.fn().mockResolvedValue(null);
    findMany = vi.fn().mockResolvedValue([ROW]);
    create = vi
      .fn()
      .mockImplementation(({ data }) => Promise.resolve({ ...ROW, ...data }));
    update = vi
      .fn()
      .mockImplementation(({ where, data }) =>
        Promise.resolve({ ...ROW, id: where.id, ...data }),
      );
    service = new ProgramDirectorsService({
      program: { findUnique: program },
      user: { findUnique: user },
      programDirectorAssignment: { findFirst, findMany, create, update },
    } as unknown as PrismaService);
  });

  describe('list', () => {
    it('returns every row with its state, newest start first', async () => {
      const rows = await service.list('p1', viewer(true));
      expect(findMany.mock.calls[0][0]).toMatchObject({
        where: { programId: 'p1' },
        orderBy: [{ validFrom: 'desc' }, { createdAt: 'desc' }],
      });
      expect(rows[0]).toMatchObject({
        id: 'row',
        validFrom: '2026-01-01',
        validTo: null,
        state: 'ACTIVE',
      });
    });

    it('is not found for an unknown program and denied without program.view', async () => {
      program.mockResolvedValueOnce(null);
      await expect(service.list('x', viewer(true))).rejects.toMatchObject({
        code: 'PROGRAM_NOT_FOUND',
      });
      await expect(service.list('p1', viewer(false))).rejects.toMatchObject({
        code: 'PERMISSION_DENIED',
      });
    });
  });

  describe('assign', () => {
    it('rejects an unknown or inactive program', async () => {
      program.mockResolvedValueOnce(null);
      await expect(service.assign('p1', DTO, 'admin')).rejects.toMatchObject({
        code: 'PROGRAM_NOT_FOUND',
      });
      program.mockResolvedValueOnce({ status: ProgramStatus.INACTIVE });
      await expect(service.assign('p1', DTO, 'admin')).rejects.toMatchObject({
        code: 'PROGRAM_INACTIVE',
      });
    });

    it('rejects a disabled or unknown user', async () => {
      user.mockResolvedValueOnce({ status: UserStatus.DISABLED });
      await expect(service.assign('p1', DTO, 'admin')).rejects.toMatchObject({
        code: 'DIRECTOR_INVALID',
      });
      user.mockResolvedValueOnce(null);
      await expect(service.assign('p1', DTO, 'admin')).rejects.toMatchObject({
        code: 'DIRECTOR_INVALID',
      });
    });

    it('rejects an invalid period', async () => {
      await expect(
        service.assign('p1', { ...DTO, validTo: '2025-12-31' }, 'admin'),
      ).rejects.toMatchObject({ code: 'VALIDITY_INVALID' });
    });

    it('rejects a period that overlaps the same person on the same program', async () => {
      findFirst.mockResolvedValueOnce({ id: 'other' });
      await expect(service.assign('p1', DTO, 'admin')).rejects.toMatchObject({
        code: 'DIRECTOR_PERIOD_OVERLAP',
      });
      expect(findFirst.mock.calls[0][0].where).toMatchObject({
        programId: 'p1',
        directorId: 'u1',
        revokedAt: null,
      });
      expect(create).not.toHaveBeenCalled();
    });

    it('creates a row for a second person over the same dates (US-020 AC3)', async () => {
      const created = await service.assign('p1', DTO, 'admin');
      expect(create.mock.calls[0][0].data).toMatchObject({
        programId: 'p1',
        directorId: 'u1',
        validFrom: START,
        validTo: null,
        assignedById: 'admin',
      });
      expect(created.state).toBe('ACTIVE');
    });
  });

  describe('end', () => {
    beforeEach(() => {
      findFirst.mockResolvedValue({
        id: 'row',
        validFrom: START,
        validTo: null,
      });
    });

    it('shortens an open row', async () => {
      await service.end('p1', 'row', { validTo: '2026-06-30' }, 'admin');
      expect(update.mock.calls[0][0]).toMatchObject({
        where: { id: 'row' },
        data: { validTo: fromIsoDay('2026-06-30') },
      });
    });

    it('rejects an end before the start', async () => {
      await expect(
        service.end('p1', 'row', { validTo: '2025-12-31' }, 'admin'),
      ).rejects.toMatchObject({ code: 'VALIDITY_INVALID' });
    });

    it('rejects an end that does not shorten the row', async () => {
      findFirst.mockResolvedValue({
        id: 'row',
        validFrom: START,
        validTo: fromIsoDay('2026-06-30'),
      });
      await expect(
        service.end('p1', 'row', { validTo: '2026-07-31' }, 'admin'),
      ).rejects.toMatchObject({ code: 'END_DATE_NOT_EARLIER' });
      await expect(
        service.end('p1', 'row', { validTo: '2026-06-30' }, 'admin'),
      ).rejects.toMatchObject({ code: 'END_DATE_NOT_EARLIER' });
      expect(update).not.toHaveBeenCalled();
    });

    it('cannot end a revoked or foreign row', async () => {
      findFirst.mockResolvedValue(null);
      await expect(
        service.end('p1', 'row', { validTo: '2026-06-30' }, 'admin'),
      ).rejects.toMatchObject({ code: 'DIRECTOR_ASSIGNMENT_NOT_FOUND' });
    });
  });

  describe('revoke', () => {
    it('marks a live row revoked by the actor', async () => {
      findFirst.mockResolvedValue({
        id: 'row',
        validFrom: START,
        validTo: null,
      });
      const revoked = await service.revoke('p1', 'row', 'admin');
      expect(findFirst.mock.calls[0][0].where).toEqual({
        id: 'row',
        programId: 'p1',
        revokedAt: null,
      });
      expect(update.mock.calls[0][0].data).toMatchObject({
        revokedById: 'admin',
      });
      expect(revoked.state).toBe('REVOKED');
    });

    it('treats a revoked row as not found', async () => {
      await expect(service.revoke('p1', 'row', 'admin')).rejects.toMatchObject({
        code: 'DIRECTOR_ASSIGNMENT_NOT_FOUND',
      });
    });
  });
});
