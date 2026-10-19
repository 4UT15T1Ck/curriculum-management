import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { trimString } from '../../shared/dtos/transforms.js';
import { SYLLABUS_LIMITS } from './syllabus.errors.js';

export class CreateWeeklyContentDto {
  @ApiProperty({ example: 'Tuần 1' })
  @Transform(trimString)
  @IsString()
  @Length(1, SYLLABUS_LIMITS.WEEK_LABEL_MAX)
  weekLabel!: string;

  @ApiProperty({ description: 'HTML; sanitized on save' })
  @IsString()
  @MaxLength(SYLLABUS_LIMITS.RICH_TEXT_MAX)
  content!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(SYLLABUS_LIMITS.RICH_TEXT_MAX)
  teachingActivities?: string | null;
}

export class UpdateWeeklyContentDto extends PartialType(
  CreateWeeklyContentDto,
) {}

export class ReorderWeeklyContentsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(SYLLABUS_LIMITS.WEEKLY_ROWS_MAX)
  @ArrayUnique()
  @IsString({ each: true })
  ids!: string[];
}

export class WeeklyContentDto {
  @ApiProperty() id!: string;
  @ApiProperty() weekLabel!: string;
  @ApiProperty({ description: '1-based, contiguous' }) sortOrder!: number;
  @ApiProperty({ description: 'Sanitized HTML' }) content!: string;
  @ApiProperty({ nullable: true, type: String })
  teachingActivities!: string | null;
}

export function toWeeklyContentDto(row: {
  id: string;
  weekLabel: string;
  sortOrder: number;
  content: string;
  teachingActivities: string | null;
}): WeeklyContentDto {
  return {
    id: row.id,
    weekLabel: row.weekLabel,
    sortOrder: row.sortOrder,
    content: row.content,
    teachingActivities: row.teachingActivities,
  };
}
