import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ScopeSource, ScopeType } from '../../generated/prisma/client.js';
import { ScopeService } from '../../shared/authz/scope.service.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { CreateRoleAssignmentDto } from './create-role-assignment.dto.js';
import { VALIDITY_STATE, validityState } from '../../shared/time/validity.js';
import { COMMON_ERRORS } from '../../shared/exception/error-codes.js';
import { RoleAssignmentsService } from './role-assignments.service.js';

const DATE = new Date('2026-10-18T00:00:00.000Z');

describe('role assignment state', () => {
  it('computes all states, with an end date today still active', () => {
    expect(
      validityState({ validFrom: DATE, validTo: DATE, revokedAt: null }, DATE),
    ).toBe(VALIDITY_STATE.ACTIVE);
    expect(
      validityState(
        { validFrom: new Date('2026-10-19'), validTo: null, revokedAt: null },
        DATE,
      ),
    ).toBe(VALIDITY_STATE.SCHEDULED);
    expect(
      validityState(
        {
          validFrom: new Date('2026-10-01'),
          validTo: new Date('2026-10-17'),
          revokedAt: null,
        },
        DATE,
      ),
    ).toBe(VALIDITY_STATE.EXPIRED);
    expect(
      validityState({ validFrom: DATE, validTo: null, revokedAt: DATE }, DATE),
    ).toBe(VALIDITY_STATE.REVOKED);
  });
});

describe('RoleAssignmentsService', () => {
  let assignmentFindMany: ReturnType<typeof vi.fn>;
  let assignmentFindFirst: ReturnType<typeof vi.fn>;
  let assignmentCreate: ReturnType<typeof vi.fn>;
  let assignmentUpdate: ReturnType<typeof vi.fn>;
  let roleFindUnique: ReturnType<typeof vi.fn>;
  let orgUnitFindUnique: ReturnType<typeof vi.fn>;
  let loadAccess: ReturnType<typeof vi.fn>;
  let service: RoleAssignmentsService;

  beforeEach(() => {
    assignmentFindMany = vi.fn().mockResolvedValue([]);
    assignmentFindFirst = vi.fn().mockResolvedValue(null);
    assignmentCreate = vi.fn();
    assignmentUpdate = vi.fn();
    roleFindUnique = vi.fn().mockResolvedValue({
      id: 'role-1',
      roleCode: 'R2',
      scopeSource: ScopeSource.NONE,
    });
    orgUnitFindUnique = vi.fn().mockResolvedValue({ id: 'unit-1' });
    loadAccess = vi.fn().mockResolvedValue({ assignments: [] });
    const prisma = {
      roleAssignment: {
        findMany: assignmentFindMany,
        findFirst: assignmentFindFirst,
        create: assignmentCreate,
        update: assignmentUpdate,
      },
      role: { findUnique: roleFindUnique },
      orgUnit: { findUnique: orgUnitFindUnique },
    } as unknown as PrismaService;
    service = new RoleAssignmentsService(prisma, {
      loadAccess,
    } as unknown as ScopeService);
  });

  const dto = (overrides: Partial<CreateRoleAssignmentDto> = {}) =>
    ({
      roleId: 'role-1',
      scopeType: ScopeType.SYSTEM,
      validFrom: '2026-10-18',
      ...overrides,
    }) as CreateRoleAssignmentDto;

  it('rejects assignment-based roles', async () => {
    roleFindUnique.mockResolvedValue({
      id: 'derived',
      scopeSource: ScopeSource.PROGRAM_DIRECTOR,
    });
    await expect(
      service.assign('target', dto(), 'actor'),
    ).rejects.toMatchObject({ code: 'ROLE_NOT_ASSIGNABLE' });
  });

  it('rejects missing and unknown UNIT scopes', async () => {
    await expect(
      service.assign('target', dto({ scopeType: ScopeType.UNIT }), 'actor'),
    ).rejects.toMatchObject({ code: 'SCOPE_INVALID' });
    orgUnitFindUnique.mockResolvedValue(null);
    await expect(
      service.assign(
        'target',
        dto({ scopeType: ScopeType.UNIT, scopeUnitId: 'missing' }),
        'actor',
      ),
    ).rejects.toMatchObject({ code: 'SCOPE_INVALID' });
  });

  it('rejects reversed validity periods', async () => {
    await expect(
      service.assign(
        'target',
        dto({ validFrom: '2026-10-19', validTo: '2026-10-18' }),
        'actor',
      ),
    ).rejects.toMatchObject({ code: COMMON_ERRORS.VALIDITY_INVALID.code });
  });

  it('checks overlap for the same unit scope but ignores revoked assignments', async () => {
    assignmentFindFirst.mockResolvedValue({ id: 'overlap' });
    await expect(
      service.assign(
        'target',
        dto({ scopeType: ScopeType.UNIT, scopeUnitId: 'unit-1' }),
        'actor',
      ),
    ).rejects.toMatchObject({ code: 'ASSIGNMENT_OVERLAP' });
    expect(assignmentFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          revokedAt: null,
          scopeUnitId: 'unit-1',
        }),
      }),
    );
  });

  it('prevents self role changes and repeated revocation', async () => {
    await expect(service.assign('actor', dto(), 'actor')).rejects.toMatchObject(
      { code: 'CANNOT_CHANGE_OWN_ROLES' },
    );
    await expect(
      service.revoke('actor', 'assignment', 'actor'),
    ).rejects.toMatchObject({ code: 'CANNOT_CHANGE_OWN_ROLES' });
    assignmentFindFirst.mockResolvedValue({
      id: 'assignment',
      revokedAt: DATE,
    });
    await expect(
      service.revoke('target', 'assignment', 'actor'),
    ).rejects.toMatchObject({ code: 'ASSIGNMENT_ALREADY_REVOKED' });
  });
});
