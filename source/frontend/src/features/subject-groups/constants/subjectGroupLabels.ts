import type { SubjectGroupStatus } from '../../../shared/subject-groups/subjectGroups';
export const GROUP_STATUS_LABELS: Record<SubjectGroupStatus, string> = {
  ACTIVE: 'Đang sử dụng',
  INACTIVE: 'Ngừng sử dụng',
};
export const GROUP_STATUS_COLORS: Record<SubjectGroupStatus, string> = {
  ACTIVE: 'green',
  INACTIVE: 'default',
};
export const NO_COORDINATOR_LABEL = 'Chưa có Điều phối';
