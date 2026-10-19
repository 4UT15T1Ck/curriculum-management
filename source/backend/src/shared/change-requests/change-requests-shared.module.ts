import { Module } from '@nestjs/common';
import { StaleChecker } from './stale-checker.js';

// F-15 imports this to re-run the stale check at final approval.
@Module({ providers: [StaleChecker], exports: [StaleChecker] })
export class ChangeRequestsSharedModule {}
