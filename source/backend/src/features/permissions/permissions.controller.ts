import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../shared/auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../../shared/auth/authenticated-user.js';
import { RequirePermission } from '../../shared/authz/require-permission.decorator.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import {
  MatrixCellDto,
  PermissionMatrixDto,
  RoleDto,
} from './permission-matrix.dto.js';
import { PermissionsService } from './permissions.service.js';
import { SetRolePermissionDto } from './set-role-permission.dto.js';

@ApiTags('permissions')
@ApiCookieAuth()
@Controller()
export class PermissionsController {
  constructor(private readonly permissions: PermissionsService) {}

  @Get('roles')
  @RequirePermission(PERMISSIONS.USER_MANAGE, PERMISSIONS.PERMISSION_VIEW)
  @ApiOkResponse({ type: [RoleDto] })
  roles(): Promise<RoleDto[]> {
    return this.permissions.listRoles();
  }

  @Get('permissions/matrix')
  @RequirePermission(PERMISSIONS.PERMISSION_VIEW)
  @ApiOkResponse({ type: PermissionMatrixDto })
  matrix(): Promise<PermissionMatrixDto> {
    return this.permissions.matrix();
  }

  @Put('roles/:roleCode/permissions/:permissionCode')
  @RequirePermission(PERMISSIONS.PERMISSION_MANAGE)
  @ApiOkResponse({ type: MatrixCellDto })
  setCell(
    @Param('roleCode') roleCode: string,
    @Param('permissionCode') permissionCode: string,
    @Body() dto: SetRolePermissionDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<MatrixCellDto> {
    return this.permissions.setCell(roleCode, permissionCode, dto, actor.id);
  }

  @Delete('roles/:roleCode/permissions/:permissionCode')
  @RequirePermission(PERMISSIONS.PERMISSION_MANAGE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  clearCell(
    @Param('roleCode') roleCode: string,
    @Param('permissionCode') permissionCode: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<void> {
    return this.permissions.clearCell(roleCode, permissionCode, actor.id);
  }
}
