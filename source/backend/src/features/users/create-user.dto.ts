import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { normalizeUsername } from '../../shared/auth/username.js';

export const USER_FIELD_LIMITS = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 64,
  USER_CODE_MAX: 32,
  FULL_NAME_MAX: 200,
  EMAIL_MAX: 254,
} as const;

export const USERNAME_PATTERN = /^[a-z0-9._-]+$/;

export class CreateUserDto {
  @ApiProperty()
  @Transform(({ value }) =>
    typeof value === 'string' ? normalizeUsername(value) : value,
  )
  @IsString()
  @Length(USER_FIELD_LIMITS.USERNAME_MIN, USER_FIELD_LIMITS.USERNAME_MAX)
  @Matches(USERNAME_PATTERN)
  username!: string;

  @ApiProperty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Length(1, USER_FIELD_LIMITS.USER_CODE_MAX)
  userCode!: string;

  @ApiProperty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, USER_FIELD_LIMITS.FULL_NAME_MAX)
  fullName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @MaxLength(USER_FIELD_LIMITS.EMAIL_MAX)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orgUnitId?: string;
}
