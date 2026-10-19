import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AllowPendingPasswordChange } from '../../shared/auth/allow-pending-password-change.decorator.js';
import { AnyAuthenticated } from '../../shared/authz/any-authenticated.decorator.js';
import { CurrentAccess } from '../../shared/authz/current-access.decorator.js';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { ScopeService } from '../../shared/authz/scope.service.js';
import type { AuthenticatedUser } from '../../shared/auth/authenticated-user.js';
import { CurrentUser } from '../../shared/auth/current-user.decorator.js';
import { Public } from '../../shared/auth/public.decorator.js';
import { ErrorResponseDto } from '../../shared/dtos/error-response.dto.js';
import { SESSION_COOKIE_NAME } from '../../shared/session/session.constants.js';
import {
  endSession,
  startSession,
} from '../../shared/session/session-lifecycle.js';
import { AuthService } from './auth.service.js';
import { ChangePasswordDto } from './change-password.dto.js';
import { LoginDto } from './login.dto.js';
import { MeDto } from './me.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly scopes: ScopeService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MeDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  async login(@Body() dto: LoginDto, @Req() request: Request): Promise<MeDto> {
    const user = await this.auth.login(dto, request.ip);
    await startSession(request, user.id);
    return this.auth.me(user, await this.scopes.loadAccess(user.id));
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await endSession(request.session);
    response.clearCookie(SESSION_COOKIE_NAME);
  }

  @AllowPendingPasswordChange()
  @AnyAuthenticated()
  @Get('me')
  @ApiCookieAuth()
  @ApiOkResponse({ type: MeDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  me(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentAccess() access: AccessContext,
  ): Promise<MeDto> {
    return this.auth.me(user, access);
  }

  @AllowPendingPasswordChange()
  @AnyAuthenticated()
  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth()
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    return this.auth.changePassword(user.id, dto);
  }
}
