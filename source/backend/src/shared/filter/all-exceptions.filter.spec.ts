import { HttpException, NotFoundException } from '@nestjs/common';
import { FieldErrorDto } from '../dtos/error-response.dto.js';
import { AppException } from '../exception/app.exception.js';
import { COMMON_ERRORS } from '../exception/error-codes.js';
import { validationExceptionFactory } from '../exception/validation-exception.factory.js';
import { toErrorBody } from './all-exceptions.filter.js';

describe('toErrorBody', () => {
  it('maps AppException and details', () => {
    const detail: FieldErrorDto = {
      field: 'name',
      constraints: ['isNotEmpty'],
    };
    expect(
      toErrorBody(
        new AppException(COMMON_ERRORS.VALIDATION_FAILED, [detail]),
        '/x',
      ),
    ).toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_FAILED',
      details: [detail],
      path: '/x',
    });
  });

  it('maps known Nest exceptions by status', () => {
    expect(toErrorBody(new NotFoundException(), '/x').code).toBe('NOT_FOUND');
  });

  it('maps unknown client statuses to REQUEST_FAILED', () => {
    expect(toErrorBody(new HttpException('x', 418), '/x')).toMatchObject({
      statusCode: 418,
      code: 'REQUEST_FAILED',
    });
  });

  it('maps unknown errors to INTERNAL_ERROR', () => {
    expect(toErrorBody(new Error(), '/x')).toMatchObject({
      statusCode: 500,
      code: 'INTERNAL_ERROR',
    });
  });

  it('flattens nested validation errors', () => {
    const exception = validationExceptionFactory([
      {
        property: 'parent',
        children: [
          { property: 'child', constraints: { isNotEmpty: 'required' } },
        ],
      },
    ]);
    expect(exception.details).toEqual([
      { field: 'parent.child', constraints: ['isNotEmpty'] },
    ]);
  });
});
