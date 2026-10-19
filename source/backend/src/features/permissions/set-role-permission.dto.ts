import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import {
  PermissionMode,
  PermissionScope,
} from '../../generated/prisma/client.js';

export class SetRolePermissionDto {
  @ApiProperty({ enum: PermissionMode })
  @IsEnum(PermissionMode)
  mode!: PermissionMode;

  @ApiProperty({ enum: PermissionScope })
  @IsEnum(PermissionScope)
  scope!: PermissionScope;
}
