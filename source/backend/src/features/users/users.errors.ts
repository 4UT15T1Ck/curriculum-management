import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../../shared/exception/error-definition.js';

export const USER_ERRORS = {
  USER_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'USER_NOT_FOUND',
    message: 'Không tìm thấy tài khoản.',
  },
  USERNAME_TAKEN: {
    status: HttpStatus.CONFLICT,
    code: 'USERNAME_TAKEN',
    message: 'Tên đăng nhập đã được dùng.',
  },
  USER_CODE_TAKEN: {
    status: HttpStatus.CONFLICT,
    code: 'USER_CODE_TAKEN',
    message: 'Mã người dùng đã được dùng.',
  },
  ORG_UNIT_NOT_FOUND: {
    status: HttpStatus.BAD_REQUEST,
    code: 'ORG_UNIT_NOT_FOUND',
    message: 'Đơn vị không tồn tại.',
  },
  CANNOT_DISABLE_SELF: {
    status: HttpStatus.BAD_REQUEST,
    code: 'CANNOT_DISABLE_SELF',
    message: 'Không thể tự vô hiệu hóa tài khoản của mình.',
  },
  ROLE_NOT_ASSIGNABLE: {
    status: HttpStatus.BAD_REQUEST,
    code: 'ROLE_NOT_ASSIGNABLE',
    message: 'Vai trò này được suy ra từ phân công, không gán tay.',
  },
  SCOPE_INVALID: {
    status: HttpStatus.BAD_REQUEST,
    code: 'SCOPE_INVALID',
    message: 'Phạm vi không hợp lệ cho vai trò đã chọn.',
  },
  ASSIGNMENT_OVERLAP: {
    status: HttpStatus.CONFLICT,
    code: 'ASSIGNMENT_OVERLAP',
    message:
      'Người dùng đã có vai trò này với cùng phạm vi trong khoảng thời gian đó.',
  },
  ASSIGNMENT_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'ASSIGNMENT_NOT_FOUND',
    message: 'Không tìm thấy phân quyền.',
  },
  ASSIGNMENT_ALREADY_REVOKED: {
    status: HttpStatus.CONFLICT,
    code: 'ASSIGNMENT_ALREADY_REVOKED',
    message: 'Phân quyền này đã được thu hồi.',
  },
  CANNOT_CHANGE_OWN_ROLES: {
    status: HttpStatus.BAD_REQUEST,
    code: 'CANNOT_CHANGE_OWN_ROLES',
    message: 'Không thể tự thay đổi vai trò của mình.',
  },
} as const satisfies Record<string, ErrorDefinition>;
