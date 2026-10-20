import { HttpStatus } from '@nestjs/common';
import type { ErrorDefinition } from '../exception/error-definition.js';

// The rules of a group's membership rows; F-03's screens and the organisational apply of F-14 share them.
export const MEMBERSHIP_ERRORS = {
  SUBJECT_GROUP_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'SUBJECT_GROUP_NOT_FOUND',
    message: 'Không tìm thấy nhóm chuyên môn.',
  },
  SUBJECT_GROUP_INACTIVE: {
    status: HttpStatus.CONFLICT,
    code: 'SUBJECT_GROUP_INACTIVE',
    message: 'Nhóm chuyên môn đang ngừng sử dụng.',
  },
  LECTURER_INVALID: {
    status: HttpStatus.BAD_REQUEST,
    code: 'LECTURER_INVALID',
    message: 'Người được chọn không tồn tại hoặc đã bị vô hiệu hóa.',
  },
  MEMBERSHIP_OVERLAP: {
    status: HttpStatus.CONFLICT,
    code: 'MEMBERSHIP_OVERLAP',
    message:
      'Người này đã có vai trò này trong nhóm trong khoảng thời gian đó.',
  },
  COORDINATOR_NOT_MEMBER: {
    status: HttpStatus.BAD_REQUEST,
    code: 'COORDINATOR_NOT_MEMBER',
    message:
      'Hãy gán người này làm thành viên của nhóm trong suốt khoảng thời gian trước khi chỉ định Điều phối.',
  },
  MEMBER_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'MEMBER_NOT_FOUND',
    message: 'Không tìm thấy dòng thành viên.',
  },
  MEMBER_ALREADY_REVOKED: {
    status: HttpStatus.CONFLICT,
    code: 'MEMBER_ALREADY_REVOKED',
    message: 'Dòng thành viên này đã được thu hồi.',
  },
  END_DATE_NOT_EARLIER: {
    status: HttpStatus.BAD_REQUEST,
    code: 'END_DATE_NOT_EARLIER',
    message: 'Chỉ được rút ngắn thời hạn; muốn kéo dài hãy thêm dòng mới.',
  },
} as const satisfies Record<string, ErrorDefinition>;
