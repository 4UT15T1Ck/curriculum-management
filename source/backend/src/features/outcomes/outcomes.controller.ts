import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { CurrentAccess } from '../../shared/authz/current-access.decorator.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { RequirePermission } from '../../shared/authz/require-permission.decorator.js';
import {
  ItemCloPloMatrixDto,
  ProgramCloPloMatrixDto,
  ReplaceCloPloLinksDto,
} from './clo-plo-matrix.dto.js';
import { CloPloMatrixService } from './clo-plo-matrix.service.js';
import {
  CoursePloCellDto,
  CoursePloMatrixDto,
  SetPloWeightDto,
} from './course-plo-matrix.dto.js';
import { CoursePloMatrixService } from './course-plo-matrix.service.js';
import { OutcomeCoverageDto } from './outcome-coverage.dto.js';
import { OutcomeCoverageService } from './outcome-coverage.service.js';
import {
  CreatePloDto,
  PloDto,
  PloListDto,
  ReorderOutcomeRowsDto,
  UpdatePloDto,
} from './plo.dto.js';
import { PlosService } from './plos.service.js';

@ApiTags('outcomes')
@ApiCookieAuth()
@Controller()
export class OutcomesController {
  constructor(
    private readonly plos: PlosService,
    private readonly coursePlo: CoursePloMatrixService,
    private readonly cloPlo: CloPloMatrixService,
    private readonly coverage: OutcomeCoverageService,
  ) {}

  @Get('program-versions/:versionId/plos')
  @RequirePermission(PERMISSIONS.OUTCOME_VIEW)
  @ApiOkResponse({ type: PloListDto })
  listPlos(
    @Param('versionId') versionId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.plos.list(versionId, access);
  }

  @Post('program-versions/:versionId/plos')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission(PERMISSIONS.PLO_EDIT)
  @ApiCreatedResponse({ type: PloDto })
  createPlo(
    @Param('versionId') versionId: string,
    @Body() dto: CreatePloDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.plos.create(versionId, dto, access);
  }

  @Put('program-versions/:versionId/plos/order')
  @RequirePermission(PERMISSIONS.PLO_EDIT)
  @ApiOkResponse({ type: [PloDto] })
  reorderPlos(
    @Param('versionId') versionId: string,
    @Body() dto: ReorderOutcomeRowsDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.plos.reorder(versionId, dto, access);
  }

  @Patch('plos/:ploId')
  @RequirePermission(PERMISSIONS.PLO_EDIT)
  @ApiOkResponse({ type: PloDto })
  updatePlo(
    @Param('ploId') ploId: string,
    @Body() dto: UpdatePloDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.plos.update(ploId, dto, access);
  }

  @Delete('plos/:ploId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSIONS.PLO_EDIT)
  @ApiNoContentResponse()
  removePlo(
    @Param('ploId') ploId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.plos.remove(ploId, access);
  }

  @Get('program-versions/:versionId/course-plo-matrix')
  @RequirePermission(PERMISSIONS.OUTCOME_VIEW)
  @ApiOkResponse({ type: CoursePloMatrixDto })
  coursePloMatrix(
    @Param('versionId') versionId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.coursePlo.read(versionId, access);
  }

  @Put('curriculum-items/:itemId/plo-weights/:ploId')
  @RequirePermission(PERMISSIONS.PLO_EDIT)
  @ApiOkResponse({ type: CoursePloCellDto })
  setWeight(
    @Param('itemId') itemId: string,
    @Param('ploId') ploId: string,
    @Body() dto: SetPloWeightDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.coursePlo.setWeight(itemId, ploId, dto, access);
  }

  @Delete('curriculum-items/:itemId/plo-weights/:ploId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSIONS.PLO_EDIT)
  @ApiNoContentResponse()
  removeWeight(
    @Param('itemId') itemId: string,
    @Param('ploId') ploId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.coursePlo.removeWeight(itemId, ploId, access);
  }

  @Get('program-versions/:versionId/clo-plo-matrix')
  @RequirePermission(PERMISSIONS.OUTCOME_VIEW)
  @ApiOkResponse({ type: ProgramCloPloMatrixDto })
  programCloPloMatrix(
    @Param('versionId') versionId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.cloPlo.forVersion(versionId, access);
  }

  @Get('curriculum-items/:itemId/clo-plo-matrix')
  @RequirePermission(PERMISSIONS.OUTCOME_VIEW)
  @ApiOkResponse({ type: ItemCloPloMatrixDto })
  itemCloPloMatrix(
    @Param('itemId') itemId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.cloPlo.forItem(itemId, access);
  }

  @Put('curriculum-items/:itemId/clo-plo-links')
  @RequirePermission(PERMISSIONS.CLO_EDIT)
  @ApiOkResponse({ type: ItemCloPloMatrixDto })
  replaceLinks(
    @Param('itemId') itemId: string,
    @Body() dto: ReplaceCloPloLinksDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.cloPlo.replaceLinks(itemId, dto, access);
  }

  @Get('program-versions/:versionId/outcome-coverage')
  @RequirePermission(PERMISSIONS.OUTCOME_VIEW)
  @ApiOkResponse({ type: OutcomeCoverageDto })
  outcomeCoverage(
    @Param('versionId') versionId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.coverage.read(versionId, access);
  }
}
