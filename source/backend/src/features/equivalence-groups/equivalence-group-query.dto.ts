import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { trimString } from '../../shared/dtos/transforms.js';
import { PageQueryDto } from '../../shared/pagination/page-query.dto.js';
import { EQUIVALENCE_LIMITS } from './create-equivalence-group.dto.js';

export class EquivalenceGroupQueryDto extends PageQueryDto {
  @ApiPropertyOptional({
    maxLength: EQUIVALENCE_LIMITS.QUERY_MAX,
    description: 'Mã nhóm hoặc mã học phần của một thành viên',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(EQUIVALENCE_LIMITS.QUERY_MAX)
  q?: string;
}
