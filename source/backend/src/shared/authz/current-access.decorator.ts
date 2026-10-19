import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AccessContext } from './access-context.js';

export const CurrentAccess = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AccessContext =>
    context.switchToHttp().getRequest<Request>().access!,
);
