import { Module } from '@nestjs/common';
import { CourseUsageReader } from './course-usage.reader.js';

@Module({ providers: [CourseUsageReader], exports: [CourseUsageReader] })
export class CoursesSharedModule {}
