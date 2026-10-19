import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Put,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { CurrentAccess } from '../../shared/authz/current-access.decorator.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { RequirePermission } from '../../shared/authz/require-permission.decorator.js';
import { UpdateCurriculumItemDto } from './create-curriculum-item.dto.js';
import { CurriculumRequisitesService } from './curriculum-requisites.service.js';
import { CurriculumService } from './curriculum.service.js';
import { CurriculumItemDto } from './curriculum.dto.js';
import { ReplaceRequisitesDto } from './replace-requisites.dto.js';

@ApiTags('curriculum')
@ApiCookieAuth()
@Controller('curriculum-items/:itemId')
export class CurriculumItemsController {
  constructor(
    private readonly curriculum: CurriculumService,
    private readonly requisites: CurriculumRequisitesService,
  ) {}

  @Patch()
  @RequirePermission(PERMISSIONS.CURRICULUM_EDIT)
  @ApiOkResponse({ type: CurriculumItemDto })
  update(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCurriculumItemDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.curriculum.updateItem(itemId, dto, access);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSIONS.CURRICULUM_EDIT)
  @ApiNoContentResponse()
  remove(
    @Param('itemId') itemId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.curriculum.removeItem(itemId, access);
  }

  @Put('requisites')
  @RequirePermission(PERMISSIONS.CURRICULUM_EDIT)
  @ApiOkResponse({ type: CurriculumItemDto })
  replaceRequisites(
    @Param('itemId') itemId: string,
    @Body() dto: ReplaceRequisitesDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.requisites.replace(itemId, dto, access);
  }
}
