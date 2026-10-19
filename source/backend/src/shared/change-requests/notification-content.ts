import type { DecisionAction } from './approval-recorder.js';

export interface RequestHeadline {
  requestCode: string;
  title: string;
}

const ACTION_VERBS: Record<DecisionAction, string> = {
  APPROVE: 'đồng ý',
  RETURN: 'trả lại',
  REJECT: 'từ chối',
};

// The sentence is written when the event happens; a request renamed later does not rewrite old notifications.
export const NOTIFICATION_CONTENT = {
  awaiting: (request: RequestHeadline, levelName: string) =>
    `Đề xuất ${request.requestCode} "${request.title}" đang chờ bạn duyệt (${levelName}).`,
  returned: (request: RequestHeadline, actor: string, remark: string) =>
    `${actor} đã trả lại đề xuất ${request.requestCode}: ${remark}`,
  rejected: (request: RequestHeadline, actor: string, remark: string) =>
    `${actor} đã từ chối đề xuất ${request.requestCode}: ${remark}`,
  applied: (request: RequestHeadline) =>
    `Đề xuất ${request.requestCode} "${request.title}" đã được phê duyệt và áp dụng.`,
  effective: (request: RequestHeadline, semesterCode: string) =>
    `Đề xuất ${request.requestCode} "${request.title}" đã có hiệu lực từ học kỳ ${semesterCode}.`,
  overridden: (
    request: RequestHeadline,
    actor: string,
    action: DecisionAction,
    reason: string,
  ) =>
    `Phòng Đào tạo (${actor}) đã ${ACTION_VERBS[action]} thay bạn đề xuất ${request.requestCode}: ${reason}`,
  commented: (request: RequestHeadline, actor: string) =>
    `${actor} đã bình luận về đề xuất ${request.requestCode}.`,
} as const;
