import { Module } from '@nestjs/common';
import { SubjectGroupsController } from './subject-groups.controller.js';
import { SubjectGroupsService } from './subject-groups.service.js';
import { SubjectGroupMembersService } from './subject-group-members.service.js';
import { SubjectGroupMembershipsController } from './subject-group-memberships.controller.js';

@Module({
  controllers: [SubjectGroupsController, SubjectGroupMembershipsController],
  providers: [SubjectGroupsService, SubjectGroupMembersService],
})
export class SubjectGroupsModule {}
