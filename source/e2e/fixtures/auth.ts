import { type Page } from '@playwright/test';

export async function login(page: Page, username: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Tên đăng nhập', { exact: true }).fill(username);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
}

export async function fillPasswordChange(page: Page, current: string, next: string, confirmation = next) {
  await page.getByLabel('Mật khẩu hiện tại', { exact: true }).fill(current);
  await page.getByLabel('Mật khẩu mới', { exact: true }).fill(next);
  await page.getByLabel('Nhập lại mật khẩu mới', { exact: true }).fill(confirmation);
  await page.getByRole('button', { name: 'Đổi mật khẩu', exact: true }).click();
}
