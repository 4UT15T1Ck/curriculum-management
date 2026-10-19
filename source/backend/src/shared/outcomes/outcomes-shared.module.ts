import { Module } from '@nestjs/common';
import { OutcomeGapsReader } from './outcome-gaps.reader.js';

@Module({ providers: [OutcomeGapsReader], exports: [OutcomeGapsReader] })
export class OutcomesSharedModule {}
