import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { normalizeUsername } from '../../shared/auth/username.js';
import {
  PASSWORD_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
} from '../../shared/password/password-policy.js';

export class LoginDto {
  @ApiProperty()
  @Transform(({ value }) =>
    typeof value === 'string' ? normalizeUsername(value) : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(USERNAME_MAX_LENGTH)
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;
}
