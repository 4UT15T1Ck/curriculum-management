import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { CourseRelationType } from '../../generated/prisma/client.js';
import {
  GRADE_POINT_MESSAGE,
  GRADE_POINT_PATTERN,
} from '../../shared/decimal/decimal.js';
import { emptyToNull } from '../../shared/dtos/transforms.js';

export class CreateCourseRelationDto {
  @ApiProperty() @IsString() @IsNotEmpty() sourceCourseId!: string;
  @ApiProperty() @IsString() @IsNotEmpty() targetCourseId!: string;

  @ApiProperty({ enum: CourseRelationType, enumName: 'CourseRelationType' })
  @IsEnum(CourseRelationType)
  relationType!: CourseRelationType;

  @ApiPropertyOptional({ nullable: true, type: String, example: '2' })
  @Transform(emptyToNull)
  @IsOptional()
  @IsString()
  @Matches(GRADE_POINT_PATTERN, { message: GRADE_POINT_MESSAGE })
  minScore?: string | null;
}
