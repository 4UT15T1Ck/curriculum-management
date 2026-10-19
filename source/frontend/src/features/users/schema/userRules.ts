import type { Rule } from 'antd/es/form';

export const USERNAME_RULES: Rule[] = [
  { required: true, message: 'Nhập tên đăng nhập' },
  { min: 3, max: 64, message: 'Tên đăng nhập dài 3–64 ký tự' },
  {
    pattern: /^[a-zA-Z0-9._-]+$/,
    message: 'Chỉ dùng chữ không dấu, số và . _ -',
  },
];
export const USER_CODE_RULES: Rule[] = [
  { required: true, message: 'Nhập mã người dùng' },
  { max: 32 },
];
export const FULL_NAME_RULES: Rule[] = [
  { required: true, message: 'Nhập họ tên' },
  { max: 200 },
];
export const EMAIL_RULES: Rule[] = [
  { type: 'email', message: 'Email không hợp lệ' },
];
