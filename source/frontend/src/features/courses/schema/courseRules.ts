import type { Rule } from 'antd/es/form';

// Mirrors CREDITS_PATTERN, CREDITS_MESSAGE and COURSE_FIELD_LIMITS in source/backend/src/shared/decimal/decimal.ts
// and source/backend/src/features/courses/create-course.dto.ts.
export const CREDITS_PATTERN = /^\d{1,3}(\.\d{1,2})?$/;
export const CREDITS_MESSAGE =
  'Số tín chỉ phải là số từ 0 đến 999.99, tối đa 2 chữ số thập phân (ví dụ 3, 2.5 hoặc 0).';
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
