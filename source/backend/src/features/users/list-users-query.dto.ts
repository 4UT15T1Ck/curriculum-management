import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { UserStatus } from '../../generated/prisma/client.js';
import { PageQueryDto } from '../../shared/pagination/page-query.dto.js';
import { USER_FIELD_LIMITS } from './create-user.dto.js';

export class ListUsersQueryDto extends PageQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(USER_FIELD_LIMITS.FULL_NAME_MAX)
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orgUnitId?: string;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
