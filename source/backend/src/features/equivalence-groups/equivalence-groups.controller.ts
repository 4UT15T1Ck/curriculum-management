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
  Query,
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
import { AddEquivalenceMemberDto } from './add-equivalence-member.dto.js';
import { CreateEquivalenceGroupDto } from './create-equivalence-group.dto.js';
import { EquivalenceGroupQueryDto } from './equivalence-group-query.dto.js';
import {
  EquivalenceGroupDto,
  EquivalenceGroupPageDto,
} from './equivalence-group.dto.js';
import { EquivalenceGroupsService } from './equivalence-groups.service.js';
import { MergeEquivalenceGroupsDto } from './merge-equivalence-groups.dto.js';
import { UpdateEquivalenceGroupDto } from './update-equivalence-group.dto.js';

@ApiTags('equivalence-groups')
@ApiCookieAuth()
@Controller('equivalence-groups')
export class EquivalenceGroupsController {
  constructor(private readonly groups: EquivalenceGroupsService) {}

  @Get()
  @RequirePermission(PERMISSIONS.COURSE_VIEW)
  @ApiOkResponse({ type: EquivalenceGroupPageDto })
  list(@Query() query: EquivalenceGroupQueryDto) {
    return this.groups.list(query);
  }

  @Get(':groupId')
  @RequirePermission(PERMISSIONS.COURSE_VIEW)
  @ApiOkResponse({ type: EquivalenceGroupDto })
  detail(@Param('groupId') groupId: string) {
    return this.groups.detail(groupId);
  }

  @Post()
  @RequirePermission(PERMISSIONS.COURSE_RELATION_EDIT)
  @ApiCreatedResponse({ type: EquivalenceGroupDto })
  create(
    @Body() dto: CreateEquivalenceGroupDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.groups.create(dto, access);
  }

  @Patch(':groupId')
  @RequirePermission(PERMISSIONS.COURSE_RELATION_EDIT)
  @ApiOkResponse({ type: EquivalenceGroupDto })
  update(
    @Param('groupId') groupId: string,
    @Body() dto: UpdateEquivalenceGroupDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.groups.update(groupId, dto, access);
  }

  @Post(':groupId/members')
  @RequirePermission(PERMISSIONS.COURSE_RELATION_EDIT)
  @ApiCreatedResponse({ type: EquivalenceGroupDto })
  addMember(
    @Param('groupId') groupId: string,
    @Body() dto: AddEquivalenceMemberDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.groups.addMember(groupId, dto.courseId, access);
  }

  @Delete(':groupId/members/:courseId')
  @RequirePermission(PERMISSIONS.COURSE_RELATION_EDIT)
  @ApiOkResponse({ type: EquivalenceGroupDto })
  removeMember(
    @Param('groupId') groupId: string,
    @Param('courseId') courseId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.groups.removeMember(groupId, courseId, access);
  }

  @Post(':groupId/merge')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSIONS.COURSE_RELATION_EDIT)
  @ApiOkResponse({ type: EquivalenceGroupDto })
  merge(
    @Param('groupId') groupId: string,
    @Body() dto: MergeEquivalenceGroupsDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.groups.merge(groupId, dto.otherGroupId, access);
  }

  @Post(':groupId/dissolve')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSIONS.COURSE_RELATION_EDIT)
  @ApiNoContentResponse()
  dissolve(
    @Param('groupId') groupId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.groups.dissolve(groupId, access);
  }
}
