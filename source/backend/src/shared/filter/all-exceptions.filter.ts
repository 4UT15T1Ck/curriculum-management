import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { ErrorResponseDto } from '../dtos/error-response.dto.js';
import { AppException } from '../exception/app.exception.js';
import {
  COMMON_ERRORS,
  ERRORS_BY_STATUS,
  UNMAPPED_CLIENT_ERROR_CODE,
  UNMAPPED_CLIENT_ERROR_MESSAGE,
} from '../exception/error-codes.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const body = toErrorBody(exception, request.originalUrl);
    if (body.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR)
      this.logger.error(exception);
    http.getResponse<Response>().status(body.statusCode).json(body);
  }
}

export function toErrorBody(
  exception: unknown,
  path: string,
): ErrorResponseDto {
  const timestamp = new Date().toISOString();
  if (exception instanceof AppException) {
    return {
      statusCode: exception.getStatus(),
      code: exception.code,
      message: exception.message,
      details: exception.details,
      path,
      timestamp,
    };
  }
  if (exception instanceof HttpException) {
    const statusCode = exception.getStatus();
    const known = ERRORS_BY_STATUS[statusCode as HttpStatus];
    if (known)
      return {
        statusCode,
        code: known.code,
        message: known.message,
        path,
        timestamp,
      };
    if (statusCode < HttpStatus.INTERNAL_SERVER_ERROR)
      return {
        statusCode,
        code: UNMAPPED_CLIENT_ERROR_CODE,
        message: UNMAPPED_CLIENT_ERROR_MESSAGE,
        path,
        timestamp,
      };
  }
  const internal = COMMON_ERRORS.INTERNAL_ERROR;
  return {
    statusCode: internal.status,
    code: internal.code,
    message: internal.message,
    path,
    timestamp,
  };
}
