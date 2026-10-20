import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { CurrentAccess } from '../../shared/authz/current-access.decorator.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { RequirePermission } from '../../shared/authz/require-permission.decorator.js';
import { AcceptCreditMismatchDto } from './accept-credit-mismatch.dto.js';
import { ConsistencyReportDto } from './consistency.dto.js';
import { ConsistencyService } from './consistency.service.js';

@ApiTags('consistency')
@ApiCookieAuth()
@Controller('program-versions/:versionId')
export class ConsistencyController {
  constructor(private readonly consistency: ConsistencyService) {}

  @Get('consistency')
  @RequirePermission(PERMISSIONS.PROGRAM_VIEW)
  @ApiOkResponse({ type: ConsistencyReportDto })
  report(
    @Param('versionId') versionId: string,
    @CurrentAccess() access: AccessContext,
  ): Promise<ConsistencyReportDto> {
    return this.consistency.report(versionId, access);
  }

  @Put('credit-mismatch-acceptance')
  @RequirePermission(PERMISSIONS.PROGRAM_EDIT_INFO)
  @ApiOkResponse({ type: ConsistencyReportDto })
  accept(
    @Param('versionId') versionId: string,
    @Body() dto: AcceptCreditMismatchDto,
    @CurrentAccess() access: AccessContext,
  ): Promise<ConsistencyReportDto> {
    return this.consistency.acceptMismatch(versionId, dto, access);
  }
}
