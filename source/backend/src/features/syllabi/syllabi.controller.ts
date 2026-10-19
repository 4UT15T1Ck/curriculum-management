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
  Put,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import type { AccessContext } from '../../shared/authz/access-context.js';
import { CurrentAccess } from '../../shared/authz/current-access.decorator.js';
import { PERMISSIONS } from '../../shared/authz/permission-codes.js';
import { RequirePermission } from '../../shared/authz/require-permission.decorator.js';
import { ATTACHMENT_MIMES } from '../../shared/files/attachment-types.js';
import { sendFile } from '../../shared/files/send-file.js';
import { SyllabusAttachmentsService } from './syllabus-attachments.service.js';
import {
  SyllabusAttachmentDto,
  UploadAttachmentFormDto,
} from './syllabus-attachment.dto.js';
import { CourseSyllabusDto, SyllabusDto } from './syllabus.dto.js';
import { SyllabiService } from './syllabi.service.js';
import { UpdateSyllabusDto } from './update-syllabus.dto.js';
import {
  CreateWeeklyContentDto,
  ReorderWeeklyContentsDto,
  UpdateWeeklyContentDto,
  WeeklyContentDto,
} from './weekly-content.dto.js';
import { WeeklyContentsService } from './weekly-contents.service.js';

@ApiTags('syllabi')
@ApiCookieAuth()
@Controller()
export class SyllabiController {
  constructor(
    private readonly syllabi: SyllabiService,
    private readonly weeks: WeeklyContentsService,
    private readonly attachments: SyllabusAttachmentsService,
  ) {}

  @Get('courses/:courseId/syllabus')
  @RequirePermission(PERMISSIONS.SYLLABUS_VIEW)
  @ApiOkResponse({ type: CourseSyllabusDto })
  forCourse(
    @Param('courseId') courseId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.syllabi.forCourse(courseId, access);
  }

  @Post('courses/:courseId/syllabus')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission(PERMISSIONS.SYLLABUS_EDIT)
  @ApiCreatedResponse({ type: CourseSyllabusDto })
  create(
    @Param('courseId') courseId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.syllabi.create(courseId, access);
  }

  @Patch('syllabi/:syllabusId')
  @RequirePermission(PERMISSIONS.SYLLABUS_EDIT)
  @ApiOkResponse({ type: SyllabusDto })
  update(
    @Param('syllabusId') syllabusId: string,
    @Body() dto: UpdateSyllabusDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.syllabi.update(syllabusId, dto, access);
  }

  @Post('syllabi/:syllabusId/weekly-contents')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission(PERMISSIONS.SYLLABUS_EDIT)
  @ApiCreatedResponse({ type: WeeklyContentDto })
  createWeek(
    @Param('syllabusId') syllabusId: string,
    @Body() dto: CreateWeeklyContentDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.weeks.create(syllabusId, dto, access);
  }

  @Put('syllabi/:syllabusId/weekly-contents/order')
  @RequirePermission(PERMISSIONS.SYLLABUS_EDIT)
  @ApiOkResponse({ type: [WeeklyContentDto] })
  reorderWeeks(
    @Param('syllabusId') syllabusId: string,
    @Body() dto: ReorderWeeklyContentsDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.weeks.reorder(syllabusId, dto, access);
  }

  @Patch('weekly-contents/:weeklyContentId')
  @RequirePermission(PERMISSIONS.SYLLABUS_EDIT)
  @ApiOkResponse({ type: WeeklyContentDto })
  updateWeek(
    @Param('weeklyContentId') weeklyContentId: string,
    @Body() dto: UpdateWeeklyContentDto,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.weeks.update(weeklyContentId, dto, access);
  }

  @Delete('weekly-contents/:weeklyContentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSIONS.SYLLABUS_EDIT)
  removeWeek(
    @Param('weeklyContentId') weeklyContentId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.weeks.remove(weeklyContentId, access);
  }

  @Post('syllabi/:syllabusId/attachments')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission(PERMISSIONS.SYLLABUS_EDIT)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadAttachmentFormDto })
  @ApiCreatedResponse({ type: SyllabusAttachmentDto })
  upload(
    @Param('syllabusId') syllabusId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.attachments.upload(syllabusId, file, access);
  }

  @Get('syllabus-attachments/:attachmentId/file')
  @RequirePermission(PERMISSIONS.SYLLABUS_VIEW)
  @ApiProduces(...ATTACHMENT_MIMES)
  async download(
    @Param('attachmentId') attachmentId: string,
    @CurrentAccess() access: AccessContext,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.attachments.open(attachmentId, access);
    return sendFile(res, file.stream, file.fileName, file.mime);
  }

  @Delete('syllabus-attachments/:attachmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSIONS.SYLLABUS_EDIT)
  removeAttachment(
    @Param('attachmentId') attachmentId: string,
    @CurrentAccess() access: AccessContext,
  ) {
    return this.attachments.remove(attachmentId, access);
  }
}
