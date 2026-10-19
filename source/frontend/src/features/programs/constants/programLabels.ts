import type {
  DegreeLevel,
  ProgramStatus,
  ProgramVersionStatus,
} from '../api/programs';

export const DEGREE_LEVEL_LABELS: Record<DegreeLevel, string> = {
  ENGINEER: 'Kỹ sư',
  BACHELOR: 'Cử nhân',
};
export const PROGRAM_STATUS_LABELS: Record<ProgramStatus, string> = {
  ACTIVE: 'Đang sử dụng',
  INACTIVE: 'Ngừng sử dụng',
};
export const PROGRAM_STATUS_COLORS: Record<ProgramStatus, string> = {
  ACTIVE: 'green',
  INACTIVE: 'default',
};
export const VERSION_STATUS_LABELS: Record<ProgramVersionStatus, string> = {
  DRAFT: 'Nháp',
  PENDING: 'Chờ hiệu lực',
  ACTIVE: 'Đang hiệu lực',
  HISTORICAL: 'Lịch sử',
};
export const DRAFT_VERSION_LABEL = 'Nháp';
export const versionLabel = (version: { versionNumber: string | null }) =>
  version.versionNumber ?? DRAFT_VERSION_LABEL;

export const ALL_STATUSES_LABEL = 'Tất cả';
export const CLONE_SCOPE_NOTE =
  'Bản mới ở trạng thái Nháp, chép thông tin chương trình và khung; chưa chép PLO và ma trận. Giám đốc CTĐT phân công lại sau.';
export const REVOKE_DIRECTOR_CONFIRM =
  'Chỉ dùng khi phân công nhập nhầm. Lịch sử vẫn giữ dòng đã thu hồi.';
export const SECTION_NOT_BUILT_TOOLTIP =
  'Có từ khi tính năng khung chương trình được dựng';
