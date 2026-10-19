// Mirrors CREDITS_PATTERN and CREDITS_MESSAGE in source/backend/src/shared/decimal/decimal.ts:
// Decimal(5,2), up to three integer digits and two decimals. Shared by every form that enters credits.
export const CREDITS_PATTERN = /^\d{1,3}(\.\d{1,2})?$/;
export const CREDITS_MESSAGE =
  'Số tín chỉ phải là số từ 0 đến 999.99, tối đa 2 chữ số thập phân (ví dụ 3, 2.5 hoặc 0).';
