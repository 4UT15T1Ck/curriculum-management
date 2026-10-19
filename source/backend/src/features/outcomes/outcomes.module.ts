import { Module } from '@nestjs/common';
import { OutcomesSharedModule } from '../../shared/outcomes/outcomes-shared.module.js';
import { CloPloMatrixService } from './clo-plo-matrix.service.js';
import { CoursePloMatrixService } from './course-plo-matrix.service.js';
import { OutcomeCoverageService } from './outcome-coverage.service.js';
import { OutcomesController } from './outcomes.controller.js';
import { PlosService } from './plos.service.js';

@Module({
  imports: [OutcomesSharedModule],
  controllers: [OutcomesController],
  providers: [
    PlosService,
    CoursePloMatrixService,
    CloPloMatrixService,
    OutcomeCoverageService,
  ],
})
export class OutcomesModule {}
