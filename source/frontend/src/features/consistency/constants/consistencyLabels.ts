export const SEVERITY_LABELS = {
  ERROR: 'Lỗi',
  HIGH: 'Cảnh báo',
  INFO: 'Lưu ý',
} as const;
export const SEVERITY_ALERT_TYPE = {
  ERROR: 'error',
  HIGH: 'warning',
  INFO: 'info',
} as const;
export const SEVERITY_ORDER = ['ERROR', 'HIGH', 'INFO'] as const;
export const CLEAN_RESULT_MESSAGE = 'Không có lỗi, không có cảnh báo.';
export const BLOCKING_NOTE =
  'Còn lỗi: chưa gửi duyệt hoặc ban hành được phiên bản này.';
export const RERUN_LABEL = 'Chạy lại';
export const ACCEPT_LABEL = 'Chấp nhận chênh lệch';
export const REASON_REQUIRED_MESSAGE = 'Nhập lý do chấp nhận chênh lệch.';
// Same as the server's CONSISTENCY_LIMITS.REASON_MAX.
export const REASON_MAX = 500;
