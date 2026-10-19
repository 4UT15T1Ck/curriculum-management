import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../exception/error-definition.js';

export const FILE_ERRORS = {
  FILE_MISSING: {
    status: HttpStatus.NOT_FOUND,
    code: 'FILE_MISSING',
    message: 'Không tìm thấy tệp trên máy chủ. Hãy báo quản trị viên hệ thống.',
  },
} as const satisfies Record<string, ErrorDefinition>;
