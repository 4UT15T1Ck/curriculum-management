import { Module } from '@nestjs/common';
import { CoursesSharedModule } from '../../shared/courses/courses-shared.module.js';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';

@Module({
  imports: [CoursesSharedModule],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
