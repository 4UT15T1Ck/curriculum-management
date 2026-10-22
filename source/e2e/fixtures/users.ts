import { expect, type Page } from '@playwright/test';
import { uniqueSuffix } from './unique.js';

export function userDetails(page: Page, username: string) {
  return page.getByRole('main')
    .filter({ has: page.getByText('Thông tin tài khoản', { exact: true }) })
    .filter({ has: page.getByText(username, { exact: true }) });
}

export async function prepareUser(page: Page) {
  const suffix = uniqueSuffix();
  const username = `e2e.${suffix.toLowerCase()}`;
  const userCode = `E2EU${suffix}`;
  const name = `Tài khoản thử ${suffix}`;
  await page.goto('/users');
  await page.getByRole('button', { name: 'Thêm tài khoản', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Tên đăng nhập', { exact: true }).fill(username);
  await dialog.getByLabel('Mã người dùng', { exact: true }).fill(userCode);
  await dialog.getByLabel('Họ tên', { exact: true }).fill(name);
  await dialog.getByLabel('Email', { exact: true }).fill(`${username}@example.test`);
  return { username, userCode, name };
}

export async function createUser(page: Page) {
  const user = await prepareUser(page);
  await page.getByRole('dialog').getByRole('button', { name: 'Đồng ý', exact: true }).click();
  const passwordDialog = page.getByRole('dialog', { name: `Mật khẩu tạm thời — ${user.username}`, exact: true });
  await expect(passwordDialog).toBeVisible();
  await passwordDialog.getByRole('button', { name: 'Đồng ý', exact: true }).click();
  await expect(passwordDialog).not.toBeVisible();
  await openUser(page, user);
  return { ...user, path: new URL(page.url()).pathname };
}

export async function openUser(page: Page, user: { username: string; name: string }) {
  await page.goto('/users');
  const search = page.getByPlaceholder('Tìm tài khoản', { exact: true });
  await search.fill(user.username);
  await search.press('Enter');
  await page.getByRole('link', { name: user.name, exact: true }).click();
  await expect(userDetails(page, user.username).getByText('Thông tin tài khoản', { exact: true })).toBeVisible();
}

export async function createUserWithPassword(page: Page) {
  const user = await prepareUser(page);
  await page.getByRole('dialog').getByRole('button', { name: 'Đồng ý', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: `Mật khẩu tạm thời — ${user.username}`, exact: true });
  await expect(dialog).toBeVisible();
  const password = await dialog.locator('code').innerText();
  await dialog.getByRole('button', { name: 'Đồng ý', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  return { ...user, password };
}
