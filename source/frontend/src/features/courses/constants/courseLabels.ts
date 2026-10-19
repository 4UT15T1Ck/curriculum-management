import type { CourseAction, CourseStatus, CourseType } from '../api/courses';

export const COURSE_TYPE_LABELS: Record<CourseType, string> = {
  THEORY: 'Lý thuyết',
  PRACTICE: 'Thực hành',
  LAB: 'Thí nghiệm',
  PROJECT: 'Đồ án',
  CAPSTONE: 'Đồ án tốt nghiệp',
  INTERNSHIP: 'Thực tập',
  CONDITIONAL: 'Học phần điều kiện',
};
export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  ACTIVE: 'Đang sử dụng',
  DISCONTINUED: 'Ngừng mở lớp',
  CANCELLED: 'Đã hủy',
};
export const COURSE_STATUS_COLORS: Record<CourseStatus, string> = {
  ACTIVE: 'green',
  DISCONTINUED: 'orange',
  CANCELLED: 'default',
};
export const FOREIGN_COURSE_LABEL = 'Khoa khác';
export const COURSE_ACTION_LABELS: Record<CourseAction, string> = {
  discontinue: 'Ngừng mở lớp',
  reopen: 'Mở lại',
  cancel: 'Hủy học phần',
};
export const NEXT_STATUS: Record<CourseAction, CourseStatus> = {
  discontinue: 'DISCONTINUED',
  reopen: 'ACTIVE',
  cancel: 'CANCELLED',
};
export const CANCEL_CONFIRM_TEXT =
  'Học phần đã hủy không mở lại được và không sửa được. Chỉ hủy học phần chưa từng dùng trong phiên bản đã ban hành và chưa có kết quả học tập.';
export const PROGRAMS_USING_TITLE = 'Chương trình đang sử dụng';
export const SYLLABUS_LINK = 'Đề cương';
