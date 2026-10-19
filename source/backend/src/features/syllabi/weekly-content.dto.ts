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
import type { Prisma } from '../../generated/prisma/client.js';
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

  @ApiPropertyOptional({
    type: [String],
    description: 'CLOs of the same syllabus this week covers; omitted = keep',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(SYLLABUS_LIMITS.CLOS_MAX)
  @ArrayUnique()
  @IsString({ each: true })
  cloIds?: string[];
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
  @ApiProperty({ type: [String], description: 'In CLO order' })
  cloIds!: string[];
}

export const WEEKLY_CONTENT_INCLUDE = {
  cloLinks: { select: { cloId: true, clo: { select: { sortOrder: true } } } },
} as const satisfies Prisma.WeeklyContentInclude;
export type WeeklyContentRow = Prisma.WeeklyContentGetPayload<{
  include: typeof WEEKLY_CONTENT_INCLUDE;
}>;

export function toWeeklyContentDto(row: WeeklyContentRow): WeeklyContentDto {
  return {
    id: row.id,
    weekLabel: row.weekLabel,
    sortOrder: row.sortOrder,
    content: row.content,
    teachingActivities: row.teachingActivities,
    cloIds: [...row.cloLinks]
      .sort((a, b) => a.clo.sortOrder - b.clo.sortOrder)
      .map((link) => link.cloId),
  };
}
