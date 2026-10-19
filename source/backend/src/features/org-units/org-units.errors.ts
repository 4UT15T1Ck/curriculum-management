import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../../shared/exception/error-definition.js';

export const ORG_UNIT_ERRORS = {
  ORG_UNIT_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'ORG_UNIT_NOT_FOUND',
    message: 'Không tìm thấy đơn vị.',
  },
  UNIT_CODE_TAKEN: {
    status: HttpStatus.CONFLICT,
    code: 'UNIT_CODE_TAKEN',
    message: 'Mã đơn vị đã tồn tại.',
  },
  PARENT_INVALID: {
    status: HttpStatus.BAD_REQUEST,
    code: 'PARENT_INVALID',
    message: 'Đơn vị cha không hợp lệ cho loại đơn vị này.',
  },
  PARENT_CYCLE: {
    status: HttpStatus.BAD_REQUEST,
    code: 'PARENT_CYCLE',
    message:
      'Không thể đặt đơn vị cha là chính nó hoặc đơn vị cấp dưới của nó.',
  },
  PARENT_INACTIVE: {
    status: HttpStatus.CONFLICT,
    code: 'PARENT_INACTIVE',
    message: 'Đơn vị cha đang ngừng hoạt động.',
  },
  ROOT_UNIT_LOCKED: {
    status: HttpStatus.CONFLICT,
    code: 'ROOT_UNIT_LOCKED',
    message: 'Không thể ngừng hoạt động hoặc di chuyển đơn vị gốc.',
  },
  UNIT_HAS_ACTIVE_CHILDREN: {
    status: HttpStatus.CONFLICT,
    code: 'UNIT_HAS_ACTIVE_CHILDREN',
    message: 'Đơn vị còn đơn vị con đang hoạt động.',
  },
  UNIT_HAS_ACTIVE_GROUPS: {
    status: HttpStatus.CONFLICT,
    code: 'UNIT_HAS_ACTIVE_GROUPS',
    message: 'Đơn vị còn nhóm chuyên môn đang sử dụng.',
  },
} as const satisfies Record<string, ErrorDefinition>;
