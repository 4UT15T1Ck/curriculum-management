import { Module } from '@nestjs/common';
import { CurriculumSharedModule } from '../../shared/curriculum/curriculum-shared.module.js';
import { ProgramsSharedModule } from '../../shared/programs/programs-shared.module.js';
import { ProgramCloneService } from './program-clone.service.js';
import { ProgramDirectorsService } from './program-directors.service.js';
import { ProgramVersionInfoController } from './program-version-info.controller.js';
import { ProgramVersionInfoService } from './program-version-info.service.js';
import { ProgramsController } from './programs.controller.js';
import { ProgramsService } from './programs.service.js';

@Module({
  imports: [ProgramsSharedModule, CurriculumSharedModule],
  controllers: [ProgramsController, ProgramVersionInfoController],
  providers: [
    ProgramsService,
    ProgramCloneService,
    ProgramDirectorsService,
    ProgramVersionInfoService,
  ],
})
export class ProgramsModule {}
