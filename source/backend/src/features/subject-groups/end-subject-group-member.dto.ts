import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, Length } from 'class-validator';
import { ISO_DAY_LENGTH } from '../../shared/time/today.js';

export class EndSubjectGroupMemberDto {
  @ApiProperty({ format: 'date' })
  @IsISO8601({ strict: true })
  @Length(ISO_DAY_LENGTH, ISO_DAY_LENGTH)
  validTo!: string;
}
