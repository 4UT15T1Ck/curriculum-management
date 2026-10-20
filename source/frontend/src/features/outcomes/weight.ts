// Mirrors WEIGHT_PATTERN in source/backend/src/features/outcomes/course-plo-matrix.dto.ts:
// a number in (0, 1] with at most two decimals.
export const WEIGHT_PATTERN = /^(?:0\.(?:0[1-9]|[1-9]\d?)|1(?:\.00?)?)$/;

// Vietnamese users type "0,5"; the wire format is "0.5".
export const normalizeWeight = (value: string) =>
  value.trim().replace(',', '.');

export const isValidWeight = (value: string) =>
  WEIGHT_PATTERN.test(normalizeWeight(value));

export const formatWeight = (wire: string) =>
  Number(wire).toLocaleString('vi-VN', { maximumFractionDigits: 2 });
