import {
  DRAFT_VERSION_LABEL,
  VERSION_STATUS_LABELS as SHARED_VERSION_STATUS_LABELS,
  versionLabel,
} from '../../../shared/constants/versionLabels';
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
// Shared with the release screens (F-15) so every screen words the four states the same way.
export const VERSION_STATUS_LABELS: Record<ProgramVersionStatus, string> =
  SHARED_VERSION_STATUS_LABELS;
// Moved to shared/ so the curriculum and course screens print the same label; re-exported for the programs screens.
export { DRAFT_VERSION_LABEL, versionLabel };

export const ALL_STATUSES_LABEL = 'Tất cả';
export const CLONE_SCOPE_NOTE =
  'Bản mới ở trạng thái Nháp, chép thông tin chương trình, khung, PLO và hai ma trận chuẩn đầu ra. Đề cương học phần dùng chung nên không sao chép. Giám đốc CTĐT phân công lại sau.';
export const REVOKE_DIRECTOR_CONFIRM =
  'Chỉ dùng khi phân công nhập nhầm. Lịch sử vẫn giữ dòng đã thu hồi.';
