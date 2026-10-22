import { fileURLToPath } from 'node:url';

export const accounts = {
  R1: process.env.E2E_ADMIN_USERNAME || 'admin',
  R2: 'r2.lanhdao',
  R3: 'r3.giamdoc',
  R3b: 'r3.giamdoc2',
  R4: 'r4.dieuphoi',
  R4b: 'r4.dieuphoi2',
  R5: 'r5.giangvien',
  R5b: 'r5.giangvien2',
  R6: 'r6.sinhvien',
} as const;

export type AccountRole = keyof typeof accounts;

export function authStatePath(role: AccountRole): string {
  const username = accounts[role];
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    throw new Error('Tên đăng nhập E2E chỉ được chứa chữ, số, dấu chấm, gạch dưới và gạch ngang.');
  }
  return fileURLToPath(new URL(`../.auth/${username}.json`, import.meta.url));
}

export function asRole(role: AccountRole) {
  return { storageState: authStatePath(role) };
}
