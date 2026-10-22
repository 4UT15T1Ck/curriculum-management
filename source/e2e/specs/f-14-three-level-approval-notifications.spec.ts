import { expect, test } from '@playwright/test';
import { asRole } from '../fixtures/accounts.js';
import {
  addRequestComment, advanceRequest, approveRequest, buildAdminReleaseProgram, buildPendingRequest,
  decideRequest, decisionRemark, fixtureApi, openRequestHistory, requestHeading, seedRequest,
  submitRequest, withRequestRole,
} from '../fixtures/change-requests.js';
import { chooseSegment } from '../fixtures/curriculum.js';
import { chooseOption } from '../fixtures/select.js';
import { uniqueSuffix } from '../fixtures/unique.js';

test.describe('F-14 Duyệt ba cấp, bình luận, thông báo', () => {
  test.describe('R4 cấp chuyên môn', () => {
    test.use(asRole('R4'));

    test('F14-TC_001 Hàng đợi đúng người duyệt', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await page.goto('/approval-queue');
      const row = page.getByRole('row').filter({ hasText: request.requestCode });
      await expect(row).toContainText(request.title);
      await expect(row).toContainText('Chờ Điều phối duyệt');
      await expect(row).toContainText('ThS. Đặng Thị Lan');
    });

    test('F14-TC_003 Cột, lọc loại và sắp hàng đợi', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await page.goto('/approval-queue');
      await chooseOption(page, page.getByRole('combobox', { name: 'Loại đề xuất', exact: true }), 'Nội dung đề cương');
      const row = page.getByRole('row').filter({ hasText: request.requestCode });
      await expect(row).toContainText(request.title);
      await expect(row).toContainText('Nội dung đề cương');
      await expect(row).toContainText('ThS. Đặng Thị Lan');
      await expect(row).toContainText(/\d{2}\/\d{2}\/\d{4}/);
      await expect(page.getByRole('columnheader', { name: /Số ngày chờ/ })).toBeVisible();
      await page.getByRole('columnheader', { name: /Số ngày chờ/ }).click();
      await expect(row).toBeVisible();
    });

    test('F14-TC_004 Xử lý xong rời hàng đợi cá nhân', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await page.goto('/approval-queue');
      await expect(page.getByRole('row').filter({ hasText: request.requestCode })).toBeVisible();
      await approveRequest(page, request);
      await page.goto('/approval-queue');
      await expect(page.getByRole('heading', { name: 'Chờ tôi duyệt', exact: true })).toBeVisible();
      await expect(page.getByRole('row').filter({ hasText: request.requestCode })).toHaveCount(0);
    });

    test('F14-TC_009 Đồng ý cấp 1 không đòi bình luận R2', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await approveRequest(page, request);
      await expect(page.getByText('Chờ Giám đốc CTĐT duyệt', { exact: true })).toBeVisible();
    });

    test('F14-TC_011 Trả lại dưới 20 ký tự bị chặn', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await page.goto(`/change-requests/${request.id}`);
      await page.getByRole('button', { name: 'Trả lại', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: 'Trả lại đề xuất' });
      await dialog.getByLabel('Lý do', { exact: true }).fill('a'.repeat(19));
      await dialog.getByRole('button', { name: 'Xác nhận', exact: true }).click();
      await expect(dialog.getByText('Lý do cần ít nhất 20 ký tự.', { exact: true })).toBeVisible();
    });

    test('F14-TC_012 Trả lại đúng 20 ký tự về Nháp', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await decideRequest(page, request, 'Trả lại', 'a'.repeat(20));
      await expect(page.getByText('Nháp', { exact: true })).toBeVisible();
      const history = await openRequestHistory(page);
      await expect(history).toContainText('a'.repeat(20));
      await withRequestRole(browser, 'R5', async (creator) => {
        await creator.goto(`/change-requests/${request.id}/edit`);
        await expect(creator.getByRole('button', { name: 'Sửa nội dung đề cương', exact: true })).toBeVisible();
      });
    });

    test('F14-TC_013 Từ chối đóng đề xuất', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await decideRequest(page, request, 'Từ chối', 'a'.repeat(20));
      await expect(page.getByText('Bị từ chối', { exact: true })).toBeVisible();
      await withRequestRole(browser, 'R5', async (creator) => {
        await creator.goto(`/change-requests/${request.id}/edit`);
        await expect(creator).toHaveURL(new RegExp(`/change-requests/${request.id}$`));
        await expect(creator.getByRole('button', { name: 'Tiếp tục soạn', exact: true })).toHaveCount(0);
        await expect(creator.getByRole('button', { name: /Gửi duyệt$/ })).toHaveCount(0);
      });
    });

    test('F14-TC_022 Điều phối tạo tự bỏ qua cấp 1', async ({ page, browser }) => {
      const program = await buildAdminReleaseProgram(browser);
      const request = await seedRequest(page, program);
      await submitRequest(page, request);
      await expect(page.getByText('Chờ Giám đốc CTĐT duyệt', { exact: true })).toBeVisible();
      await expect(page.getByText('Bỏ qua', { exact: true })).toBeVisible();
      await expect(page.getByText('Người duyệt là người tạo đề xuất', { exact: true })).toBeVisible();
    });

    test('F14-TC_031 Đến cấp hiện tại có thông báo riêng', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await page.goto('/notifications');
      const item = page.getByRole('listitem').filter({ hasText: request.requestCode });
      await expect(item).toContainText(`Đề xuất ${request.requestCode} "${request.title}" đang chờ bạn duyệt (Điều phối nhóm chuyên môn).`);
      await expect(item.locator('strong')).toBeVisible();
    });

    test('F14-TC_034 Mở đúng thông báo đánh dấu đã đọc', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await page.goto('/notifications');
      await chooseSegment(page, 'Chưa đọc');
      const item = page.getByRole('listitem').filter({ hasText: request.requestCode });
      await expect(item.locator('strong')).toBeVisible();
      await item.click();
      await expect(requestHeading(page, request)).toBeVisible();
      await page.goto('/notifications');
      await chooseSegment(page, 'Chưa đọc');
      await expect(page.getByRole('heading', { name: 'Thông báo', exact: true })).toBeVisible();
      await expect(page.getByRole('listitem').filter({ hasText: request.requestCode })).toHaveCount(0);
    });

    test('F14-TC_035 Lịch sử giữ cấp, người, hành động, lý do và giờ', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await decideRequest(page, request, 'Trả lại');
      const history = await openRequestHistory(page);
      await expect(history).toContainText('ThS. Nguyễn Hoàng Anh');
      await expect(history).toContainText('Trả lại');
      await expect(history).toContainText(decisionRemark);
      await expect(history).toContainText(/\d{2}\/\d{2}\/\d{4}/);
    });

    test('F14-TC_047 Từ chối dưới 20 ký tự bị chặn', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await page.goto(`/change-requests/${request.id}`);
      await page.getByRole('button', { name: 'Từ chối', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: 'Từ chối đề xuất' });
      await dialog.getByLabel('Lý do', { exact: true }).fill('a'.repeat(19));
      await dialog.getByRole('button', { name: 'Xác nhận', exact: true }).click();
      await expect(dialog.getByText('Lý do cần ít nhất 20 ký tự.', { exact: true })).toBeVisible();
    });
  });

  test.describe('R3 cấp chương trình', () => {
    test.use(asRole('R3'));
    test('F14-TC_002 Hàng đợi Giám đốc đúng phân công', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await advanceRequest(browser, request, 'coordinator');
      await page.goto('/approval-queue');
      await expect(page.getByRole('row').filter({ hasText: request.requestCode })).toContainText('Chờ Giám đốc CTĐT duyệt');
    });

    test('F14-TC_015 Đồng ý cấp 2 sang Phòng Đào tạo', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await advanceRequest(browser, request, 'coordinator');
      await approveRequest(page, request);
      await expect(page.getByText('Chờ Phòng Đào tạo duyệt', { exact: true })).toBeVisible();
    });

    test('F14-TC_023 Giám đốc tạo tự bỏ qua cấp 2', async ({ page, browser }) => {
      const program = await buildAdminReleaseProgram(browser);
      const request = await seedRequest(page, program, false);
      await submitRequest(page, request);
      await expect(page.getByText('Chờ Phòng Đào tạo duyệt', { exact: true })).toBeVisible();
      await expect(page.getByText('Người duyệt là người tạo đề xuất', { exact: true })).toBeVisible();
    });
  });

  test.describe('R1 cấp cuối và duyệt thay', () => {
    test.use(asRole('R1'));
    test('F14-TC_019 Cấp cuối trả lại rồi đi lại từ cấp 1', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await advanceRequest(browser, request, 'director');
      await decideRequest(page, request, 'Trả lại');
      await expect(page.getByText('Nháp', { exact: true })).toBeVisible();
      await withRequestRole(browser, 'R5', async (creator) => {
        await submitRequest(creator, request);
        await expect(creator.getByText('Chờ Điều phối duyệt', { exact: true })).toBeVisible();
        const history = await openRequestHistory(creator);
        await expect(history).toContainText('Lần gửi 1 —');
        await expect(history).toContainText('Lần gửi 2 —');
      });
    });

    test('F14-TC_020 Cấp cuối từ chối không cho soạn tiếp', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await advanceRequest(browser, request, 'director');
      await decideRequest(page, request, 'Từ chối');
      await expect(page.getByText('Bị từ chối', { exact: true })).toBeVisible();
      await withRequestRole(browser, 'R5', async (creator) => {
        await creator.goto(`/change-requests/${request.id}`);
        await expect(requestHeading(creator, request)).toBeVisible();
        await expect(creator.getByRole('button', { name: 'Tiếp tục soạn', exact: true })).toHaveCount(0);
      });
    });

    test('F14-TC_037 Lịch sử nêu rõ người được duyệt thay', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await fixtureApi(page, 'POST', `/change-requests/${request.id}/override`, { action: 'APPROVE', reason: decisionRemark });
      await page.goto(`/change-requests/${request.id}`);
      const history = await openRequestHistory(page);
      await expect(history).toContainText('Phòng Đào tạo duyệt thay');
      await expect(history).toContainText('Người duyệt: ThS. Nguyễn Hoàng Anh · Thực hiện:');
    });

    test('F14-TC_039 R1 đồng ý thay cấp chuyên môn', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await page.goto(`/change-requests/${request.id}`);
      await page.getByRole('button', { name: 'Duyệt thay', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: 'Duyệt thay', exact: true });
      await expect(dialog.getByRole('radio', { name: 'Đồng ý thay', exact: true })).toBeChecked();
      await dialog.getByLabel('Lý do', { exact: true }).fill(decisionRemark);
      await dialog.getByRole('button', { name: 'Xác nhận', exact: true }).click();
      await expect(dialog).not.toBeVisible();
      await expect(page.getByText('Đã duyệt thay.', { exact: true })).toBeVisible();
      await expect(page.getByText('Chờ Giám đốc CTĐT duyệt', { exact: true })).toBeVisible();
      await expect(page.getByText('Phòng Đào tạo duyệt thay', { exact: true })).toBeVisible();
    });

    test('F14-TC_040 Duyệt thay bắt buộc lý do', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await page.goto(`/change-requests/${request.id}`);
      await page.getByRole('button', { name: 'Duyệt thay', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: 'Duyệt thay', exact: true });
      await dialog.getByRole('button', { name: 'Xác nhận', exact: true }).click();
      await expect(dialog.getByText('Nhập lý do.', { exact: true })).toBeVisible();
    });
  });

  test.describe('R2 chỉ giám sát và bình luận', () => {
    test.use(asRole('R2'));
    test('F14-TC_027 Bình luận được nhưng không xử lý', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await page.goto(`/change-requests/${request.id}`);
      await addRequestComment(page, `Ý kiến ${uniqueSuffix()}`);
      await expect(page.getByRole('button', { name: 'Đồng ý', exact: true })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Trả lại', exact: true })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Từ chối', exact: true })).toHaveCount(0);
    });

    test('F14-TC_028 Bình luận có tác giả, giờ và thứ tự', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      const prefix = `Ý kiến ${uniqueSuffix()}`;
      await page.goto(`/change-requests/${request.id}`);
      const first = await addRequestComment(page, `${prefix} A`);
      await expect(first).toContainText('TS. Lê Văn Minh');
      await expect(first).toContainText(/\d{2}\/\d{2}\/\d{4}/);
      await addRequestComment(page, `${prefix} B`);
      expect(await page.getByRole('listitem').filter({ hasText: prefix }).allTextContents()).toEqual([
        expect.stringContaining(`${prefix} A`), expect.stringContaining(`${prefix} B`),
      ]);
    });

    test('F14-TC_029 Bình luận không sửa xóa được', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      const content = `Ý kiến ${uniqueSuffix()}`;
      await page.goto(`/change-requests/${request.id}`);
      await addRequestComment(page, content);
      await page.reload();
      const item = page.getByRole('listitem').filter({ hasText: content });
      await expect(item).toBeVisible();
      await expect(item.getByRole('button', { name: 'Sửa', exact: true })).toHaveCount(0);
      await expect(item.getByRole('button', { name: 'Xóa', exact: true })).toHaveCount(0);
    });

    test('F14-TC_049 Bình luận trống không gửi được', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await page.goto(`/change-requests/${request.id}`);
      await page.getByRole('button', { name: 'Gửi bình luận', exact: true }).click();
      await expect(page.getByText('Nhập nội dung bình luận.', { exact: true })).toBeVisible();
    });
  });

  test.describe('R5 tác giả', () => {
    test.use(asRole('R5'));
    test('F14-TC_032 Thông báo trả lại kèm lý do', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await withRequestRole(browser, 'R4', (reviewer) => fixtureApi(reviewer, 'POST', `/change-requests/${request.id}/return`, { remark: decisionRemark }));
      await page.goto('/notifications');
      const item = page.getByRole('listitem').filter({ hasText: request.requestCode });
      await expect(item).toContainText('ThS. Nguyễn Hoàng Anh đã trả lại đề xuất');
      await expect(item).toContainText(decisionRemark);
    });

    test('F14-TC_036 Lịch sử giữ các lần gửi', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await withRequestRole(browser, 'R4', (reviewer) => fixtureApi(reviewer, 'POST', `/change-requests/${request.id}/return`, { remark: decisionRemark }));
      await submitRequest(page, request);
      const history = await openRequestHistory(page);
      await expect(history).toContainText('Lần gửi 1 —');
      await expect(history).toContainText('Lần gửi 2 —');
      await expect(history).toContainText(decisionRemark);
    });

    test('F14-TC_044 Người tạo không có hành động duyệt', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await page.goto(`/change-requests/${request.id}`);
      await expect(requestHeading(page, request)).toBeVisible();
      await expect(page.getByRole('button', { name: 'Rút đề xuất', exact: true })).toBeVisible();
      for (const action of ['Đồng ý', 'Trả lại', 'Từ chối', 'Duyệt thay']) await expect(page.getByRole('button', { name: action, exact: true })).toHaveCount(0);
    });
  });

  test.describe('R5 ngoài nhóm', () => {
    test.use(asRole('R5b'));
    test('F14-TC_008 Ngoài phạm vi không đọc hoặc xử lý', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await page.goto(`/change-requests/${request.id}`);
      await expect(page.getByText('Không tìm thấy đề xuất', { exact: true })).toBeVisible();
    });
  });

  test.describe('R4 ngoài nhóm', () => {
    test.use(asRole('R4b'));
    test('F14-TC_014 Không xử lý nhóm khác', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await page.goto(`/change-requests/${request.id}`);
      await expect(page.getByText('Không tìm thấy đề xuất', { exact: true })).toBeVisible();
    });
  });

  test.describe('R3 không được phân công', () => {
    test.use(asRole('R3b'));
    test('F14-TC_018 Không xử lý chương trình khác', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await advanceRequest(browser, request, 'coordinator');
      await page.goto(`/change-requests/${request.id}`);
      await expect(page.getByText('Không tìm thấy đề xuất', { exact: true })).toBeVisible();
    });
  });

  test.describe('R6 không có quyền', () => {
    test.use(asRole('R6'));
    test('F14-TC_045 Không xem chi tiết đề xuất', async ({ page, browser }) => {
      const { request } = await buildPendingRequest(browser);
      await page.goto(`/change-requests/${request.id}`);
      await expect(page.getByText('Bạn không có quyền truy cập trang này', { exact: true })).toBeVisible();
    });
  });
});
