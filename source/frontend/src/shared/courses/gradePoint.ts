// Mirrors GRADE_POINT_PATTERN and GRADE_POINT_MESSAGE in source/backend/src/shared/decimal/decimal.ts:
// the 4-point scale, 0 to 4 with at most two decimals. Shared by the catalog relations and the curriculum row forms.
export const GRADE_POINT_PATTERN = /^(4(\.0{1,2})?|[0-3](\.\d{1,2})?)$/;
export const GRADE_POINT_MESSAGE =
  'Ngưỡng điểm theo thang 4: từ 0 đến 4, tối đa 2 chữ số thập phân (ví dụ 2 hoặc 2.5).';
