import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsISO8601,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { trimString } from '../dtos/transforms.js';
import { ISO_DAY_LENGTH } from '../time/today.js';

export const DECISION_NUMBER_MAX = 100;

// The decision and the semester, as typed on MH-43 and MH-45 (shared by final approval).
export class ReleaseDecisionDto {
  @ApiProperty({ example: 'QĐ-123/ĐHBK' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(DECISION_NUMBER_MAX)
  decisionNumber!: string;

  @ApiProperty({ format: 'date' })
  @IsISO8601({ strict: true })
  @Length(ISO_DAY_LENGTH, ISO_DAY_LENGTH)
  signedDate!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  effectiveSemesterId!: string;
}
