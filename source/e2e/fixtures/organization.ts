import { expect, type Page } from '@playwright/test';
import { chooseOption } from './select.js';
import { uniqueSuffix } from './unique.js';

export async function createOrgUnit(page: Page) {
  const suffix = uniqueSuffix();
  const code = `E2EU${suffix}`;
  const name = `Khoa thử ${suffix}`;
  await page.goto('/org-units');
  await page.getByRole('button', { name: 'Thêm đơn vị', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Mã đơn vị', { exact: true }).fill(code);
  await dialog.getByLabel('Tên đơn vị', { exact: true }).fill(name);
  await dialog.getByRole('button', { name: 'Đồng ý', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('tree').getByText(name)).toBeVisible();
  return { code, name };
}

export async function createSubjectGroup(page: Page) {
  const suffix = uniqueSuffix();
  const code = `E2EG${suffix}`;
  const name = `Nhóm thử ${suffix}`;
  await page.goto('/subject-groups');
  await page.getByRole('button', { name: 'Thêm nhóm', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Mã nhóm', { exact: true }).fill(code);
  await dialog.getByLabel('Tên nhóm', { exact: true }).fill(name);
  // OrgUnitSelect does not forward the Form.Item id to its combobox.
  await chooseOption(page, dialog.getByRole('combobox'), 'Khoa Công nghệ Thông tin');
  await dialog.getByRole('button', { name: 'Đồng ý', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('link', { name, exact: true })).toBeVisible();
  return { code, name };
}
