import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto.js';

// courseCode is absent on purpose: the code never changes (US-012 AC4).
export class UpdateCourseDto extends PartialType(
  OmitType(CreateCourseDto, ['courseCode'] as const),
) {}
