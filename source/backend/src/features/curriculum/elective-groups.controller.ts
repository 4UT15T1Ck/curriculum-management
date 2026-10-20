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
import {
  AssignGroupItemsDto,
  ElectiveGroupDto,
  UpdateElectiveGroupDto,
} from './elective-group.dto.js';
import { ElectiveGroupsService } from './elective-groups.service.js';

@ApiTags('curriculum')
@ApiCookieAuth()
@Controller('elective-groups/:groupId')
export class ElectiveGroupsController {
  constructor(private readonly groups: ElectiveGroupsService) {}

  @Patch()
  @RequirePermission(PERMISSIONS.CURRICULUM_EDIT)
  @ApiOkResponse({ type: ElectiveGroupDto })
  update(
    @Param('groupId') groupId: string,
    @Body() dto: UpdateElectiveGroupDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.groups.update(groupId, dto, access);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSIONS.CURRICULUM_EDIT)
  @ApiNoContentResponse()
  remove(
    @Param('groupId') groupId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.groups.remove(groupId, access);
  }

  @Put('items')
  @RequirePermission(PERMISSIONS.CURRICULUM_EDIT)
  @ApiOkResponse({ type: ElectiveGroupDto })
  assignItems(
    @Param('groupId') groupId: string,
    @Body() dto: AssignGroupItemsDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.groups.assignItems(groupId, dto, access);
  }
}
