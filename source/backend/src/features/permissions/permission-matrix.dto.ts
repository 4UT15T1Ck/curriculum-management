import { ApiProperty } from '@nestjs/swagger';
import {
  FunctionGroup,
  PermissionMode,
  PermissionScope,
  ScopeSource,
} from '../../generated/prisma/client.js';
import { UserRefDto } from '../../shared/dtos/ref.dto.js';
import {
  PERMISSION_CODES,
  type PermissionCode,
} from '../../shared/authz/permission-codes.js';

export class RoleDto {
  @ApiProperty() id!: string;
  @ApiProperty() roleCode!: string;
  @ApiProperty() roleName!: string;
  @ApiProperty({ type: String, nullable: true }) description!: string | null;
  @ApiProperty() isSystemRole!: boolean;
  @ApiProperty({ enum: ScopeSource }) scopeSource!: ScopeSource;
  @ApiProperty() assignable!: boolean;
}

export class PermissionDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: PERMISSION_CODES, enumName: 'PermissionCode' })
  permissionCode!: PermissionCode;
  @ApiProperty() permissionName!: string;
  @ApiProperty({ enum: FunctionGroup }) functionGroup!: FunctionGroup;
  @ApiProperty({ type: String, nullable: true }) description!: string | null;
  @ApiProperty({ type: String, nullable: true }) source!: string | null;
}

export class MatrixCellDto {
  @ApiProperty() roleCode!: string;
  @ApiProperty({ enum: PERMISSION_CODES, enumName: 'PermissionCode' })
  permissionCode!: PermissionCode;
  @ApiProperty({ enum: PermissionMode }) mode!: PermissionMode;
  @ApiProperty({ enum: PermissionScope }) scope!: PermissionScope;
  @ApiProperty({ format: 'date-time' }) updatedAt!: string;
  @ApiProperty({ type: UserRefDto, nullable: true })
  updatedBy!: UserRefDto | null;
}

export class MatrixCellKeyDto {
  @ApiProperty() roleCode!: string;
  @ApiProperty({ enum: PERMISSION_CODES, enumName: 'PermissionCode' })
  permissionCode!: PermissionCode;
}

export class PermissionMatrixDto {
  @ApiProperty({ type: [RoleDto] }) roles!: RoleDto[];
  @ApiProperty({ type: [PermissionDto] }) permissions!: PermissionDto[];
  @ApiProperty({ type: [MatrixCellDto] }) cells!: MatrixCellDto[];
  @ApiProperty({ type: [MatrixCellKeyDto] }) lockedCells!: MatrixCellKeyDto[];
}
