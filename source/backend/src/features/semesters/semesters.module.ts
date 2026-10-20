import { Module } from '@nestjs/common';
import { ReleasesSharedModule } from '../../shared/releases/releases-shared.module.js';
import { SemestersController } from './semesters.controller.js';
import { SemestersService } from './semesters.service.js';

@Module({
  imports: [ReleasesSharedModule],
  controllers: [SemestersController],
  providers: [SemestersService],
})
export class SemestersModule {}
