import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateProgramDto } from './create-program.dto.js';

export class CloneProgramDto extends PickType(CreateProgramDto, [
  'programCode',
  'programName',
] as const) {
  @ApiPropertyOptional({
    description: 'Phiên bản nguồn; mặc định là phiên bản hiện hành.',
  })
  @IsOptional()
  @IsString()
  sourceVersionId?: string;
}
