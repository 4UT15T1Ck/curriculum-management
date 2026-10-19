import type {
  ApprovalAction,
  ApprovalStepKind,
  OverrideAction,
} from '../api/changeRequests';

export const STEP_KIND_LABELS: Record<ApprovalStepKind, string> = {
  NORMAL: '',
  SKIPPED: 'Bỏ qua',
  OVERRIDE: 'Phòng Đào tạo duyệt thay',
};

export const OVERRIDE_ACTION_LABELS: Record<OverrideAction, string> = {
  APPROVE: 'Đồng ý thay',
  RETURN: 'Trả lại thay',
  REJECT: 'Từ chối thay',
};

export const DECISION_TITLES = {
  RETURN: 'Trả lại đề xuất',
  REJECT: 'Từ chối đề xuất',
} as const;

export const STEP_COLORS: Record<ApprovalAction, string> = {
  PENDING: 'default',
  APPROVE: 'success',
  RETURN: 'warning',
  REJECT: 'error',
};

export const APPROVE_CONFIRM = 'Đồng ý đề xuất này?';
export const OVERRIDE_NOTE =
  'Phòng Đào tạo quyết định thay cho người duyệt của cấp hiện tại; lịch sử ghi rõ người được thay.';
export const DEAD_STEP_LABEL = 'không còn hiệu lực';
export const NO_QUEUE = 'Không có đề xuất nào chờ bạn duyệt.';
