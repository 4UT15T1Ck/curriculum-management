import { Module } from '@nestjs/common';
import { NotificationsSharedModule } from '../notifications/notifications-shared.module.js';
import { ApprovalRecorder } from './approval-recorder.js';
import { RequestNotifier } from './request-notifier.js';
import { StaleChecker } from './stale-checker.js';

// F-15 imports this to re-run the stale check, record the final approval and notify.
@Module({
  imports: [NotificationsSharedModule],
  providers: [StaleChecker, ApprovalRecorder, RequestNotifier],
  exports: [StaleChecker, ApprovalRecorder, RequestNotifier],
})
export class ChangeRequestsSharedModule {}
