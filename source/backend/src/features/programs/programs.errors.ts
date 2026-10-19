import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../../shared/exception/error-definition.js';

export const PROGRAM_ERRORS = {
  PROGRAM_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'PROGRAM_NOT_FOUND',
    message: 'Không tìm thấy chương trình đào tạo.',
  },
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
  PROGRAM_INACTIVE: {
    status: HttpStatus.CONFLICT,
    code: 'PROGRAM_INACTIVE',
    message: 'Chương trình đã ngừng sử dụng.',
  },
  STATUS_UNCHANGED: {
    status: HttpStatus.CONFLICT,
    code: 'PROGRAM_STATUS_UNCHANGED',
    message: 'Chương trình đã ở trạng thái này.',
  },
  SOURCE_VERSION_INVALID: {
    status: HttpStatus.BAD_REQUEST,
    code: 'SOURCE_VERSION_INVALID',
    message: 'Phiên bản nguồn không thuộc chương trình được nhân bản.',
  },
  DIRECTOR_INVALID: {
    status: HttpStatus.BAD_REQUEST,
    code: 'DIRECTOR_INVALID',
    message: 'Giám đốc CTĐT phải là một tài khoản đang hoạt động.',
  },
  DIRECTOR_PERIOD_OVERLAP: {
    status: HttpStatus.CONFLICT,
    code: 'DIRECTOR_PERIOD_OVERLAP',
    message:
      'Người này đã được phân công cho chương trình trong khoảng thời gian chồng lên.',
  },
  DIRECTOR_ASSIGNMENT_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'DIRECTOR_ASSIGNMENT_NOT_FOUND',
    message: 'Không tìm thấy phân công Giám đốc CTĐT.',
  },
  END_DATE_NOT_EARLIER: {
    status: HttpStatus.BAD_REQUEST,
    code: 'END_DATE_NOT_EARLIER',
    message:
      'Ngày kết thúc mới phải sớm hơn ngày kết thúc hiện tại; muốn kéo dài thì thêm phân công mới.',
  },
} as const satisfies Record<string, ErrorDefinition>;

// Constraint keys in `details`, the same style as class-validator keys (FieldErrorDto).
export const PROGRAM_CONSTRAINT = {
  ACTIVE_FACULTY: 'activeFaculty',
  ACTIVE_USER: 'activeUser',
  CREDITS_SUM: 'creditsSum',
} as const;
