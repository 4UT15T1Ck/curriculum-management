import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../../shared/exception/error-definition.js';

export const PERMISSION_ERRORS = {
  ROLE_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'ROLE_NOT_FOUND',
    message: 'Không tìm thấy vai trò.',
  },
  PERMISSION_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'PERMISSION_NOT_FOUND',
    message: 'Không tìm thấy quyền.',
  },
  MATRIX_CELL_LOCKED: {
    status: HttpStatus.CONFLICT,
    code: 'MATRIX_CELL_LOCKED',
    message: 'Ô này được khóa để Phòng Đào tạo không tự mất quyền quản trị.',
  },
} as const satisfies Record<string, ErrorDefinition>;
