import { Controller, Get, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { RequirePermission } from '../../shared/authz/require-permission.decorator.js';
import { MembershipQueryDto } from './membership-query.dto.js';
import { UserSubjectGroupMembershipDto } from './subject-group-member.dto.js';
import { SubjectGroupMembersService } from './subject-group-members.service.js';

@ApiTags('subject-groups')
@ApiCookieAuth()
@Controller('subject-group-memberships')
export class SubjectGroupMembershipsController {
  constructor(private readonly members: SubjectGroupMembersService) {}

  @Get()
  @RequirePermission(PERMISSIONS.ORG_UNIT_MANAGE, PERMISSIONS.USER_MANAGE)
  @ApiOkResponse({ type: [UserSubjectGroupMembershipDto] })
  list(@Query() query: MembershipQueryDto) {
    return this.members.membershipsOf(query.userId);
  }
}
