import { HttpStatus } from '@nestjs/common';
import {
  DIRECTOR_CONSTRAINT,
  DIRECTOR_ERRORS,
} from '../../shared/programs/director.errors.js';
import type { ErrorDefinition } from '../../shared/exception/error-definition.js';

export const PROGRAM_ERRORS = {
  ...DIRECTOR_ERRORS,
  PROGRAM_CODE_TAKEN: {
    status: HttpStatus.CONFLICT,
    code: 'PROGRAM_CODE_TAKEN',
    message: 'Mã chương trình đã tồn tại.',
  },
  FACULTY_INVALID: {
    status: HttpStatus.BAD_REQUEST,
    code: 'PROGRAM_FACULTY_INVALID',
    message: 'Khoa quản lý phải là một khoa đang hoạt động.',
  },
  CREDITS_MISMATCH: {
    status: HttpStatus.BAD_REQUEST,
    code: 'CREDITS_MISMATCH',
    message: 'Tín chỉ bắt buộc cộng tín chỉ tự chọn phải bằng tổng tín chỉ',
  },
  STATUS_UNCHANGED: {
    status: HttpStatus.CONFLICT,
    code: 'PROGRAM_STATUS_UNCHANGED',
    message: 'Chương trình đã ở trạng thái này.',
  },
  SEMESTERS_BELOW_CURRICULUM: {
    status: HttpStatus.CONFLICT,
    code: 'SEMESTERS_BELOW_CURRICULUM',
    message: 'Khung chương trình đã có học phần ở học kỳ',
  },
  VERSION_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'PROGRAM_VERSION_NOT_FOUND',
    message: 'Không tìm thấy phiên bản chương trình.',
  },
  VERSION_NOT_EDITABLE: {
    status: HttpStatus.CONFLICT,
    code: 'PROGRAM_VERSION_NOT_EDITABLE',
    message: 'Chỉ sửa được thông tin của phiên bản đang ở trạng thái Nháp.',
  },
  SOURCE_VERSION_INVALID: {
    status: HttpStatus.BAD_REQUEST,
    code: 'SOURCE_VERSION_INVALID',
    message: 'Phiên bản nguồn không thuộc chương trình được nhân bản.',
  },
} as const satisfies Record<string, ErrorDefinition>;

// Constraint keys in `details`, the same style as class-validator keys (FieldErrorDto).
export const PROGRAM_CONSTRAINT = {
  ACTIVE_FACULTY: 'activeFaculty',
  ACTIVE_USER: DIRECTOR_CONSTRAINT.ACTIVE_USER,
  CREDITS_SUM: 'creditsSum',
  SEMESTERS_COVER_CURRICULUM: 'semestersCoverCurriculum',
} as const;
