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
import { CourseRelationDto } from './course-relation.dto.js';
import { CourseRelationsService } from './course-relations.service.js';
import { CreateCourseRelationDto } from './create-course-relation.dto.js';
import { UpdateCourseRelationDto } from './update-course-relation.dto.js';

@ApiTags('course-relations')
@ApiCookieAuth()
@Controller()
export class CourseRelationsController {
  constructor(private readonly relations: CourseRelationsService) {}

  @Get('courses/:courseId/relations')
  @RequirePermission(PERMISSIONS.COURSE_VIEW)
  @ApiOkResponse({ type: [CourseRelationDto] })
  list(
    @Param('courseId') courseId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.relations.listForCourse(courseId, access);
  }

  @Post('course-relations')
  @RequirePermission(PERMISSIONS.COURSE_RELATION_EDIT)
  @ApiCreatedResponse({ type: CourseRelationDto })
  create(
    @Body() dto: CreateCourseRelationDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.relations.create(dto, access);
  }

  @Patch('course-relations/:relationId')
  @RequirePermission(PERMISSIONS.COURSE_RELATION_EDIT)
  @ApiOkResponse({ type: CourseRelationDto })
  update(
    @Param('relationId') relationId: string,
    @Body() dto: UpdateCourseRelationDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.relations.updateMinScore(relationId, dto, access);
  }

  @Delete('course-relations/:relationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSIONS.COURSE_RELATION_EDIT)
  @ApiNoContentResponse()
  remove(
    @Param('relationId') relationId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.relations.remove(relationId, access);
  }
}
