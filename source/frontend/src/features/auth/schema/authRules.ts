import type { FormRule } from 'antd';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
const PASSWORD_PATTERN = /^(?=.*\p{L})(?=.*\d).+$/u;
export const REQUIRED_USERNAME: FormRule[] = [
  { required: true, message: 'Nhập tên đăng nhập' },
];
export const REQUIRED_PASSWORD: FormRule[] = [
  { required: true, message: 'Nhập mật khẩu' },
];
export const NEW_PASSWORD_RULES: FormRule[] = [
  { required: true, message: 'Nhập mật khẩu mới' },
  {
    min: PASSWORD_MIN_LENGTH,
    message: `Mật khẩu có ít nhất ${PASSWORD_MIN_LENGTH} ký tự`,
  },
  { max: PASSWORD_MAX_LENGTH },
  { pattern: PASSWORD_PATTERN, message: 'Mật khẩu phải có cả chữ và số' },
];
