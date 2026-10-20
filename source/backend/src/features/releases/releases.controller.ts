import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { CurrentAccess } from '../../shared/authz/current-access.decorator.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { RequirePermission } from '../../shared/authz/require-permission.decorator.js';
import { ReleaseCheckDto } from './dto/release-check.dto.js';
import { ReleaseVersionDto } from './dto/release-version.dto.js';
import { VersionDetailDto } from './dto/version-detail.dto.js';
import { ReleasesService } from './releases.service.js';

@ApiTags('releases')
@ApiCookieAuth()
@Controller('programs/:programId/versions/:versionId')
export class ReleasesController {
  constructor(private readonly releases: ReleasesService) {}

  @Get('release-check')
  @RequirePermission(PERMISSIONS.VERSION_PUBLISH)
  @ApiOkResponse({ type: ReleaseCheckDto })
  check(
    @Param('programId') programId: string,
    @Param('versionId') versionId: string,
    @CurrentAccess() access: AccessContext,
  ): Promise<ReleaseCheckDto> {
    return this.releases.check(programId, versionId, access);
  }

  @Post('release')
  @RequirePermission(PERMISSIONS.VERSION_PUBLISH)
  @ApiCreatedResponse({ type: VersionDetailDto })
  release(
    @Param('programId') programId: string,
    @Param('versionId') versionId: string,
    @Body() dto: ReleaseVersionDto,
    @CurrentAccess() access: AccessContext,
  ): Promise<VersionDetailDto> {
    return this.releases.release(programId, versionId, dto, access);
  }
}
