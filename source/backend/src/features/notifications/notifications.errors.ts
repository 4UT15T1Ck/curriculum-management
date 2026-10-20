import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../../shared/exception/error-definition.js';

export const NOTIFICATION_ERRORS = {
  NOTIFICATION_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'NOTIFICATION_NOT_FOUND',
    message: 'Không tìm thấy thông báo.',
  },
} as const satisfies Record<string, ErrorDefinition>;
