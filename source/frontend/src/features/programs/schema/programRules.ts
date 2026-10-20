import type { Rule } from 'antd/es/form';
import {
  CREDITS_MESSAGE,
  CREDITS_PATTERN,
} from '../../../shared/forms/credits';

// Mirrors PROGRAM_LIMITS in source/backend/src/features/programs/create-program.dto.ts.
export const PROGRAM_CODE_MAX = 20;
export const PROGRAM_NAME_MAX = 200;
export const MAJOR_CODE_MAX = 20;
export const SEMESTERS_MIN = 1;
export const SEMESTERS_MAX = 12;
// Two decimals: anything closer than this is rounding noise, not a gap (BR-03).
export const CREDITS_EPSILON = 0.001;

const creditRules = (required: string): Rule[] => [
  { required: true, message: required },
  { pattern: CREDITS_PATTERN, message: CREDITS_MESSAGE },
];

export const PROGRAM_CODE_RULES: Rule[] = [
  { required: true, whitespace: true, message: 'Nhập mã chương trình.' },
  {
    max: PROGRAM_CODE_MAX,
    message: `Mã chương trình tối đa ${PROGRAM_CODE_MAX} ký tự.`,
  },
];
export const PROGRAM_NAME_RULES: Rule[] = [
  { required: true, whitespace: true, message: 'Nhập tên chương trình.' },
  {
    max: PROGRAM_NAME_MAX,
    message: `Tên chương trình tối đa ${PROGRAM_NAME_MAX} ký tự.`,
  },
];

export const PROGRAM_RULES = {
  programCode: PROGRAM_CODE_RULES,
  programName: PROGRAM_NAME_RULES,
  degreeLevel: [{ required: true, message: 'Chọn trình độ.' }],
  majorCode: [
    { required: true, whitespace: true, message: 'Nhập mã ngành.' },
    {
      max: MAJOR_CODE_MAX,
      message: `Mã ngành tối đa ${MAJOR_CODE_MAX} ký tự.`,
    },
  ],
  majorName: [
    { required: true, whitespace: true, message: 'Nhập tên ngành.' },
    {
      max: PROGRAM_NAME_MAX,
      message: `Tên ngành tối đa ${PROGRAM_NAME_MAX} ký tự.`,
    },
  ],
  semesterCount: [
    { required: true, message: 'Nhập số học kỳ.' },
    {
      type: 'integer',
      min: SEMESTERS_MIN,
      max: SEMESTERS_MAX,
      message: `Số học kỳ từ ${SEMESTERS_MIN} đến ${SEMESTERS_MAX}.`,
    },
  ],
  totalCredits: creditRules('Nhập tổng số tín chỉ.'),
  compulsoryCredits: creditRules('Nhập số tín chỉ bắt buộc.'),
  electiveCredits: creditRules('Nhập số tín chỉ tự chọn.'),
} satisfies Record<string, Rule[]>;
