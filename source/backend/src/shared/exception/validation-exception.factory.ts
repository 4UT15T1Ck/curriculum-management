import type { ValidationError } from 'class-validator';
import type { FieldErrorDto } from '../dtos/error-response.dto.js';
import { AppException } from './app.exception.js';
import { COMMON_ERRORS } from './error-codes.js';

export function validationExceptionFactory(
  errors: ValidationError[],
): AppException {
  return new AppException(
    COMMON_ERRORS.VALIDATION_FAILED,
    toFieldErrors(errors),
  );
}

function toFieldErrors(
  errors: ValidationError[],
  parent?: string,
): FieldErrorDto[] {
  return errors.flatMap((error) => {
    const field = parent ? `${parent}.${error.property}` : error.property;
    const own = error.constraints
      ? [{ field, constraints: Object.keys(error.constraints) }]
      : [];
    return [...own, ...toFieldErrors(error.children ?? [], field)];
  });
}
