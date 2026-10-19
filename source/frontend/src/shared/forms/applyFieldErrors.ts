import type { FormInstance } from 'antd';
import { ApiError } from '../api/client';

const VALIDATION_FAILED = 'VALIDATION_FAILED';

// Puts a server error under the fields it names. Returns false when the error names none,
// so the caller can show it as a message instead.
// Business errors (duplicate code, wrong owner group) carry the sentence in `message`;
// class-validator failures carry constraint keys only, which the form's own rules already word.
export function applyFieldErrors<Values>(
  form: FormInstance<Values>,
  error: unknown,
): boolean {
  if (
    !(error instanceof ApiError) ||
    !error.details?.length ||
    error.code === VALIDATION_FAILED
  )
    return false;
  form.setFields(
    error.details.map((detail) => ({
      name: detail.field as never,
      errors: [error.message],
    })),
  );
  return true;
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}
