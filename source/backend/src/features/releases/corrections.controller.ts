import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiCookieAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { CurrentAccess } from '../../shared/authz/current-access.decorator.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { RequirePermission } from '../../shared/authz/require-permission.decorator.js';
import { CorrectionsService } from './corrections.service.js';
import { IssueCorrectionDto } from './dto/release-version.dto.js';
import { VersionDetailDto } from './dto/version-detail.dto.js';

@ApiTags('releases')
@ApiCookieAuth()
@Controller('programs/:programId/versions/:versionId/corrections')
@RequirePermission(PERMISSIONS.VERSION_CORRECT)
export class CorrectionsController {
  constructor(private readonly corrections: CorrectionsService) {}

  @Post()
  @ApiCreatedResponse({ type: VersionDetailDto })
  create(
    @Param('programId') programId: string,
    @Param('versionId') versionId: string,
    @CurrentAccess() access: AccessContext,
  ): Promise<VersionDetailDto> {
    return this.corrections.create(programId, versionId, access);
  }

  @Post(':correctionId/issue')
  @ApiCreatedResponse({ type: VersionDetailDto })
  issue(
    @Param('programId') programId: string,
    @Param('versionId') versionId: string,
    @Param('correctionId') correctionId: string,
    @Body() dto: IssueCorrectionDto,
    @CurrentAccess() access: AccessContext,
  ): Promise<VersionDetailDto> {
    return this.corrections.issue(
      programId,
      versionId,
      correctionId,
      dto,
      access,
    );
  }

  @Delete(':correctionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  discard(
    @Param('programId') programId: string,
    @Param('versionId') versionId: string,
    @Param('correctionId') correctionId: string,
    @CurrentAccess() access: AccessContext,
  ): Promise<void> {
    return this.corrections.discard(programId, versionId, correctionId, access);
  }
}
