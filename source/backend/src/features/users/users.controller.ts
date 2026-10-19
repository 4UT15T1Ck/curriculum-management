import {
  Body,
  Controller,
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
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../shared/auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../../shared/auth/authenticated-user.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { RequirePermission } from '../../shared/authz/require-permission.decorator.js';
import { CreateUserDto } from './create-user.dto.js';
import {
  CreatedUserDto,
  TemporaryPasswordDto,
  UserDetailDto,
  UserPageDto,
} from './user.dto.js';
import { ListUsersQueryDto } from './list-users-query.dto.js';
import { UpdateUserDto } from './update-user.dto.js';
import { UsersService } from './users.service.js';
import { RoleAssignmentsService } from './role-assignments.service.js';
import { CreateRoleAssignmentDto } from './create-role-assignment.dto.js';
import { RoleAssignmentDto } from './role-assignment.dto.js';

@ApiTags('users')
@ApiCookieAuth()
@RequirePermission(PERMISSIONS.USER_MANAGE)
@Controller('users')
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly assignments: RoleAssignmentsService,
  ) {}

  @Get()
  @ApiOkResponse({ type: UserPageDto })
  list(@Query() query: ListUsersQueryDto): Promise<UserPageDto> {
    return this.users.list(query);
  }

  @Post()
  @ApiCreatedResponse({ type: CreatedUserDto })
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<CreatedUserDto> {
    return this.users.create(dto, actor.id);
  }

  @Get(':userId')
  @ApiOkResponse({ type: UserDetailDto })
  get(@Param('userId') userId: string): Promise<UserDetailDto> {
    return this.users.get(userId);
  }

  @Patch(':userId')
  @ApiOkResponse({ type: UserDetailDto })
  update(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserDetailDto> {
    return this.users.update(userId, dto);
  }

  @Post(':userId/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserDetailDto })
  disable(
    @Param('userId') userId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserDetailDto> {
    return this.users.disable(userId, actor.id);
  }

  @Post(':userId/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserDetailDto })
  enable(
    @Param('userId') userId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserDetailDto> {
    return this.users.enable(userId, actor.id);
  }

  @Post(':userId/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TemporaryPasswordDto })
  resetPassword(
    @Param('userId') userId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<TemporaryPasswordDto> {
    return this.users.resetPassword(userId, actor.id);
  }

  @Get(':userId/role-assignments')
  @ApiOkResponse({ type: [RoleAssignmentDto] })
  history(@Param('userId') userId: string): Promise<RoleAssignmentDto[]> {
    return this.assignments.history(userId);
  }

  @Post(':userId/role-assignments')
  @ApiCreatedResponse({ type: RoleAssignmentDto })
  assign(
    @Param('userId') userId: string,
    @Body() dto: CreateRoleAssignmentDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<RoleAssignmentDto> {
    return this.assignments.assign(userId, dto, actor.id);
  }

  @Post(':userId/role-assignments/:assignmentId/revoke')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: RoleAssignmentDto })
  revoke(
    @Param('userId') userId: string,
    @Param('assignmentId') assignmentId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<RoleAssignmentDto> {
    return this.assignments.revoke(userId, assignmentId, actor.id);
  }
}
