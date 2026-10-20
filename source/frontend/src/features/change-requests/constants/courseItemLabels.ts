import type { CourseRequestField, RelationType } from '../api/changeRequests';

export const COURSE_FIELD_LABELS: Record<CourseRequestField, string> = {
  courseName: 'Tên học phần',
  englishName: 'Tên tiếng Anh',
  credits: 'Số tín chỉ',
  courseType: 'Loại học phần',
  ownerGroupId: 'Nhóm chuyên môn phụ trách',
};
export const COURSE_FIELDS = Object.keys(
  COURSE_FIELD_LABELS,
) as CourseRequestField[];

export const COURSE_TYPE_LABELS = {
  THEORY: 'Lý thuyết',
  PRACTICE: 'Thực hành',
  LAB: 'Thí nghiệm',
  PROJECT: 'Đồ án',
  CAPSTONE: 'Đồ án tốt nghiệp',
  INTERNSHIP: 'Thực tập',
  CONDITIONAL: 'Điều kiện',
} as const;

export const RELATION_TYPE_LABELS: Record<RelationType, string> = {
  PRIOR: 'Học trước',
  PREREQUISITE: 'Tiên quyết',
  COREQUISITE: 'Song hành',
  REPLACEMENT: 'Thay thế',
};

// One choice per reading of a relation from the current course's side; `currentIs` says where the course sits
// (source = studied first or discontinued, target = holds the requirement). Mirrors the course screen's choices.
export const RELATION_CHOICES = [
  {
    key: 'needsPrior',
    type: 'PRIOR',
    currentIs: 'target',
    label: 'Cần học trước học phần',
  },
  {
    key: 'isPriorOf',
    type: 'PRIOR',
    currentIs: 'source',
    label: 'Là học phần học trước của',
  },
  {
    key: 'needsPrerequisite',
    type: 'PREREQUISITE',
    currentIs: 'target',
    label: 'Cần đạt tiên quyết học phần',
  },
  {
    key: 'isPrerequisiteOf',
    type: 'PREREQUISITE',
    currentIs: 'source',
    label: 'Là học phần tiên quyết của',
  },
  {
    key: 'corequisiteWith',
    type: 'COREQUISITE',
    currentIs: 'target',
    label: 'Học song hành với',
  },
  {
    key: 'replacedBy',
    type: 'REPLACEMENT',
    currentIs: 'source',
    label: 'Được thay thế bởi',
  },
  {
    key: 'replaces',
    type: 'REPLACEMENT',
    currentIs: 'target',
    label: 'Thay thế cho',
  },
] as const satisfies readonly {
  key: string;
  type: RelationType;
  currentIs: 'source' | 'target';
  label: string;
}[];

export const MIN_SCORE_HINT = 'Thang 4, để trống nếu không yêu cầu điểm.';
export const BLANK_MEANS_UNCHANGED = 'Để trống nếu không đổi.';
