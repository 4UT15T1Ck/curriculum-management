import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { SubjectGroupMemberRole } from '../../generated/prisma/client.js';
import { ISO_DAY_LENGTH } from '../../shared/time/today.js';

export class AddSubjectGroupMemberDto {
  @ApiProperty()
  @IsString()
  lecturerId!: string;

  @ApiProperty({
    enum: SubjectGroupMemberRole,
    enumName: 'SubjectGroupMemberRole',
  })
  @IsEnum(SubjectGroupMemberRole)
  memberRole!: SubjectGroupMemberRole;

  @ApiProperty({ format: 'date' })
  @IsISO8601({ strict: true })
  @Length(ISO_DAY_LENGTH, ISO_DAY_LENGTH)
  validFrom!: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsISO8601({ strict: true })
  @Length(ISO_DAY_LENGTH, ISO_DAY_LENGTH)
  validTo?: string;
}
