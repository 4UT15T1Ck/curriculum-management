import { expect, test } from '@playwright/test';
import { asRole } from '../fixtures/accounts.js';
import { createCourse, openSeedCourse } from '../fixtures/courses.js';
import { chooseOption } from '../fixtures/select.js';
import { uniqueSuffix } from '../fixtures/unique.js';
import {
  addRelation,
  courseDetails,
  courseRelationRow,
  createCoursePair,
  createEquivalenceGroup,
  equivalenceGroupRow,
  prepareRelation,
} from '../fixtures/relations.js';

test.describe('F-05 Quan hệ học phần, nhóm tương đương', () => {
  test.use(asRole('R1'));

  test('F05-TC_001 Kiểm tra quan hệ hai đầu', async ({ page }) => {
    const { first, second } = await createCoursePair(page);
    await addRelation(page, first, second, 'Là học phần học trước của');
    await expect(courseRelationRow(page, first, second).getByRole('cell', { name: 'Là học phần học trước của', exact: true })).toBeVisible();
    await page.goto(second.path);
    await expect(courseRelationRow(page, second, first).getByRole('cell', { name: 'Cần học trước học phần', exact: true })).toBeVisible();
    await expect(courseRelationRow(page, second, first).getByRole('link', { name: `${first.code} — ${first.name}`, exact: true })).toBeVisible();
  });

  test('F05-TC_002 Kiểm tra quan hệ hai đầu', async ({ page }) => {
    const { first, second } = await createCoursePair(page);
    await addRelation(page, first, second, 'Học song hành với');
    await expect(courseRelationRow(page, first, second).getByRole('cell', { name: 'Học song hành với', exact: true })).toBeVisible();
    await page.goto(second.path);
    await expect(courseRelationRow(page, second, first).getByRole('cell', { name: 'Học song hành với', exact: true })).toBeVisible();
    await expect(courseRelationRow(page, second, first).getByRole('link', { name: `${first.code} — ${first.name}`, exact: true })).toBeVisible();
  });

  test('F05-TC_003 Kiểm tra quan hệ hai đầu', async ({ page }) => {
    const { first, second } = await createCoursePair(page);
    await addRelation(page, first, second, 'Được thay thế bởi');
    await expect(courseRelationRow(page, first, second).getByRole('cell', { name: 'Được thay thế bởi', exact: true })).toBeVisible();
    await page.goto(second.path);
    await expect(courseRelationRow(page, second, first).getByRole('cell', { name: 'Thay thế cho', exact: true })).toBeVisible();
    await expect(courseRelationRow(page, second, first).getByRole('link', { name: `${first.code} — ${first.name}`, exact: true })).toBeVisible();
  });
  test('F05-TC_004 Kiểm tra ngưỡng điểm 2.5', async ({ page }) => {
    const { first, second } = await createCoursePair(page);
    await addRelation(page, first, second, 'Cần đạt tiên quyết học phần', '2.5');
    await expect(courseRelationRow(page, first, second).getByRole('cell', { name: /^2\.5/ })).toBeVisible();
  });

  test('F05-TC_005 Kiểm tra ngưỡng bỏ trống', async ({ page }) => {
    const { first, second } = await createCoursePair(page);
    await addRelation(page, first, second, 'Cần đạt tiên quyết học phần');
    await expect(courseRelationRow(page, first, second).getByRole('cell', { name: /^—( |$)/ })).toBeVisible();
  });

  test('F05-TC_006 Kiểm tra trùng quan hệ riêng', async ({ page }) => {
    const { first, second } = await createCoursePair(page);
    await addRelation(page, first, second, 'Là học phần học trước của');
    const dialog = await prepareRelation(page, first, second, 'Là học phần học trước của');
    await dialog.getByRole('button', { name: 'Lưu', exact: true }).click();
    await expect(dialog.getByText('Hai học phần này đã có quan hệ loại này.', { exact: true })).toBeVisible();
  });

  test('F05-TC_007 Kiểm tra máy chủ chặn tự tham chiếu', async ({ page }) => {
    const course = await createCourse(page);
    const courseId = course.path.split('/').at(-1)!;
    const response = await page.request.post('/api/course-relations', {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      data: { sourceCourseId: courseId, targetCourseId: courseId, relationType: 'PRIOR' },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ code: 'RELATION_SELF', message: 'Không khai báo được quan hệ của một học phần với chính nó.' });
  });

  test('F05-TC_008 Kiểm tra vòng ba học phần trộn loại', async ({ page }) => {
    const { first, second } = await createCoursePair(page);
    const third = await createCourse(page);
    await addRelation(page, first, second, 'Là học phần tiên quyết của');
    await addRelation(page, second, third, 'Là học phần học trước của');
    const dialog = await prepareRelation(page, third, first, 'Là học phần tiên quyết của');
    await dialog.getByRole('button', { name: 'Lưu', exact: true }).click();
    await expect(dialog.getByText(`Quan hệ này tạo thành vòng học trước/tiên quyết nên không lưu được. Đường đi của vòng: ${first.code} → ${second.code} → ${third.code} → ${first.code}.`, { exact: true })).toBeVisible();
  });

  test('F05-TC_009 Kiểm tra vòng hai học phần', async ({ page }) => {
    const { first, second } = await createCoursePair(page);
    await addRelation(page, first, second, 'Là học phần tiên quyết của');
    const dialog = await prepareRelation(page, second, first, 'Là học phần tiên quyết của');
    await dialog.getByRole('button', { name: 'Lưu', exact: true }).click();
    await expect(dialog.getByText(`Quan hệ này tạo thành vòng học trước/tiên quyết nên không lưu được. Đường đi của vòng: ${first.code} → ${second.code} → ${first.code}.`, { exact: true })).toBeVisible();
  });

  test('F05-TC_013 Kiểm tra ngưỡng không hợp lệ -0.01', async ({ page }) => {
    const { first, second } = await createCoursePair(page);
    const dialog = await prepareRelation(page, first, second, 'Cần đạt tiên quyết học phần', '-0.01');
    await dialog.getByRole('button', { name: 'Lưu', exact: true }).click();
    await expect(dialog.getByText('Ngưỡng điểm theo thang 4: từ 0 đến 4, tối đa 2 chữ số thập phân (ví dụ 2 hoặc 2.5).', { exact: true })).toBeVisible();
  });

  test('F05-TC_014 Kiểm tra ngưỡng không hợp lệ 4.01', async ({ page }) => {
    const { first, second } = await createCoursePair(page);
    const dialog = await prepareRelation(page, first, second, 'Cần đạt tiên quyết học phần', '4.01');
    await dialog.getByRole('button', { name: 'Lưu', exact: true }).click();
    await expect(dialog.getByText('Ngưỡng điểm theo thang 4: từ 0 đến 4, tối đa 2 chữ số thập phân (ví dụ 2 hoặc 2.5).', { exact: true })).toBeVisible();
  });

  test('F05-TC_015 Kiểm tra ngưỡng không hợp lệ 2.555', async ({ page }) => {
    const { first, second } = await createCoursePair(page);
    const dialog = await prepareRelation(page, first, second, 'Cần đạt tiên quyết học phần', '2.555');
    await dialog.getByRole('button', { name: 'Lưu', exact: true }).click();
    await expect(dialog.getByText('Ngưỡng điểm theo thang 4: từ 0 đến 4, tối đa 2 chữ số thập phân (ví dụ 2 hoặc 2.5).', { exact: true })).toBeVisible();
  });

  test('F05-TC_016 Kiểm tra ngưỡng biên 0', async ({ page }) => {
    const { first, second } = await createCoursePair(page);
    await addRelation(page, first, second, 'Cần đạt tiên quyết học phần', '0');
    await expect(courseRelationRow(page, first, second).getByRole('cell', { name: /^0( |$)/ })).toBeVisible();
  });

  test('F05-TC_017 Kiểm tra ngưỡng biên 4', async ({ page }) => {
    const { first, second } = await createCoursePair(page);
    await addRelation(page, first, second, 'Cần đạt tiên quyết học phần', '4');
    await expect(courseRelationRow(page, first, second).getByRole('cell', { name: /^4( |$)/ })).toBeVisible();
  });
  test('F05-TC_018 Kiểm tra loại quan hệ bắt buộc', async ({ page }) => {
    const course = await createCourse(page);
    await courseDetails(page, course).getByRole('button', { name: 'Thêm quan hệ', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Lưu', exact: true }).click();
    await expect(page.getByText('Chọn loại quan hệ.', { exact: true })).toBeVisible();
  });

  test('F05-TC_020 Kiểm tra học phần riêng chưa có quan hệ', async ({ page }) => {
    const course = await createCourse(page);
    const details = courseDetails(page, course);
    await expect(details.getByText('Chưa có quan hệ nào', { exact: true })).toBeVisible();
    await expect(details.getByText('Chưa thuộc nhóm tương đương nào', { exact: true })).toBeVisible();
  });

  test('F05-TC_022 Kiểm tra nhóm tương đương hai chiều', async ({ page }) => {
    const { first, second } = await createCoursePair(page);
    await createEquivalenceGroup(page, [first, second]);
    await page.goto(first.path);
    await expect(courseDetails(page, first).getByRole('link', { name: `${second.code} — ${second.name}`, exact: true })).toBeVisible();
    await page.goto(second.path);
    await expect(courseDetails(page, second).getByRole('link', { name: `${first.code} — ${first.name}`, exact: true })).toBeVisible();
  });

  test('F05-TC_023 Kiểm tra tương đương bắc cầu', async ({ page }) => {
    const { first, second } = await createCoursePair(page);
    const third = await createCourse(page);
    const group = await createEquivalenceGroup(page, [first, second]);
    await equivalenceGroupRow(page, group.code).getByRole('button', { name: 'Thêm học phần', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await chooseOption(page, dialog.getByLabel('Học phần', { exact: true }), `${third.code} — ${third.name} (2.5 TC)`, { search: third.code });
    await dialog.getByRole('button', { name: 'Thêm', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await page.goto(third.path);
    await expect(courseDetails(page, third).getByRole('link', { name: `${first.code} — ${first.name}`, exact: true })).toBeVisible();
    await expect(courseDetails(page, third).getByRole('link', { name: `${second.code} — ${second.name}`, exact: true })).toBeVisible();
    await page.goto(first.path);
    await expect(courseDetails(page, first).getByRole('link', { name: `${second.code} — ${second.name}`, exact: true })).toBeVisible();
    await expect(courseDetails(page, first).getByRole('link', { name: `${third.code} — ${third.name}`, exact: true })).toBeVisible();
  });

  test('F05-TC_024 Kiểm tra học phần đã thuộc nhóm khác', async ({ page }) => {
    const firstPair = await createCoursePair(page);
    const secondPair = await createCoursePair(page);
    const firstGroup = await createEquivalenceGroup(page, [firstPair.first, firstPair.second]);
    const secondGroup = await createEquivalenceGroup(page, [secondPair.first, secondPair.second]);
    await equivalenceGroupRow(page, secondGroup.code).getByRole('button', { name: 'Thêm học phần', exact: true }).click();
    const dialog = page.getByRole('dialog');
    const course = firstPair.first;
    await chooseOption(page, dialog.getByLabel('Học phần', { exact: true }), `${course.code} — ${course.name} (2.5 TC)`, { search: course.code });
    await dialog.getByRole('button', { name: 'Thêm', exact: true }).click();
    await expect(dialog.getByText(`Học phần đã thuộc một nhóm tương đương khác; hãy gộp hai nhóm: ${course.code} (nhóm ${firstGroup.code}).`, { exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Gộp nhóm', exact: true })).toBeVisible();
  });

  test('F05-TC_027 Kiểm tra dữ liệu nhóm tương đương', async ({ page }) => {
    await page.goto('/equivalence-groups');
    await page.getByRole('button', { name: 'Tạo nhóm', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Mã nhóm', { exact: true }).fill('');
    await dialog.getByRole('button', { name: 'Lưu', exact: true }).click();
    await expect(dialog.getByText('Nhập mã nhóm.', { exact: true })).toBeVisible();
  });

  test('F05-TC_028 Kiểm tra dữ liệu nhóm tương đương', async ({ page }) => {
    await page.goto('/equivalence-groups');
    await page.getByRole('button', { name: 'Tạo nhóm', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Mã nhóm', { exact: true }).fill('EEEEEEEEEEEEEEEEEEEEE');
    await dialog.getByRole('button', { name: 'Lưu', exact: true }).click();
    await expect(dialog.getByText('Mã nhóm tối đa 20 ký tự.', { exact: true })).toBeVisible();
  });

  test('F05-TC_029 Kiểm tra dữ liệu nhóm tương đương', async ({ page }) => {
    await page.goto('/equivalence-groups');
    await page.getByRole('button', { name: 'Tạo nhóm', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Ghi chú', { exact: true }).fill('NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN');
    await dialog.getByRole('button', { name: 'Lưu', exact: true }).click();
    await expect(dialog.getByText('Ghi chú tối đa 500 ký tự.', { exact: true })).toBeVisible();
  });
  test('F05-TC_030 Kiểm tra nhóm cần ít nhất hai học phần', async ({ page }) => {
    await page.goto('/equivalence-groups');
    await page.getByRole('button', { name: 'Tạo nhóm', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Mã nhóm', { exact: true }).fill(`EQ${uniqueSuffix()}`);
    await dialog.getByRole('button', { name: 'Lưu', exact: true }).click();
    await expect(dialog.getByText('Chọn ít nhất 2 học phần.', { exact: true })).toBeVisible();
  });

  test('F05-TC_036 Kiểm tra tìm nhóm không có kết quả', async ({ page }) => {
    await page.goto('/equivalence-groups');
    const search = page.getByPlaceholder('Tìm theo mã nhóm hoặc mã học phần', { exact: true });
    await search.fill(`NO${uniqueSuffix()}`);
    await search.press('Enter');
    await expect(page.getByText('Chưa có nhóm tương đương', { exact: true })).toBeVisible();
  });

  test.describe('R2', () => {
    test.use(asRole('R2'));
    test('F05-TC_040 Kiểm tra R2 chỉ xem quan hệ', async ({ page }) => {
      await openSeedCourse(page, 'PRG101');
      await expect(page.getByText('Quan hệ học phần', { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Thêm quan hệ', exact: true })).toHaveCount(0);
    });
  });

  test.describe('R6', () => {
    test.use(asRole('R6'));
    test('F05-TC_041 Kiểm tra R6 chỉ xem quan hệ', async ({ page }) => {
      await openSeedCourse(page, 'PRG101');
      await expect(page.getByText('Quan hệ học phần', { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Thêm quan hệ', exact: true })).toHaveCount(0);
    });
  });
});
