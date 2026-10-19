import type { HttpStatus } from '@nestjs/common';

export interface ErrorDefinition {
  status: HttpStatus;
  code: string;
  message: string;
}
