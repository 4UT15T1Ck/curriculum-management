import { Module } from '@nestjs/common';
import { ProgramsSharedModule } from '../../shared/programs/programs-shared.module.js';
import { ProgramDirectorsService } from './program-directors.service.js';
import { ProgramsController } from './programs.controller.js';
import { ProgramsService } from './programs.service.js';

@Module({
  imports: [ProgramsSharedModule],
  controllers: [ProgramsController],
  providers: [ProgramsService, ProgramDirectorsService],
})
export class ProgramsModule {}
