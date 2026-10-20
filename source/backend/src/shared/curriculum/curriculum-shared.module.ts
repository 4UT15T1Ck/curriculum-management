import { Module } from '@nestjs/common';
import { ConsistencyChecker } from './consistency-checker.js';
import { CurriculumFactsReader } from './curriculum-facts.reader.js';

@Module({
  providers: [CurriculumFactsReader, ConsistencyChecker],
  exports: [CurriculumFactsReader, ConsistencyChecker],
})
export class CurriculumSharedModule {}
