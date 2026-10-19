import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from './error-definition.js';

export const COMMON_ERRORS = {
  VALIDITY_INVALID: {
    status: HttpStatus.BAD_REQUEST,
    code: 'VALIDITY_INVALID',
    message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.',
  },
  VALIDATION_FAILED: {
    status: HttpStatus.BAD_REQUEST,
    code: 'VALIDATION_FAILED',
    message: 'Dữ liệu gửi lên không hợp lệ.',
  },
  SESSION_REQUIRED: {
    status: HttpStatus.UNAUTHORIZED,
    code: 'SESSION_REQUIRED',
    message:
      'Phiên làm việc đã hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại.',
  },
  PASSWORD_CHANGE_REQUIRED: {
    status: HttpStatus.FORBIDDEN,
    code: 'PASSWORD_CHANGE_REQUIRED',
    message: 'Bạn cần đổi mật khẩu trước khi tiếp tục.',
  },
  PERMISSION_DENIED: {
    status: HttpStatus.FORBIDDEN,
    code: 'PERMISSION_DENIED',
    message: 'Bạn không có quyền thực hiện thao tác này.',
  },
  OUT_OF_SCOPE: {
    status: HttpStatus.FORBIDDEN,
    code: 'OUT_OF_SCOPE',
    message: 'Đối tượng này nằm ngoài phạm vi được phân công của bạn.',
  },
  CHANGE_REQUEST_REQUIRED: {
    status: HttpStatus.CONFLICT,
    code: 'CHANGE_REQUEST_REQUIRED',
    message: 'Dữ liệu này chỉ thay đổi được qua đề xuất thay đổi.',
  },
  CSRF_HEADER_MISSING: {
    status: HttpStatus.FORBIDDEN,
    code: 'CSRF_HEADER_MISSING',
    message: 'Yêu cầu không hợp lệ.',
  },
  INTERNAL_ERROR: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    code: 'INTERNAL_ERROR',
    message: 'Hệ thống gặp lỗi, vui lòng thử lại sau.',
  },
} as const satisfies Record<string, ErrorDefinition>;

export const ERRORS_BY_STATUS: Partial<Record<HttpStatus, ErrorDefinition>> = {
  [HttpStatus.BAD_REQUEST]: {
    status: HttpStatus.BAD_REQUEST,
    code: 'BAD_REQUEST',
    message: 'Yêu cầu không hợp lệ.',
  },
  [HttpStatus.UNAUTHORIZED]: {
    status: HttpStatus.UNAUTHORIZED,
    code: 'UNAUTHORIZED',
    message: 'Bạn chưa đăng nhập.',
  },
  [HttpStatus.FORBIDDEN]: {
    status: HttpStatus.FORBIDDEN,
    code: 'FORBIDDEN',
    message: 'Bạn không có quyền thực hiện thao tác này.',
  },
  [HttpStatus.NOT_FOUND]: {
    status: HttpStatus.NOT_FOUND,
    code: 'NOT_FOUND',
    message: 'Không tìm thấy.',
  },
  [HttpStatus.CONFLICT]: {
    status: HttpStatus.CONFLICT,
    code: 'CONFLICT',
    message: 'Dữ liệu đã bị thay đổi, vui lòng tải lại.',
  },
};

export const UNMAPPED_CLIENT_ERROR_CODE = 'REQUEST_FAILED';
export const UNMAPPED_CLIENT_ERROR_MESSAGE = 'Yêu cầu không thực hiện được.';
