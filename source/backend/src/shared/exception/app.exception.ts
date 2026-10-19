import { HttpException } from '@nestjs/common';
import type { FieldErrorDto } from '../dtos/error-response.dto.js';
import type { ErrorDefinition } from './error-definition.js';

export class AppException extends HttpException {
  readonly code: string;
  readonly details?: FieldErrorDto[];

  constructor(definition: ErrorDefinition, details?: FieldErrorDto[]) {
    super(definition.message, definition.status);
    this.code = definition.code;
    this.details = details;
  }
}
