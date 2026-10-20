import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../exception/error-definition.js';

export const CONSISTENCY_ERRORS = {
  VERSION_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'PROGRAM_VERSION_NOT_FOUND',
    message: 'Không tìm thấy phiên bản chương trình.',
  },
  CONSISTENCY_FAILED: {
    status: HttpStatus.CONFLICT,
    code: 'CONSISTENCY_FAILED',
    message: 'Khung chương trình còn lỗi nhất quán; sửa các lỗi rồi thử lại.',
  },
} as const satisfies Record<string, ErrorDefinition>;
