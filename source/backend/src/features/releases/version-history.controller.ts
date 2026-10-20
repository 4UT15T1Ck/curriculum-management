import { Controller, Get, Param } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { CurrentAccess } from '../../shared/authz/current-access.decorator.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { RequirePermission } from '../../shared/authz/require-permission.decorator.js';
import { VersionDetailDto, VersionListDto } from './dto/version-detail.dto.js';
import { VersionHistoryReader } from './version-history.reader.js';

@ApiTags('releases')
@ApiCookieAuth()
@Controller('programs/:programId/versions')
export class VersionHistoryController {
  constructor(private readonly history: VersionHistoryReader) {}

  @Get()
  @RequirePermission(PERMISSIONS.VERSION_VIEW_HISTORY, PERMISSIONS.PROGRAM_VIEW)
  @ApiOkResponse({ type: VersionListDto })
  list(
    @Param('programId') programId: string,
    @CurrentAccess() access: AccessContext,
  ): Promise<VersionListDto> {
    return this.history.list(programId, access);
  }

  @Get(':versionId')
  @RequirePermission(PERMISSIONS.PROGRAM_VIEW)
  @ApiOkResponse({ type: VersionDetailDto })
  detail(
    @Param('programId') programId: string,
    @Param('versionId') versionId: string,
    @CurrentAccess() access: AccessContext,
  ): Promise<VersionDetailDto> {
    return this.history.detail(programId, versionId, access);
  }
}
