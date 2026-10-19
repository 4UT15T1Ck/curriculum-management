import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { CurrentAccess } from '../../shared/authz/current-access.decorator.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { RequirePermission } from '../../shared/authz/require-permission.decorator.js';
import { ProgramVersionInfoService } from './program-version-info.service.js';
import {
  UpdateVersionInfoDto,
  VersionInfoEditDto,
} from './version-info.dto.js';

@ApiTags('programs')
@ApiCookieAuth()
@Controller('program-versions/:versionId/info')
export class ProgramVersionInfoController {
  constructor(private readonly info: ProgramVersionInfoService) {}

  @Get()
  @RequirePermission(PERMISSIONS.PROGRAM_VIEW)
  @ApiOkResponse({ type: VersionInfoEditDto })
  read(
    @Param('versionId') versionId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.info.read(versionId, access);
  }

  @Patch()
  @RequirePermission(PERMISSIONS.PROGRAM_EDIT_INFO)
  @ApiOkResponse({ type: VersionInfoEditDto })
  update(
    @Param('versionId') versionId: string,
    @Body() dto: UpdateVersionInfoDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.info.update(versionId, dto, access);
  }
}
