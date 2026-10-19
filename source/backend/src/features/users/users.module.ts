import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { RoleAssignmentsService } from './role-assignments.service.js';

@Module({
  controllers: [UsersController],
  providers: [UsersService, RoleAssignmentsService],
  exports: [UsersService, RoleAssignmentsService],
})
export class UsersModule {}
