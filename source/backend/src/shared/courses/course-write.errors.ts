import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../exception/error-definition.js';

// Raised by the course writer, whichever feature calls it (the courses screen, a final approval).
export const COURSE_WRITE_ERRORS = {
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
  COURSE_FIELD_INVALID: {
    status: HttpStatus.BAD_REQUEST,
    code: 'COURSE_FIELD_INVALID',
    message: 'Giá trị của thuộc tính học phần không hợp lệ.',
  },
} as const satisfies Record<string, ErrorDefinition>;

// Constraint keys in `details`, the same style as class-validator keys (FieldErrorDto).
export const OWNER_CONSTRAINT = {
  ACTIVE_FACULTY: 'activeFaculty',
  GROUP_OF_FACULTY: 'groupOfFaculty',
} as const;
