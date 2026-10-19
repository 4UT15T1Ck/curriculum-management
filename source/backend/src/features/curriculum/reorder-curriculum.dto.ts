import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsString,
  Min,
} from 'class-validator';
import { CURRICULUM_LIMITS } from './create-curriculum-item.dto.js';

export class ReorderCurriculumDto {
  @ApiProperty({ minimum: CURRICULUM_LIMITS.SEMESTER_MIN })
  @Type(() => Number)
  @IsInt()
  @Min(CURRICULUM_LIMITS.SEMESTER_MIN)
  plannedSemester!: number;

  @ApiProperty({
    type: [String],
    description: 'Mọi dòng của học kỳ, theo thứ tự mới.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(CURRICULUM_LIMITS.ITEMS_MAX)
  @ArrayUnique()
  @IsString({ each: true })
  itemIds!: string[];
}
