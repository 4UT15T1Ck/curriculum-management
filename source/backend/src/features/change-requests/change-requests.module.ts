import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ChangeRequestsSharedModule } from '../../shared/change-requests/change-requests-shared.module.js';
import type { Env } from '../../shared/config/env.validation.js';
import { CurriculumSharedModule } from '../../shared/curriculum/curriculum-shared.module.js';
import { BYTES_PER_MB } from '../../shared/files/attachment-types.js';
import { FilesModule } from '../../shared/files/files.module.js';
import { ReleasesSharedModule } from '../../shared/releases/releases-shared.module.js';
import { ProgramsSharedModule } from '../../shared/programs/programs-shared.module.js';
import { ApprovalHistoryReader } from './approval-history.reader.js';
import { ApprovalQueueController } from './approval-queue.controller.js';
import { ApprovalQueueReader } from './approval-queue.reader.js';
import { ApprovalController } from './approval.controller.js';
import { ApprovalService } from './approval.service.js';
import { AuthoredItemsService } from './authored-items.service.js';
import { ChangeRequestDetailReader } from './change-request-detail.reader.js';
import { ChangeRequestDocumentsController } from './change-request-documents.controller.js';
import { ChangeRequestDocumentsService } from './change-request-documents.service.js';
import { ChangeRequestsController } from './change-requests.controller.js';
import { ChangeRequestsService } from './change-requests.service.js';
import { CommentsService } from './comments.service.js';
import { ConflictFinder } from './conflict-finder.js';
import { FinalApprovalApplier } from './final-approval.applier.js';
import { FinalApprovalPreviewReader } from './final-approval.preview.js';
import { FinalApprovalService } from './final-approval.service.js';
import { OrganizationalApplier } from './organizational-applier.js';
import { RequestItemsService } from './request-items.service.js';
import { RequestTargetResolver } from './request-target.resolver.js';
import { RoutingPlanner } from './routing-planner.js';
import { SubmissionService } from './submission.service.js';
import { WorkingCopyService } from './working-copy.service.js';

@Module({
  imports: [
    ProgramsSharedModule,
    CurriculumSharedModule,
    ChangeRequestsSharedModule,
    ReleasesSharedModule,
    FilesModule,
    // Same limits as syllabus attachments; Multer keeps the file in memory by default.
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        limits: {
          fileSize:
            config.get('ATTACHMENT_MAX_MB', { infer: true }) * BYTES_PER_MB,
          files: 1,
        },
      }),
    }),
  ],
  controllers: [
    ChangeRequestsController,
    ChangeRequestDocumentsController,
    ApprovalController,
    ApprovalQueueController,
  ],
  providers: [
    ApprovalHistoryReader,
    ApprovalQueueReader,
    ApprovalService,
    CommentsService,
    OrganizationalApplier,
    ChangeRequestsService,
    ChangeRequestDetailReader,
    AuthoredItemsService,
    ChangeRequestDocumentsService,
    ConflictFinder,
    FinalApprovalApplier,
    FinalApprovalPreviewReader,
    FinalApprovalService,
    RequestItemsService,
    RequestTargetResolver,
    RoutingPlanner,
    SubmissionService,
    WorkingCopyService,
  ],
})
export class ChangeRequestsModule {}
