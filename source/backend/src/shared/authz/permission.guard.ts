import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../auth/public.decorator.js';
import { AppException } from '../exception/app.exception.js';
import { COMMON_ERRORS } from '../exception/error-codes.js';
import { ANY_AUTHENTICATED_KEY } from './any-authenticated.decorator.js';
import type { PermissionCode } from './permission-codes.js';
import { REQUIRED_PERMISSIONS_KEY } from './require-permission.decorator.js';
import { ScopeService } from './scope.service.js';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly scopes: ScopeService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const access = await this.scopes.loadAccess(request.user!.id);
    request.access = access;
    const required = this.reflector.getAllAndOverride<PermissionCode[]>(
      REQUIRED_PERMISSIONS_KEY,
      targets,
    );
    if (required) {
      if (required.some((code) => access.has(code))) {
        return true;
      }
      throw new AppException(COMMON_ERRORS.PERMISSION_DENIED);
    }
    if (
      this.reflector.getAllAndOverride<boolean>(ANY_AUTHENTICATED_KEY, targets)
    ) {
      return true;
    }
    throw new AppException(COMMON_ERRORS.PERMISSION_DENIED);
  }
}
