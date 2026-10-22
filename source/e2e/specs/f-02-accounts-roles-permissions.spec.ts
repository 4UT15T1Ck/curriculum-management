import { expect, test } from '@playwright/test';
import { asRole } from '../fixtures/accounts.js';
import { chooseOption } from '../fixtures/select.js';
import { uniqueSuffix } from '../fixtures/unique.js';
import { createUser, prepareUser, userDetails } from '../fixtures/users.js';

test.describe('F-02 Tài khoản, vai trò, phạm vi quyền', () => {
  test.use(asRole('R1'));

  test('F02-TC_001 Kiểm tra tạo tài khoản hoạt động', async ({ page }) => {
    const user = await prepareUser(page);
    const dialog = page.getByRole('dialog');
    // OrgUnitSelect does not forward the Form.Item id to its combobox.
    await chooseOption(page, dialog.getByRole('combobox'), 'Khoa Công nghệ Thông tin');
    await dialog.getByRole('button', { name: 'Đồng ý', exact: true }).click();
    const password = page.getByRole('dialog', { name: `Mật khẩu tạm thời — ${user.username}`, exact: true });
    await expect(password).toBeVisible();
    await password.getByRole('button', { name: 'Đồng ý', exact: true }).click();
    const search = page.getByPlaceholder('Tìm tài khoản', { exact: true });
    await search.fill(user.username);
    await search.press('Enter');
    await page.getByRole('link', { name: user.name, exact: true }).click();
    const details = userDetails(page, user.username);
    await expect(details.getByText('Hoạt động', { exact: true })).toBeVisible();
    await expect(details.getByText('Cần đổi khi đăng nhập', { exact: true })).toBeVisible();
  });

  test('F02-TC_003 Kiểm tra trùng tên đăng nhập riêng', async ({ page }) => {
    const user = await createUser(page);
    await prepareUser(page);
    await page.getByLabel('Tên đăng nhập', { exact: true }).fill(user.username);
    await page.getByRole('dialog').getByRole('button', { name: 'Đồng ý', exact: true }).click();
    await expect(page.getByRole('dialog').getByText('Tên đăng nhập đã được dùng.', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Tên đăng nhập', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  });

  test('F02-TC_004 Kiểm tra trùng mã người dùng riêng', async ({ page }) => {
    const user = await createUser(page);
    await prepareUser(page);
    await page.getByLabel('Mã người dùng', { exact: true }).fill(user.userCode);
    await page.getByRole('dialog').getByRole('button', { name: 'Đồng ý', exact: true }).click();
    await expect(page.getByRole('dialog').getByText('Mã người dùng đã được dùng.', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Mã người dùng', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  });

  test('F02-TC_005 Kiểm tra không có xóa tài khoản', async ({ page }) => {
    const user = await createUser(page);
    const details = userDetails(page, user.username);
    await expect(details.getByRole('button', { name: 'Xóa', exact: true })).toHaveCount(0);
    await expect(details.getByRole('button', { name: 'Vô hiệu hóa', exact: true })).toBeVisible();
  });

  test('F02-TC_011 Kiểm tra dữ liệu Tên đăng nhập', async ({ page }) => {
    await prepareUser(page);
    await page.getByLabel('Tên đăng nhập', { exact: true }).fill('');
    await page.getByRole('dialog').getByRole('button', { name: 'Đồng ý', exact: true }).click();
    await expect(page.getByText('Nhập tên đăng nhập', { exact: true })).toBeVisible();
  });

  test('F02-TC_012 Kiểm tra dữ liệu Tên đăng nhập', async ({ page }) => {
    await prepareUser(page);
    await page.getByLabel('Tên đăng nhập', { exact: true }).fill('ab');
    await page.getByRole('dialog').getByRole('button', { name: 'Đồng ý', exact: true }).click();
    await expect(page.getByText('Tên đăng nhập dài 3–64 ký tự', { exact: true })).toBeVisible();
  });

  test('F02-TC_013 Kiểm tra dữ liệu Tên đăng nhập', async ({ page }) => {
    await prepareUser(page);
    await page.getByLabel('Tên đăng nhập', { exact: true }).fill('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    await page.getByRole('dialog').getByRole('button', { name: 'Đồng ý', exact: true }).click();
    await expect(page.getByText('Tên đăng nhập dài 3–64 ký tự', { exact: true })).toBeVisible();
  });

  test('F02-TC_014 Kiểm tra dữ liệu Tên đăng nhập', async ({ page }) => {
    await prepareUser(page);
    await page.getByLabel('Tên đăng nhập', { exact: true }).fill('giảng viên');
    await page.getByRole('dialog').getByRole('button', { name: 'Đồng ý', exact: true }).click();
    await expect(page.getByText('Chỉ dùng chữ không dấu, số và . _ -', { exact: true })).toBeVisible();
  });

  test('F02-TC_017 Kiểm tra dữ liệu Mã người dùng', async ({ page }) => {
    await prepareUser(page);
    await page.getByLabel('Mã người dùng', { exact: true }).fill('');
    await page.getByRole('dialog').getByRole('button', { name: 'Đồng ý', exact: true }).click();
    await expect(page.getByText('Nhập mã người dùng', { exact: true })).toBeVisible();
  });

  test('F02-TC_018 Kiểm tra dữ liệu Họ tên', async ({ page }) => {
    await prepareUser(page);
    await page.getByLabel('Họ tên', { exact: true }).fill('');
    await page.getByRole('dialog').getByRole('button', { name: 'Đồng ý', exact: true }).click();
    await expect(page.getByText('Nhập họ tên', { exact: true })).toBeVisible();
  });

  test('F02-TC_019 Kiểm tra dữ liệu Email', async ({ page }) => {
    await prepareUser(page);
    await page.getByLabel('Email', { exact: true }).fill('not-an-email');
    await page.getByRole('dialog').getByRole('button', { name: 'Đồng ý', exact: true }).click();
    await expect(page.getByText('Email không hợp lệ', { exact: true })).toBeVisible();
  });
  test('F02-TC_024 Kiểm tra tìm không có kết quả', async ({ page }) => {
    await page.goto('/users');
    const search = page.getByPlaceholder('Tìm tài khoản', { exact: true });
    await search.fill(`NO${uniqueSuffix()}`);
    await search.press('Enter');
    await expect(page.getByText('Chưa có tài khoản', { exact: true })).toBeVisible();
  });

  test('F02-TC_025 Kiểm tra sửa họ tên tài khoản riêng', async ({ page }) => {
    const user = await createUser(page);
    const name = `Tên đổi ${uniqueSuffix()}`;
    const details = userDetails(page, user.username);
    await details.getByRole('button', { name: 'Sửa', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Họ tên', { exact: true }).fill(name);
    await dialog.getByRole('button', { name: 'Đồng ý', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(details.getByText(name, { exact: true })).toBeVisible();
    await expect(details.getByText(user.username, { exact: true })).toBeVisible();
  });

  test('F02-TC_026 Kiểm tra vô hiệu hóa tài khoản riêng', async ({ page }) => {
    const user = await createUser(page);
    const details = userDetails(page, user.username);
    await details.getByRole('button', { name: 'Vô hiệu hóa', exact: true }).click();
    await page.getByRole('dialog', { name: 'Vô hiệu hóa tài khoản?', exact: true }).getByRole('button', { name: 'Đồng ý', exact: true }).click();
    await expect(details.getByText('Vô hiệu hóa', { exact: true })).toBeVisible();
    await expect(details.getByRole('button', { name: 'Kích hoạt lại', exact: true })).toBeVisible();
  });

  test('F02-TC_031 Kiểm tra gán vai trò toàn hệ thống cho tài khoản riêng', async ({ page }) => {
    const user = await createUser(page);
    const details = userDetails(page, user.username);
    await details.getByRole('button', { name: 'Gán vai trò', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await chooseOption(page, dialog.getByLabel('Vai trò', { exact: true }), 'R2 — Ban lãnh đạo khoa');
    await dialog.getByRole('button', { name: 'Đồng ý', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    const assignment = details.getByRole('row').filter({
      has: page.getByRole('cell', { name: 'R2 — Ban lãnh đạo khoa', exact: true }),
    });
    await expect(assignment.getByRole('cell', { name: 'R2 — Ban lãnh đạo khoa', exact: true })).toBeVisible();
    await expect(assignment.getByRole('cell', { name: 'Toàn hệ thống', exact: true })).toBeVisible();
  });

  test('F02-TC_037 Kiểm tra xem mọi vai trò và quyền', async ({ page }) => {
    await page.goto('/permissions');
    await expect(page.getByRole('heading', { name: 'Ma trận quyền', exact: true })).toBeVisible();
    for (const role of ['R1', 'R2', 'R3', 'R4', 'R5', 'R6']) {
      await expect(page.getByRole('columnheader', { name: new RegExp(`^${role} `) })).toBeVisible();
    }
    await expect(page.getByText('user.manage', { exact: true })).toBeVisible();
    await expect(page.getByText('permission.manage', { exact: true })).toBeVisible();
  });

  test.describe('R2', () => {
    test.use(asRole('R2'));
    test('F02-TC_047 Kiểm tra R2 không quản lý tài khoản', async ({ page }) => {
      await page.goto('/users');
      await expect(page.getByText('Bạn không có quyền truy cập trang này', { exact: true })).toBeVisible();
    });
  });

  test.describe('R3', () => {
    test.use(asRole('R3'));
    test('F02-TC_048 Kiểm tra R3 không quản lý tài khoản', async ({ page }) => {
      await page.goto('/users');
      await expect(page.getByText('Bạn không có quyền truy cập trang này', { exact: true })).toBeVisible();
    });
  });

  test.describe('R4', () => {
    test.use(asRole('R4'));
    test('F02-TC_049 Kiểm tra R4 không quản lý tài khoản', async ({ page }) => {
      await page.goto('/users');
      await expect(page.getByText('Bạn không có quyền truy cập trang này', { exact: true })).toBeVisible();
    });
  });

  test.describe('R5', () => {
    test.use(asRole('R5'));
    test('F02-TC_050 Kiểm tra R5 không quản lý tài khoản', async ({ page }) => {
      await page.goto('/users');
      await expect(page.getByText('Bạn không có quyền truy cập trang này', { exact: true })).toBeVisible();
    });
    test('F02-TC_030 Kiểm tra R5 gọi thẳng quản trị', async ({ page, browser, baseURL }) => {
      await page.goto('/courses');
      const suffix = uniqueSuffix();
      const username = `e2e.denied.${suffix.toLowerCase()}`;
      const response = await page.request.post('/api/users', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        data: { username, userCode: `DEN${suffix}`, fullName: `Không được tạo ${suffix}` },
      });
      expect(response.status()).toBe(403);
      expect(await response.json()).toMatchObject({ code: 'PERMISSION_DENIED', message: 'Bạn không có quyền thực hiện thao tác này.' });
      const admin = await browser.newContext({ ...asRole('R1'), baseURL, locale: 'vi-VN', timezoneId: 'Asia/Ho_Chi_Minh' });
      try {
        const reader = await admin.newPage();
        await reader.goto('/users');
        const search = reader.getByPlaceholder('Tìm tài khoản', { exact: true });
        await search.fill(username);
        await search.press('Enter');
        await expect(reader.getByText('Chưa có tài khoản', { exact: true })).toBeVisible();
      } finally {
        await admin.close();
      }
    });
  });

  test.describe('R6', () => {
    test.use(asRole('R6'));
    test('F02-TC_051 Kiểm tra R6 không quản lý tài khoản', async ({ page }) => {
      await page.goto('/users');
      await expect(page.getByText('Bạn không có quyền truy cập trang này', { exact: true })).toBeVisible();
    });
  });
});
