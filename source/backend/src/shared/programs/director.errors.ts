import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../exception/error-definition.js';

// The rules of a program's director assignments; F-06's screens and the organisational apply of F-14 share them.
export const DIRECTOR_ERRORS = {
  PROGRAM_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'PROGRAM_NOT_FOUND',
    message: 'Không tìm thấy chương trình đào tạo.',
  },
  PROGRAM_INACTIVE: {
    status: HttpStatus.CONFLICT,
    code: 'PROGRAM_INACTIVE',
    message: 'Chương trình đã ngừng sử dụng.',
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

export const DIRECTOR_CONSTRAINT = { ACTIVE_USER: 'activeUser' } as const;
