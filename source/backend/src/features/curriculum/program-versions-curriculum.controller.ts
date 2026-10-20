import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { CreateCurriculumItemDto } from './create-curriculum-item.dto.js';
import { CurriculumReadService } from './curriculum-read.service.js';
import { CurriculumService } from './curriculum.service.js';
import { CurriculumDto, CurriculumItemDto } from './curriculum.dto.js';
import {
  CreateElectiveGroupDto,
  ElectiveGroupDto,
} from './elective-group.dto.js';
import { ElectiveGroupsService } from './elective-groups.service.js';
import { ReorderCurriculumDto } from './reorder-curriculum.dto.js';

@ApiTags('curriculum')
@ApiCookieAuth()
@Controller('program-versions/:versionId')
export class ProgramVersionsCurriculumController {
  constructor(
    private readonly reader: CurriculumReadService,
    private readonly curriculum: CurriculumService,
    private readonly groups: ElectiveGroupsService,
  ) {}

  @Get('curriculum')
  @RequirePermission(PERMISSIONS.PROGRAM_VIEW)
  @ApiOkResponse({ type: CurriculumDto })
  read(
    @Param('versionId') versionId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.reader.read(versionId, access);
  }

  @Post('curriculum-items')
  @RequirePermission(PERMISSIONS.CURRICULUM_EDIT)
  @ApiCreatedResponse({ type: CurriculumItemDto })
  createItem(
    @Param('versionId') versionId: string,
    @Body() dto: CreateCurriculumItemDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.curriculum.createItem(versionId, dto, access);
  }

  @Put('curriculum-order')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSIONS.CURRICULUM_EDIT)
  @ApiNoContentResponse()
  reorder(
    @Param('versionId') versionId: string,
    @Body() dto: ReorderCurriculumDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.curriculum.reorder(versionId, dto, access);
  }

  @Post('elective-groups')
  @RequirePermission(PERMISSIONS.CURRICULUM_EDIT)
  @ApiCreatedResponse({ type: ElectiveGroupDto })
  createGroup(
    @Param('versionId') versionId: string,
    @Body() dto: CreateElectiveGroupDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.groups.create(versionId, dto, access);
  }
}
