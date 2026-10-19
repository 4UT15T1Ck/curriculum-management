import type { PermissionMatrix } from '../api/permissionMatrix';

export const CELL_OPTIONS = [
  { key: 'X', label: 'X — Trực tiếp, toàn bộ', mode: 'DIRECT', scope: 'ALL' },
  {
    key: 'P',
    label: 'P — Trực tiếp, theo phạm vi',
    mode: 'DIRECT',
    scope: 'SCOPED',
  },
  {
    key: 'D',
    label: 'Đ — Qua đề xuất, toàn bộ',
    mode: 'VIA_REQUEST',
    scope: 'ALL',
  },
  {
    key: 'DP',
    label: 'Đ(P) — Qua đề xuất, theo phạm vi',
    mode: 'VIA_REQUEST',
    scope: 'SCOPED',
  },
] as const;
export const NO_CELL_LABEL = '– Không có quyền';
export const CELL_SYMBOLS = { X: 'X', P: 'P', D: 'Đ', DP: 'Đ(P)' } as const;
export const FUNCTION_GROUP_LABELS: Record<
  PermissionMatrix['permissions'][number]['functionGroup'],
  string
> = {
  SYSTEM_ADMIN: 'Quản trị hệ thống',
  COURSE_CATALOG: 'Danh mục học phần',
  PROGRAM: 'Chương trình đào tạo',
  LEARNING_OUTCOME: 'Chuẩn đầu ra',
  SYLLABUS: 'Đề cương chi tiết',
  APPROVAL: 'Quy trình phê duyệt',
  VERSION: 'Phiên bản',
  DATA_REPORT: 'Dữ liệu và báo cáo',
  STUDENT_LOOKUP: 'Tra cứu sinh viên',
};
