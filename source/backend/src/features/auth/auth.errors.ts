import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../../shared/exception/error-definition.js';

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: {
    status: HttpStatus.UNAUTHORIZED,
    code: 'INVALID_CREDENTIALS',
    message: 'Tên đăng nhập hoặc mật khẩu không đúng.',
  },
  ACCOUNT_DISABLED: {
    status: HttpStatus.FORBIDDEN,
    code: 'ACCOUNT_DISABLED',
    message: 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ Phòng Đào tạo.',
  },
  CURRENT_PASSWORD_WRONG: {
    status: HttpStatus.BAD_REQUEST,
    code: 'CURRENT_PASSWORD_WRONG',
    message: 'Mật khẩu hiện tại không đúng.',
  },
  PASSWORD_UNCHANGED: {
    status: HttpStatus.BAD_REQUEST,
    code: 'PASSWORD_UNCHANGED',
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại.',
  },
} as const satisfies Record<string, ErrorDefinition>;
