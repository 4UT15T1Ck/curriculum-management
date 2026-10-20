import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { UserStatus } from '../../generated/prisma/client.js';
import type { Env } from '../config/env.validation.js';
import { AppException } from '../exception/app.exception.js';
import { COMMON_ERRORS } from '../exception/error-codes.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { IS_PASSIVE_REQUEST_KEY } from '../session/passive-request.decorator.js';
import { endSession } from '../session/session-lifecycle.js';
import { MS_PER_MINUTE } from '../session/session.constants.js';
import { ALLOW_PENDING_PASSWORD_CHANGE_KEY } from './allow-pending-password-change.decorator.js';
import { AUTHENTICATED_USER_SELECT } from './authenticated-user.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  private readonly idleMs: number;

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    config: ConfigService<Env, true>,
  ) {
    this.idleMs =
      config.get('SESSION_IDLE_MINUTES', { infer: true }) * MS_PER_MINUTE;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isMarked(IS_PUBLIC_KEY, context)) return true;
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.session?.userId;
    if (!userId) throw new AppException(COMMON_ERRORS.SESSION_REQUIRED);
    // The cookie is rolling, so every response (polls included) renews it; this clock is the real idle limit.
    // A session written before lastActivityAt existed counts as active now.
    const now = Date.now();
    if (now - (request.session.lastActivityAt ?? now) > this.idleMs) {
      await endSession(request.session);
      throw new AppException(COMMON_ERRORS.SESSION_REQUIRED);
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: AUTHENTICATED_USER_SELECT,
    });
    if (!user || user.status !== UserStatus.ACTIVE) {
      await endSession(request.session);
      throw new AppException(COMMON_ERRORS.SESSION_REQUIRED);
    }
    if (
      user.mustChangePassword &&
      !this.isMarked(ALLOW_PENDING_PASSWORD_CHANGE_KEY, context)
    ) {
      throw new AppException(COMMON_ERRORS.PASSWORD_CHANGE_REQUIRED);
    }
    request.user = user;
    if (!this.isMarked(IS_PASSIVE_REQUEST_KEY, context)) {
      request.session.lastActivityAt = now;
    }
    return true;
  }

  private isMarked(key: string, context: ExecutionContext): boolean {
    return (
      this.reflector.getAllAndOverride<boolean>(key, [
        context.getHandler(),
        context.getClass(),
      ]) === true
    );
  }
}
