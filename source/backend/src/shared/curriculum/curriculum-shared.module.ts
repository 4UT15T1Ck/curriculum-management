import { Module } from '@nestjs/common';
import { CurriculumFactsReader } from './curriculum-facts.reader.js';

@Module({
  providers: [CurriculumFactsReader],
  exports: [CurriculumFactsReader],
})
export class CurriculumSharedModule {}
