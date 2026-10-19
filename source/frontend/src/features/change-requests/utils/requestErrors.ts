import type { FormInstance } from 'antd';
import { ApiError } from '../../../shared/api/client';
import { applyFieldErrors } from '../../../shared/forms/applyFieldErrors';
import {
  FIELD_BY_CODE,
  type RequestHeaderValues,
} from '../schema/requestRules';

// A refusal that names a field goes under it; the known business codes (target not released, basis missing)
// go under the field they are about. Returns false when the error belongs in a message instead.
export function applyRequestError(
  form: FormInstance<RequestHeaderValues>,
  error: unknown,
): boolean {
  if (error instanceof ApiError && error.code && FIELD_BY_CODE[error.code]) {
    form.setFields([
      { name: FIELD_BY_CODE[error.code], errors: [error.message] },
    ]);
    return true;
  }
  return applyFieldErrors(form, error);
}
