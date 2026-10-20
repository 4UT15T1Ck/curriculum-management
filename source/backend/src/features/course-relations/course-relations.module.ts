import { Module } from '@nestjs/common';
import { CoursesSharedModule } from '../../shared/courses/courses-shared.module.js';
import { CourseRelationsController } from './course-relations.controller.js';
import { CourseRelationsService } from './course-relations.service.js';

@Module({
  imports: [CoursesSharedModule],
  controllers: [CourseRelationsController],
  providers: [CourseRelationsService],
})
export class CourseRelationsModule {}
