import { expect, test } from '@playwright/test';
import { asRole } from '../fixtures/accounts.js';
import { acceptMismatch, creditRow, openConsistency } from '../fixtures/consistency.js';
import { createCourse } from '../fixtures/courses.js';
import { addCurriculumItem, assignElectiveItems, createElectiveGroup, setRequisite } from '../fixtures/curriculum.js';
import { createProgram } from '../fixtures/programs.js';
import { addRelation } from '../fixtures/relations.js';

test.describe('F-08 Kiểm tra nhất quán', () => {
  test.use(asRole('R1'));

  test('F08-TC_001 Kiểm tra tổng dùng tối thiểu hai nhóm tự chọn', async ({ page }) => {
    test.setTimeout(120_000);
    const program = await createProgram(page);
    const compulsory = await createCourse(page);
    const first = await createCourse(page);
    const second = await createCourse(page);
    await addCurriculumItem(page, program.curriculumPath, compulsory);
    await addCurriculumItem(page, program.curriculumPath, first, { elective: true });
    await addCurriculumItem(page, program.curriculumPath, second, { elective: true });
    const firstGroup = await createElectiveGroup(page, program.curriculumPath, '1');
    await assignElectiveItems(page, firstGroup.code, [first]);
    const secondGroup = await createElectiveGroup(page, program.curriculumPath, '1.5');
    await assignElectiveItems(page, secondGroup.code, [second]);
    await openConsistency(page, program.curriculumPath, program.code);
    await expect(creditRow(page, 'Tổng')).toHaveText('Tổng105-5');
  });

  test('F08-TC_002 Kiểm tra học phần không tín chỉ giữ phần lẻ', async ({ page }) => {
    const program = await createProgram(page, { compulsory: '2.5', elective: '0', total: '2.5' });
    const zero = await createCourse(page, { credits: '0' });
    const fractional = await createCourse(page);
    await addCurriculumItem(page, program.curriculumPath, zero, { credits: '0' });
    await addCurriculumItem(page, program.curriculumPath, fractional);
    await openConsistency(page, program.curriculumPath, program.code);
    await expect(creditRow(page, 'Tổng')).toHaveText('Tổng2.52.50');
  });

  test('F08-TC_003 Kiểm tra tổng tính lại sau thêm dòng', async ({ page }) => {
    const program = await createProgram(page);
    await openConsistency(page, program.curriculumPath, program.code);
    await expect(creditRow(page, 'Tổng')).toHaveText('Tổng100-10');
    const course = await createCourse(page);
    await addCurriculumItem(page, program.curriculumPath, course);
    await openConsistency(page, program.curriculumPath, program.code);
    await expect(creditRow(page, 'Tổng')).toHaveText('Tổng102.5-7.5');
  });

  test('F08-TC_004 Kiểm tra cảnh báo lệch không chặn lưu khung', async ({ page }) => {
    const program = await createProgram(page);
    const course = await createCourse(page);
    await addCurriculumItem(page, program.curriculumPath, course);
    await openConsistency(page, program.curriculumPath, program.code);
    await expect(page.getByText('Tín chỉ khai báo: 10 (bắt buộc 5, tự chọn 5); tính từ khung: 2.5 (bắt buộc 2.5, tự chọn 0); chênh lệch 7.5.', { exact: true })).toBeVisible();
  });

  test('F08-TC_005 Kiểm tra lý do bắt buộc', async ({ page }) => {
    const program = await createProgram(page);
    await openConsistency(page, program.curriculumPath, program.code);
    await page.getByRole('button', { name: 'Chấp nhận chênh lệch', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Chấp nhận', exact: true }).click();
    await expect(page.getByText('Nhập lý do chấp nhận chênh lệch.', { exact: true })).toBeVisible();
  });

  test('F08-TC_006 Kiểm tra lý do chỉ có khoảng trắng', async ({ page }) => {
    const program = await createProgram(page);
    await openConsistency(page, program.curriculumPath, program.code);
    await page.getByRole('button', { name: 'Chấp nhận chênh lệch', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Lý do', { exact: true }).fill('   ');
    await dialog.getByRole('button', { name: 'Chấp nhận', exact: true }).click();
    await expect(page.getByText('Nhập lý do chấp nhận chênh lệch.', { exact: true })).toBeVisible();
  });

  test('F08-TC_007 Kiểm tra chấp nhận và xem lại lý do', async ({ page }) => {
    const program = await createProgram(page);
    const reason = `Ngoại lệ đào tạo ${program.code}`;
    await openConsistency(page, program.curriculumPath, program.code);
    await acceptMismatch(page, reason);
    await page.reload();
    const acceptance = page.locator('.ant-card').filter({ has: page.getByText('Đã chấp nhận chênh lệch', { exact: true }) });
    await expect(acceptance.getByText(reason, { exact: true })).toBeVisible();
    await expect(acceptance.getByText('Người chấp nhận', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Chấp nhận chênh lệch', exact: true })).toHaveCount(0);
  });

  test('F08-TC_008 Kiểm tra chênh lệch thay đổi hết hiệu lực chấp nhận', async ({ page }) => {
    const program = await createProgram(page);
    await openConsistency(page, program.curriculumPath, program.code);
    await acceptMismatch(page, `Ngoại lệ ${program.code}`);
    const course = await createCourse(page);
    await addCurriculumItem(page, program.curriculumPath, course);
    await openConsistency(page, program.curriculumPath, program.code);
    await expect(page.getByText('Đã hết hiệu lực — chênh lệch đã đổi', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Chấp nhận chênh lệch', exact: true })).toBeVisible();
  });

  test('F08-TC_009 Kiểm tra tiên quyết ở kỳ sau', async ({ page }) => {
    const program = await createProgram(page);
    const source = await createCourse(page);
    const target = await createCourse(page);
    await addCurriculumItem(page, program.curriculumPath, source, { semester: '3' });
    await addCurriculumItem(page, program.curriculumPath, target, { semester: '2' });
    await setRequisite(page, target, source);
    await openConsistency(page, program.curriculumPath, program.code);
    await expect(page.getByRole('listitem').filter({ hasText: `${target.code} (học kỳ 2) cần ${source.code} trước, nhưng ${source.code} xếp ở học kỳ 3.` })).toBeVisible();
  });

  test('F08-TC_011 Kiểm tra tiên quyết ngoài khung', async ({ page }) => {
    const source = await createCourse(page);
    const target = await createCourse(page);
    await addRelation(page, target, source, 'Cần đạt tiên quyết học phần', '2');
    const program = await createProgram(page);
    await addCurriculumItem(page, program.curriculumPath, target);
    await openConsistency(page, program.curriculumPath, program.code);
    await expect(page.getByRole('listitem').filter({ hasText: `${target.code} cần ${source.code} (tiên quyết), nhưng ${source.code} không có trong khung.` })).toBeVisible();
  });

  test('F08-TC_014 Kiểm tra khung trống', async ({ page }) => {
    const program = await createProgram(page);
    await openConsistency(page, program.curriculumPath, program.code);
    await expect(creditRow(page, 'Tổng')).toHaveText('Tổng100-10');
    await expect(page.getByRole('listitem').filter({ hasText: 'Học kỳ 1 chưa có học phần nào.' })).toBeVisible();
  });

  test('F08-TC_015 Kiểm tra nhóm không đủ tối thiểu', async ({ page }) => {
    const program = await createProgram(page);
    const group = await createElectiveGroup(page, program.curriculumPath, '6');
    await openConsistency(page, program.curriculumPath, program.code);
    await expect(page.getByRole('listitem').filter({ hasText: `Nhóm ${group.code} yêu cầu tối thiểu 6 tín chỉ, nhưng các học phần trong nhóm chỉ có 0 tín chỉ (0 học phần).` })).toBeVisible();
    await expect(page.getByText('Còn lỗi: chưa gửi duyệt hoặc ban hành được phiên bản này.', { exact: true })).toBeVisible();
  });

  test('F08-TC_016 Kiểm tra tự chọn chưa thuộc nhóm', async ({ page }) => {
    const program = await createProgram(page);
    const course = await createCourse(page);
    await addCurriculumItem(page, program.curriculumPath, course, { elective: true });
    await openConsistency(page, program.curriculumPath, program.code);
    await expect(page.getByRole('listitem').filter({ hasText: `${course.code} là học phần tự chọn nhưng chưa thuộc nhóm nào nên không được tính vào tổng tín chỉ.` })).toBeVisible();
    await expect(creditRow(page, 'Tổng')).toHaveText('Tổng100-10');
  });
});
