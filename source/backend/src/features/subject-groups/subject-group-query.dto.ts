import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SubjectGroupStatus } from '../../generated/prisma/client.js';

export class SubjectGroupQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  facultyId?: string;

  @ApiPropertyOptional({
    enum: SubjectGroupStatus,
    enumName: 'SubjectGroupStatus',
  })
  @IsOptional()
  @IsEnum(SubjectGroupStatus)
  status?: SubjectGroupStatus;
}
