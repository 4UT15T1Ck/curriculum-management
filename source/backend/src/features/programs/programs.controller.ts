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
import { ProgramStatus } from '../../generated/prisma/client.js';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { CurrentAccess } from '../../shared/authz/current-access.decorator.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { RequirePermission } from '../../shared/authz/require-permission.decorator.js';
import { AssignDirectorDto, EndDirectorDto } from './assign-director.dto.js';
import { CloneProgramDto } from './clone-program.dto.js';
import { CreateProgramDto } from './create-program.dto.js';
import { ProgramDirectorDto } from './program-director.dto.js';
import { ProgramCloneService } from './program-clone.service.js';
import { ProgramDirectorsService } from './program-directors.service.js';
import { ProgramQueryDto } from './program-query.dto.js';
import { ProgramDetailDto, ProgramPageDto } from './program.dto.js';
import { ProgramsService } from './programs.service.js';
import { UpdateProgramDto } from './update-program.dto.js';

@ApiTags('programs')
@ApiCookieAuth()
@Controller('programs')
export class ProgramsController {
  constructor(
    private readonly programs: ProgramsService,
    private readonly directors: ProgramDirectorsService,
    private readonly cloning: ProgramCloneService,
  ) {}

  @Get()
  @RequirePermission(PERMISSIONS.PROGRAM_VIEW)
  @ApiOkResponse({ type: ProgramPageDto })
  list(
    @Query() query: ProgramQueryDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.programs.list(query, access);
  }

  @Post()
  @RequirePermission(PERMISSIONS.PROGRAM_EDIT_INFO)
  @ApiCreatedResponse({ type: ProgramDetailDto })
  create(
    @Body() dto: CreateProgramDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.programs.create(dto, access);
  }

  @Get(':programId')
  @RequirePermission(PERMISSIONS.PROGRAM_VIEW)
  @ApiOkResponse({ type: ProgramDetailDto })
  detail(
    @Param('programId') programId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.programs.detail(programId, access);
  }

  @Patch(':programId')
  @RequirePermission(PERMISSIONS.PROGRAM_EDIT_INFO)
  @ApiOkResponse({ type: ProgramDetailDto })
  update(
    @Param('programId') programId: string,
    @Body() dto: UpdateProgramDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.programs.update(programId, dto, access);
  }

  @Post(':programId/deactivate')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSIONS.PROGRAM_EDIT_INFO)
  @ApiOkResponse({ type: ProgramDetailDto })
  deactivate(
    @Param('programId') programId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.programs.setStatus(programId, ProgramStatus.INACTIVE, access);
  }

  @Post(':programId/reactivate')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSIONS.PROGRAM_EDIT_INFO)
  @ApiOkResponse({ type: ProgramDetailDto })
  reactivate(
    @Param('programId') programId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.programs.setStatus(programId, ProgramStatus.ACTIVE, access);
  }

  @Post(':programId/clone')
  @RequirePermission(PERMISSIONS.PROGRAM_CLONE)
  @ApiCreatedResponse({ type: ProgramDetailDto })
  clone(
    @Param('programId') programId: string,
    @Body() dto: CloneProgramDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.cloning.clone(programId, dto, access);
  }

  @Get(':programId/directors')
  @RequirePermission(PERMISSIONS.PROGRAM_VIEW)
  @ApiOkResponse({ type: [ProgramDirectorDto] })
  listDirectors(
    @Param('programId') programId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.directors.list(programId, access);
  }

  @Post(':programId/directors')
  @RequirePermission(PERMISSIONS.DIRECTOR_ASSIGN)
  @ApiCreatedResponse({ type: ProgramDirectorDto })
  assign(
    @Param('programId') programId: string,
    @Body() dto: AssignDirectorDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.directors.assign(programId, dto, access.userId);
  }

  @Post(':programId/directors/:assignmentId/end')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSIONS.DIRECTOR_ASSIGN)
  @ApiOkResponse({ type: ProgramDirectorDto })
  end(
    @Param('programId') programId: string,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: EndDirectorDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.directors.end(programId, assignmentId, dto, access.userId);
  }

  @Post(':programId/directors/:assignmentId/revoke')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSIONS.DIRECTOR_ASSIGN)
  @ApiOkResponse({ type: ProgramDirectorDto })
  revoke(
    @Param('programId') programId: string,
    @Param('assignmentId') assignmentId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.directors.revoke(programId, assignmentId, access.userId);
  }
}
