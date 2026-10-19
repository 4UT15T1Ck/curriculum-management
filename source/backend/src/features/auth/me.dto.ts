import { ApiProperty } from '@nestjs/swagger';
import type { AuthenticatedUser } from '../../shared/auth/authenticated-user.js';
import { ScopeType } from '../../generated/prisma/client.js';
import {
  PERMISSION_CODES,
  type PermissionCode,
} from '../../shared/authz/permission-codes.js';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { OrgUnitRefDto } from '../../shared/dtos/ref.dto.js';

export class MeRoleDto {
  @ApiProperty() roleCode: string;
  @ApiProperty() roleName: string;
  @ApiProperty({ enum: ScopeType }) scopeType: ScopeType;
  @ApiProperty({ type: OrgUnitRefDto, nullable: true })
  scopeUnit: OrgUnitRefDto | null;
  @ApiProperty() derived: boolean;
}

export class MeDto {
  @ApiProperty() id: string;
  @ApiProperty() username: string;
  @ApiProperty() userCode: string;
  @ApiProperty() fullName: string;
  @ApiProperty({ type: String, nullable: true }) email: string | null;
  @ApiProperty() mustChangePassword: boolean;
  @ApiProperty({ type: OrgUnitRefDto, nullable: true })
  orgUnit: OrgUnitRefDto | null;
  @ApiProperty({ type: [MeRoleDto] }) roles: MeRoleDto[];
  @ApiProperty({
    enum: PERMISSION_CODES,
    isArray: true,
    enumName: 'PermissionCode',
  })
  permissions: PermissionCode[];
}

export function toMeDto(
  user: AuthenticatedUser,
  orgUnit: OrgUnitRefDto | null,
  access: AccessContext,
): MeDto {
  return {
    id: user.id,
    username: user.username,
    userCode: user.userCode,
    fullName: user.fullName,
    email: user.email,
    mustChangePassword: user.mustChangePassword,
    orgUnit,
    roles: access.assignments.map((assignment) => ({
      roleCode: assignment.roleCode,
      roleName: assignment.roleName,
      scopeType: assignment.scopeType,
      scopeUnit: assignment.scopeUnit,
      derived: assignment.assignmentId === null,
    })),
    permissions: access.heldPermissions(),
  };
}
