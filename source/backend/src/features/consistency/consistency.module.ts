import { Module } from '@nestjs/common';
import { CurriculumSharedModule } from '../../shared/curriculum/curriculum-shared.module.js';
import { ConsistencyController } from './consistency.controller.js';
import { ConsistencyService } from './consistency.service.js';

@Module({
  imports: [CurriculumSharedModule],
  controllers: [ConsistencyController],
  providers: [ConsistencyService],
})
export class ConsistencyModule {}
