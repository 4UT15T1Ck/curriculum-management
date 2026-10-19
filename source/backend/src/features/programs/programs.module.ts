import { Module } from '@nestjs/common';
import { CurriculumSharedModule } from '../../shared/curriculum/curriculum-shared.module.js';
import { ProgramsSharedModule } from '../../shared/programs/programs-shared.module.js';
import { ProgramCloneService } from './program-clone.service.js';
import { ProgramDirectorsService } from './program-directors.service.js';
import { ProgramsController } from './programs.controller.js';
import { ProgramsService } from './programs.service.js';

@Module({
  imports: [ProgramsSharedModule, CurriculumSharedModule],
  controllers: [ProgramsController],
  providers: [ProgramsService, ProgramCloneService, ProgramDirectorsService],
})
export class ProgramsModule {}
