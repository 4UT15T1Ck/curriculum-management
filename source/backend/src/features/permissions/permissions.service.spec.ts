import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PermissionMode,
  PermissionScope,
} from '../../generated/prisma/client.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { PermissionsService } from './permissions.service.js';

describe('PermissionsService', () => {
  let roleFindMany: ReturnType<typeof vi.fn>;
  let roleFindUnique: ReturnType<typeof vi.fn>;
  let permissionFindMany: ReturnType<typeof vi.fn>;
  let permissionFindUnique: ReturnType<typeof vi.fn>;
  let cellFindMany: ReturnType<typeof vi.fn>;
  let cellFindUnique: ReturnType<typeof vi.fn>;
  let cellUpsert: ReturnType<typeof vi.fn>;
  let cellDeleteMany: ReturnType<typeof vi.fn>;
  let service: PermissionsService;

  beforeEach(() => {
    roleFindMany = vi.fn().mockResolvedValue([]);
    roleFindUnique = vi
      .fn()
      .mockResolvedValue({ id: 'role-2', roleCode: 'R2' });
    permissionFindMany = vi.fn().mockResolvedValue([]);
    permissionFindUnique = vi.fn().mockResolvedValue({ id: 'permission-1' });
    cellFindMany = vi.fn().mockResolvedValue([]);
    cellFindUnique = vi.fn().mockResolvedValue(null);
    cellUpsert = vi.fn();
    cellDeleteMany = vi.fn().mockResolvedValue({ count: 0 });
    const prisma = {
      role: { findMany: roleFindMany, findUnique: roleFindUnique },
      permission: {
        findMany: permissionFindMany,
        findUnique: permissionFindUnique,
      },
      rolePermission: {
        findMany: cellFindMany,
        findUnique: cellFindUnique,
        upsert: cellUpsert,
        deleteMany: cellDeleteMany,
      },
    } as unknown as PrismaService;
    service = new PermissionsService(prisma);
  });

  it('orders matrix permissions by the canonical catalog order', async () => {
    permissionFindMany.mockResolvedValue([
      {
        id: 'p2',
        permissionCode: PERMISSIONS.USER_MANAGE,
        permissionName: 'users',
        functionGroup: 'SYSTEM_ADMIN',
        description: null,
        source: null,
      },
      {
        id: 'p1',
        permissionCode: PERMISSIONS.ORG_UNIT_MANAGE,
        permissionName: 'units',
        functionGroup: 'SYSTEM_ADMIN',
        description: null,
        source: null,
      },
    ]);

    const result = await service.matrix();

    expect(
      result.permissions.map((permission) => permission.permissionCode),
    ).toEqual([PERMISSIONS.ORG_UNIT_MANAGE, PERMISSIONS.USER_MANAGE]);
  });

  it('refuses changing a locked cell away from DIRECT/ALL', async () => {
    roleFindUnique.mockResolvedValue({ id: 'role-1', roleCode: 'R1' });
    permissionFindUnique.mockResolvedValue({ id: 'p1' });

    await expect(
      service.setCell(
        'R1',
        PERMISSIONS.USER_MANAGE,
        { mode: PermissionMode.VIA_REQUEST, scope: PermissionScope.ALL },
        'actor',
      ),
    ).rejects.toMatchObject({ code: 'MATRIX_CELL_LOCKED' });
    expect(cellUpsert).not.toHaveBeenCalled();
  });

  it('refuses clearing locked cells', async () => {
    await expect(
      service.clearCell('R1', PERMISSIONS.PERMISSION_MANAGE, 'actor'),
    ).rejects.toMatchObject({ code: 'MATRIX_CELL_LOCKED' });
    expect(roleFindUnique).not.toHaveBeenCalled();
    expect(cellDeleteMany).not.toHaveBeenCalled();
  });

  it('returns 404 errors for unknown role and permission', async () => {
    roleFindUnique.mockResolvedValue(null);
    await expect(
      service.setCell(
        'MISSING',
        PERMISSIONS.USER_MANAGE,
        {
          mode: PermissionMode.DIRECT,
          scope: PermissionScope.ALL,
        },
        'actor',
      ),
    ).rejects.toMatchObject({ code: 'ROLE_NOT_FOUND' });
    roleFindUnique.mockResolvedValue({ id: 'role-2', roleCode: 'R2' });
    permissionFindUnique.mockResolvedValue(null);
    await expect(
      service.setCell(
        'R2',
        'unknown.permission',
        {
          mode: PermissionMode.DIRECT,
          scope: PermissionScope.ALL,
        },
        'actor',
      ),
    ).rejects.toMatchObject({ code: 'PERMISSION_NOT_FOUND' });
  });

  it('clears a missing matrix cell without writing', async () => {
    await expect(
      service.clearCell('R2', PERMISSIONS.COURSE_VIEW, 'actor'),
    ).resolves.toBeUndefined();
    expect(cellDeleteMany).toHaveBeenCalled();
  });
});
