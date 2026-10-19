import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  MinLength,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

const NODE_ENVS = ['development', 'test', 'production'] as const;
const MAX_PORT = 65535;
const SESSION_SECRET_MIN_LENGTH = 32;
const DEFAULT_SESSION_IDLE_MINUTES = 60;
const DEFAULT_FILES_ROOT = 'files';
const DEFAULT_ATTACHMENT_MAX_MB = 20;

// Keep the explicit types: implicit conversion reads design:type, which is Object for an unannotated property,
// so a numeric variable would stay a string and fail @IsInt.
export class Env {
  @IsIn(NODE_ENVS)
  NODE_ENV: (typeof NODE_ENVS)[number] = 'development';

  @IsInt()
  @Min(1)
  @Max(MAX_PORT)
  PORT: number = 3000;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  REDIS_HOST: string = 'localhost';

  @IsInt()
  @Min(1)
  @Max(MAX_PORT)
  REDIS_PORT: number = 6379;

  @IsString()
  @MinLength(SESSION_SECRET_MIN_LENGTH)
  SESSION_SECRET: string;

  @IsInt()
  @Min(1)
  SESSION_IDLE_MINUTES: number = DEFAULT_SESSION_IDLE_MINUTES;

  // Attachment folder: relative to the working directory or absolute; back it up with the database.
  @IsString()
  @IsNotEmpty()
  FILES_ROOT: string = DEFAULT_FILES_ROOT;

  @IsInt()
  @Min(1)
  ATTACHMENT_MAX_MB: number = DEFAULT_ATTACHMENT_MAX_MB;
}

export function validateEnv(raw: Record<string, unknown>): Env {
  const env = plainToInstance(Env, raw, { enableImplicitConversion: true });
  const errors = validateSync(env);
  if (errors.length > 0) {
    const details = errors.flatMap((error) =>
      Object.values(error.constraints ?? {}),
    );
    throw new Error(`Invalid environment: ${details.join('; ')}`);
  }
  return env;
}
