import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ChangeRequestsSharedModule } from '../../shared/change-requests/change-requests-shared.module.js';
import type { Env } from '../../shared/config/env.validation.js';
import { CurriculumSharedModule } from '../../shared/curriculum/curriculum-shared.module.js';
import { BYTES_PER_MB } from '../../shared/files/attachment-types.js';
import { FilesModule } from '../../shared/files/files.module.js';
import { ProgramsSharedModule } from '../../shared/programs/programs-shared.module.js';
import { AuthoredItemsService } from './authored-items.service.js';
import { ChangeRequestDetailReader } from './change-request-detail.reader.js';
import { ChangeRequestDocumentsController } from './change-request-documents.controller.js';
import { ChangeRequestDocumentsService } from './change-request-documents.service.js';
import { ChangeRequestsController } from './change-requests.controller.js';
import { ChangeRequestsService } from './change-requests.service.js';
import { ConflictFinder } from './conflict-finder.js';
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
  controllers: [ChangeRequestsController, ChangeRequestDocumentsController],
  providers: [
    ChangeRequestsService,
    ChangeRequestDetailReader,
    AuthoredItemsService,
    ChangeRequestDocumentsService,
    ConflictFinder,
    RequestItemsService,
    RequestTargetResolver,
    RoutingPlanner,
    SubmissionService,
    WorkingCopyService,
  ],
})
export class ChangeRequestsModule {}
