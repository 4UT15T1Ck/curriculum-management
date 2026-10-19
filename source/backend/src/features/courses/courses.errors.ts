import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../../shared/exception/error-definition.js';

export const COURSE_ERRORS = {
  COURSE_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'COURSE_NOT_FOUND',
    message: 'Không tìm thấy học phần.',
  },
  COURSE_CODE_TAKEN: {
    status: HttpStatus.CONFLICT,
    code: 'COURSE_CODE_TAKEN',
    message: 'Mã học phần đã tồn tại.',
  },
  OWNER_FACULTY_INVALID: {
    status: HttpStatus.BAD_REQUEST,
    code: 'OWNER_FACULTY_INVALID',
    message: 'Khoa phụ trách phải là một Khoa đang hoạt động.',
  },
  OWNER_GROUP_INVALID: {
    status: HttpStatus.BAD_REQUEST,
    code: 'OWNER_GROUP_INVALID',
    message:
      'Nhóm phụ trách phải là nhóm đang hoạt động của chính khoa phụ trách.',
  },
  COURSE_CANCELLED: {
    status: HttpStatus.CONFLICT,
    code: 'COURSE_CANCELLED',
    message: 'Học phần đã hủy, không sửa và không đổi trạng thái được.',
  },
  STATUS_TRANSITION_INVALID: {
    status: HttpStatus.CONFLICT,
    code: 'STATUS_TRANSITION_INVALID',
    message:
      'Không chuyển được học phần sang trạng thái này từ trạng thái hiện tại.',
  },
  REPLACEMENT_REQUIRED: {
    status: HttpStatus.CONFLICT,
    code: 'REPLACEMENT_REQUIRED',
    message:
      'Hãy khai báo học phần thay thế (quan hệ Thay thế tới một học phần đang sử dụng) trước khi ngừng mở lớp.',
  },
  REPLACEMENT_INVALID: {
    status: HttpStatus.BAD_REQUEST,
    code: 'REPLACEMENT_INVALID',
    message: 'Học phần thay thế phải là một học phần khác đang sử dụng.',
  },
  COURSE_IN_USE: {
    status: HttpStatus.CONFLICT,
    code: 'COURSE_IN_USE',
    message:
      'Học phần đã nằm trong phiên bản đã ban hành hoặc đã có kết quả học tập nên không hủy được; hãy chuyển sang Ngừng mở lớp.',
  },
} as const satisfies Record<string, ErrorDefinition>;

// Constraint keys in `details`, the same style as class-validator keys (FieldErrorDto).
export const OWNER_CONSTRAINT = {
  ACTIVE_FACULTY: 'activeFaculty',
  GROUP_OF_FACULTY: 'groupOfFaculty',
} as const;
