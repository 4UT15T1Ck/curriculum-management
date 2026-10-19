import type { Rule } from 'antd/es/form';
import {
  CREDITS_MESSAGE,
  CREDITS_PATTERN,
} from '../../../shared/forms/credits';

// Re-exported so the course form tests keep one import path for the shared credit rule.
export { CREDITS_MESSAGE, CREDITS_PATTERN };
// Mirrors GRADE_POINT_PATTERN and GRADE_POINT_MESSAGE in source/backend/src/shared/decimal/decimal.ts:
// the 4-point scale, 0 to 4 with at most two decimals.
export const GRADE_POINT_PATTERN = /^(4(\.0{1,2})?|[0-3](\.\d{1,2})?)$/;
export const GRADE_POINT_MESSAGE =
  'Ngưỡng điểm theo thang 4: từ 0 đến 4, tối đa 2 chữ số thập phân (ví dụ 2 hoặc 2.5).';
// Mirrors COURSE_FIELD_LIMITS in source/backend/src/features/courses/create-course.dto.ts.
export const COURSE_CODE_MAX = 20;
export const COURSE_NAME_MAX = 200;

export const COURSE_RULES = {
  courseCode: [
    { required: true, whitespace: true, message: 'Nhập mã học phần.' },
    {
      max: COURSE_CODE_MAX,
      message: `Mã học phần tối đa ${COURSE_CODE_MAX} ký tự.`,
    },
  ],
  courseName: [
    {
      required: true,
      whitespace: true,
      message: 'Nhập tên tiếng Việt của học phần.',
    },
    {
      max: COURSE_NAME_MAX,
      message: `Tên học phần tối đa ${COURSE_NAME_MAX} ký tự.`,
    },
  ],
  englishName: [
    {
      max: COURSE_NAME_MAX,
      message: `Tên tiếng Anh tối đa ${COURSE_NAME_MAX} ký tự.`,
    },
  ],
  credits: [
    { required: true, message: 'Nhập số tín chỉ.' },
    { pattern: CREDITS_PATTERN, message: CREDITS_MESSAGE },
  ],
  courseType: [{ required: true, message: 'Chọn loại học phần.' }],
  ownerFacultyId: [{ required: true, message: 'Chọn khoa phụ trách.' }],
} satisfies Record<string, Rule[]>;
