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
import type { AccessContext } from '../../shared/authz/access-context.js';
import { CurrentAccess } from '../../shared/authz/current-access.decorator.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { RequirePermission } from '../../shared/authz/require-permission.decorator.js';
import { COURSE_TRANSITION } from './course-status.js';
import { CourseQueryDto } from './course-query.dto.js';
import { CourseDetailDto, CoursePageDto } from './course.dto.js';
import { CoursesService } from './courses.service.js';
import { CreateCourseDto } from './create-course.dto.js';
import { UpdateCourseDto } from './update-course.dto.js';

@ApiTags('courses')
@ApiCookieAuth()
@Controller('courses')
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  @RequirePermission(PERMISSIONS.COURSE_VIEW)
  @ApiOkResponse({ type: CoursePageDto })
  list(@Query() query: CourseQueryDto, @CurrentAccess() access: AccessContext) {
    return this.courses.list(query, access);
  }

  @Post()
  @RequirePermission(PERMISSIONS.COURSE_EDIT)
  @ApiCreatedResponse({ type: CourseDetailDto })
  create(@Body() dto: CreateCourseDto, @CurrentAccess() access: AccessContext) {
    return this.courses.create(dto, access);
  }

  @Get(':courseId')
  @RequirePermission(PERMISSIONS.COURSE_VIEW)
  @ApiOkResponse({ type: CourseDetailDto })
  detail(
    @Param('courseId') courseId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.courses.detail(courseId, access);
  }

  @Patch(':courseId')
  @RequirePermission(PERMISSIONS.COURSE_EDIT)
  @ApiOkResponse({ type: CourseDetailDto })
  update(
    @Param('courseId') courseId: string,
    @Body() dto: UpdateCourseDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.courses.update(courseId, dto, access);
  }

  @Post(':courseId/discontinue')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSIONS.COURSE_EDIT)
  @ApiOkResponse({ type: CourseDetailDto })
  discontinue(
    @Param('courseId') courseId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.courses.transition(
      courseId,
      COURSE_TRANSITION.DISCONTINUE,
      access,
    );
  }

  @Post(':courseId/reopen')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSIONS.COURSE_EDIT)
  @ApiOkResponse({ type: CourseDetailDto })
  reopen(
    @Param('courseId') courseId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.courses.transition(courseId, COURSE_TRANSITION.REOPEN, access);
  }

  @Post(':courseId/cancel')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSIONS.COURSE_EDIT)
  @ApiOkResponse({ type: CourseDetailDto })
  cancel(
    @Param('courseId') courseId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.courses.transition(courseId, COURSE_TRANSITION.CANCEL, access);
  }
}
