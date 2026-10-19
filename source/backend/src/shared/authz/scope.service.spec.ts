import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  OrgUnitStatus,
  PermissionMode,
  PermissionScope,
  ScopeSource,
  ScopeType,
} from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ScopeService } from './scope.service.js';
import { ScopeSourceReader } from './scope-source.reader.js';

const permissionRows = [
  {
    mode: PermissionMode.DIRECT,
    scope: PermissionScope.SCOPED,
    permission: { permissionCode: 'course.view' },
  },
];

describe('ScopeService', () => {
  let roleAssignmentFindMany: ReturnType<typeof vi.fn>;
  let roleFindMany: ReturnType<typeof vi.fn>;
  let orgUnitFindMany: ReturnType<typeof vi.fn>;
  let service: ScopeService;
  let sourceReader: ScopeSourceReader;

  beforeEach(() => {
    roleAssignmentFindMany = vi.fn().mockResolvedValue([]);
    roleFindMany = vi.fn().mockResolvedValue([]);
    orgUnitFindMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      roleAssignment: { findMany: roleAssignmentFindMany },
      role: { findMany: roleFindMany },
      orgUnit: { findMany: orgUnitFindMany },
      subjectGroupMember: { findMany: vi.fn().mockResolvedValue([]) },
    } as unknown as PrismaService;
    sourceReader = new ScopeSourceReader(prisma);
    service = new ScopeService(prisma, sourceReader);
  });

  it('queries only active, unrevoked assignments', async () => {
    await service.loadAccess('user-1');

    expect(roleAssignmentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user-1',
          revokedAt: null,
          validFrom: { lte: expect.any(Date) },
          OR: [{ validTo: null }, { validTo: { gte: expect.any(Date) } }],
        }),
      }),
    );
  });

  it('expands a UNIT assignment to active descendants and itself', async () => {
    roleAssignmentFindMany.mockResolvedValue([
      {
        id: 'assignment-1',
        scopeType: ScopeType.UNIT,
        scopeUnit: { id: 'faculty', unitCode: 'F', unitName: 'Faculty' },
        role: {
          id: 'role-1',
          roleCode: 'R2',
          roleName: 'R2',
          scopeSource: ScopeSource.NONE,
          rolePermissions: permissionRows,
        },
      },
    ]);
    orgUnitFindMany.mockResolvedValue([
      { id: 'faculty', parentUnitId: null },
      { id: 'department', parentUnitId: 'faculty' },
      { id: 'office', parentUnitId: 'department' },
    ]);
    const access = await service.loadAccess('user-1');

    expect(access.assignments[0].scope).toMatchObject({
      all: false,
      orgUnitIds: new Set(['faculty', 'department', 'office']),
    });
    expect(orgUnitFindMany).toHaveBeenCalledWith({
      where: { status: OrgUnitStatus.ACTIVE },
      select: { id: true, parentUnitId: true },
    });
  });

  it('resolves SYSTEM assignments to all scope', async () => {
    roleAssignmentFindMany.mockResolvedValue([
      {
        id: 'assignment-1',
        scopeType: ScopeType.SYSTEM,
        scopeUnit: null,
        role: {
          id: 'role-1',
          roleCode: 'R1',
          roleName: 'R1',
          scopeSource: ScopeSource.NONE,
          rolePermissions: permissionRows,
        },
      },
    ]);

    const access = await service.loadAccess('user-1');

    expect(access.assignments[0].scope).toEqual({ all: true });
    expect(orgUnitFindMany).not.toHaveBeenCalled();
  });

  it('omits derived roles when their sources return no targets', async () => {
    roleFindMany.mockResolvedValue([
      {
        id: 'role-derived',
        roleCode: 'R4',
        roleName: 'R4',
        scopeSource: ScopeSource.SUBJECT_GROUP_COORDINATOR,
        rolePermissions: permissionRows,
      },
    ]);

    const access = await service.loadAccess('user-1');

    expect(access.assignments).toHaveLength(0);
    expect(roleFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { scopeSource: { not: ScopeSource.NONE } },
      }),
    );
  });
});
