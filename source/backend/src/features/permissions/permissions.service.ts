import { Injectable, Logger } from '@nestjs/common';
import {
  PermissionMode,
  PermissionScope,
  ScopeSource,
} from '../../generated/prisma/client.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { isLockedCell, LOCKED_CELLS } from '../../shared/authz/locked-cells.js';
import { AppException } from '../../shared/exception/app.exception.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import type { PermissionCode } from '../../shared/authz/permission-codes.js';
import {
  MatrixCellDto,
  PermissionDto,
  PermissionMatrixDto,
  RoleDto,
} from './permission-matrix.dto.js';
import { PERMISSION_ERRORS } from './permissions.errors.js';
import { SetRolePermissionDto } from './set-role-permission.dto.js';

const MATRIX_CELL_SELECT = {
  mode: true,
  scope: true,
  updatedAt: true,
  role: { select: { roleCode: true } },
  permission: { select: { permissionCode: true } },
  updatedBy: { select: { id: true, fullName: true } },
} as const;

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listRoles(): Promise<RoleDto[]> {
    const rows = await this.prisma.role.findMany({
      orderBy: { roleCode: 'asc' },
    });
    return rows.map(toRoleDto);
  }

  async matrix(): Promise<PermissionMatrixDto> {
    const [roles, permissions, cells] = await Promise.all([
      this.prisma.role.findMany({ orderBy: { roleCode: 'asc' } }),
      this.prisma.permission.findMany(),
      this.prisma.rolePermission.findMany({ select: MATRIX_CELL_SELECT }),
    ]);
    return {
      roles: roles.map(toRoleDto),
      permissions: sortByCatalogOrder(permissions).map(toPermissionDto),
      cells: cells.map(toMatrixCellDto),
      lockedCells: [...LOCKED_CELLS],
    };
  }

  async setCell(
    roleCode: string,
    permissionCode: string,
    dto: SetRolePermissionDto,
    actorId: string,
  ): Promise<MatrixCellDto> {
    const { role, permission } = await this.findPair(roleCode, permissionCode);
    const compound = {
      roleId_permissionId: { roleId: role.id, permissionId: permission.id },
    };
    const before = await this.prisma.rolePermission.findUnique({
      where: compound,
    });
    if (
      isLockedCell(roleCode, permissionCode) &&
      (dto.mode !== PermissionMode.DIRECT || dto.scope !== PermissionScope.ALL)
    ) {
      throw new AppException(PERMISSION_ERRORS.MATRIX_CELL_LOCKED);
    }
    const saved = await this.prisma.rolePermission.upsert({
      where: compound,
      create: {
        roleId: role.id,
        permissionId: permission.id,
        mode: dto.mode,
        scope: dto.scope,
        updatedById: actorId,
      },
      update: {
        mode: dto.mode,
        scope: dto.scope,
        updatedById: actorId,
      },
      select: MATRIX_CELL_SELECT,
    });
    this.logger.log(
      `Matrix ${roleCode} × ${permissionCode}: ${describe(before)} → ${dto.mode}/${dto.scope} by ${actorId}`,
    );
    return toMatrixCellDto(saved);
  }

  async clearCell(
    roleCode: string,
    permissionCode: string,
    actorId: string,
  ): Promise<void> {
    if (isLockedCell(roleCode, permissionCode)) {
      throw new AppException(PERMISSION_ERRORS.MATRIX_CELL_LOCKED);
    }
    const { role, permission } = await this.findPair(roleCode, permissionCode);
    const deleted = await this.prisma.rolePermission.deleteMany({
      where: { roleId: role.id, permissionId: permission.id },
    });
    if (deleted.count > 0) {
      this.logger.log(
        `Matrix ${roleCode} × ${permissionCode}: removed by ${actorId}`,
      );
    }
  }

  private async findPair(roleCode: string, permissionCode: string) {
    const role = await this.prisma.role.findUnique({
      where: { roleCode },
    });
    if (!role) {
      throw new AppException(PERMISSION_ERRORS.ROLE_NOT_FOUND);
    }
    const permission = await this.prisma.permission.findUnique({
      where: { permissionCode },
    });
    if (!permission) {
      throw new AppException(PERMISSION_ERRORS.PERMISSION_NOT_FOUND);
    }
    return { role, permission };
  }
}

function toRoleDto(row: {
  id: string;
  roleCode: string;
  roleName: string;
  description: string | null;
  isSystemRole: boolean;
  scopeSource: ScopeSource;
}): RoleDto {
  return {
    id: row.id,
    roleCode: row.roleCode,
    roleName: row.roleName,
    description: row.description,
    isSystemRole: row.isSystemRole,
    scopeSource: row.scopeSource,
    assignable: row.scopeSource === ScopeSource.NONE,
  };
}

function toPermissionDto(row: {
  id: string;
  permissionCode: string;
  permissionName: string;
  functionGroup: PermissionDto['functionGroup'];
  description: string | null;
  source: string | null;
}): PermissionDto {
  return {
    ...row,
    permissionCode: row.permissionCode as PermissionCode,
  };
}

function toMatrixCellDto(row: {
  mode: PermissionMode;
  scope: PermissionScope;
  updatedAt: Date;
  role: { roleCode: string };
  permission: { permissionCode: string };
  updatedBy: { id: string; fullName: string } | null;
}): MatrixCellDto {
  return {
    roleCode: row.role.roleCode,
    permissionCode: row.permission.permissionCode as PermissionCode,
    mode: row.mode,
    scope: row.scope,
    updatedAt: row.updatedAt.toISOString(),
    updatedBy: row.updatedBy,
  };
}

function sortByCatalogOrder<T extends { permissionCode: string }>(
  rows: T[],
): T[] {
  const order = new Map(
    Object.values(PERMISSIONS).map((code, index) => [code, index]),
  );
  return [...rows].sort(
    (left, right) =>
      (order.get(left.permissionCode as PermissionCode) ?? 0) -
      (order.get(right.permissionCode as PermissionCode) ?? 0),
  );
}

function describe(
  before: { mode: PermissionMode; scope: PermissionScope } | null,
): string {
  return before ? `${before.mode}/${before.scope}` : 'empty';
}
