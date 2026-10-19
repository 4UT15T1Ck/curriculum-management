import { Module } from '@nestjs/common';
import { CurriculumItemsController } from './curriculum-items.controller.js';
import { CurriculumReadService } from './curriculum-read.service.js';
import { CurriculumRequisitesService } from './curriculum-requisites.service.js';
import { CurriculumService } from './curriculum.service.js';
import { ElectiveGroupsController } from './elective-groups.controller.js';
import { ElectiveGroupsService } from './elective-groups.service.js';
import { ProgramVersionsCurriculumController } from './program-versions-curriculum.controller.js';

@Module({
  controllers: [
    ProgramVersionsCurriculumController,
    CurriculumItemsController,
    ElectiveGroupsController,
  ],
  providers: [
    CurriculumReadService,
    CurriculumService,
    CurriculumRequisitesService,
    ElectiveGroupsService,
  ],
})
export class CurriculumModule {}
