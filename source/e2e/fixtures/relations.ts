import { expect, type Page } from '@playwright/test';
import { createCourse } from './courses.js';
import { chooseOption } from './select.js';
import { chooseMultipleOption } from './multiselect.js';
import { uniqueSuffix } from './unique.js';

type TestCourse = Awaited<ReturnType<typeof createCourse>>;

export function courseDetails(page: Page, course: TestCourse) {
  return page.getByRole('main').filter({
    has: page.getByRole('heading', { name: `${course.code} — ${course.name}`, exact: true, level: 2 }),
  });
}

export function courseRelationRow(page: Page, current: TestCourse, other: TestCourse) {
  return courseDetails(page, current).getByRole('row').filter({
    has: page.getByRole('link', { name: `${other.code} — ${other.name}`, exact: true }),
  });
}

export function equivalenceGroupRow(page: Page, groupCode: string) {
  return page.getByRole('row').filter({
    has: page.getByRole('cell', { name: groupCode, exact: true }),
  });
}

export async function createCoursePair(page: Page) {
  const first = await createCourse(page);
  const second = await createCourse(page);
  return { first, second };
}

export async function prepareRelation(page: Page, current: TestCourse, other: TestCourse, choice: string, score?: string) {
  await page.goto(current.path);
  await courseDetails(page, current).getByRole('button', { name: 'Thêm quan hệ', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await chooseOption(page, dialog.getByLabel(current.code, { exact: true }), choice);
  await chooseOption(page, dialog.getByLabel('Học phần', { exact: true }), `${other.code} — ${other.name} (2.5 TC)`, { search: other.code });
  if (score !== undefined) await dialog.getByLabel('Ngưỡng điểm', { exact: true }).fill(score);
  return dialog;
}

export async function addRelation(page: Page, current: TestCourse, other: TestCourse, choice: string, score?: string) {
  const dialog = await prepareRelation(page, current, other, choice, score);
  await dialog.getByRole('button', { name: 'Lưu', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(courseRelationRow(page, current, other).getByRole('link', { name: `${other.code} — ${other.name}`, exact: true })).toBeVisible();
}

export async function createEquivalenceGroup(page: Page, courses: TestCourse[]) {
  const code = `EQ${uniqueSuffix()}`;
  await page.goto('/equivalence-groups');
  await page.getByRole('button', { name: 'Tạo nhóm', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Mã nhóm', { exact: true }).fill(code);
  for (const course of courses) {
    await chooseMultipleOption(page, dialog.getByLabel('Học phần trong nhóm', { exact: true }), `${course.code} — ${course.name} (2.5 TC)`, course.code);
  }
  await dialog.getByRole('button', { name: 'Lưu', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  const search = page.getByPlaceholder('Tìm theo mã nhóm hoặc mã học phần', { exact: true });
  await search.fill(code);
  await search.press('Enter');
  await expect(equivalenceGroupRow(page, code).getByRole('cell', { name: code, exact: true })).toBeVisible();
  return { code };
}
