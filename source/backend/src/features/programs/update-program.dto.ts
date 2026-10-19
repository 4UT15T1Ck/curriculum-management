import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProgramDto } from './create-program.dto.js';

// programCode and facultyId are absent on purpose: the code never changes, and the faculty is fixed at creation.
export class UpdateProgramDto extends PartialType(
  OmitType(CreateProgramDto, ['programCode', 'facultyId'] as const),
) {}
