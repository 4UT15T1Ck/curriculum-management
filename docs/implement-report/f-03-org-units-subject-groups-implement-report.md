# F-03 Đơn vị và nhóm chuyên môn — Implement Report

Kế hoạch: `docs/implementation/f-03-org-units-subject-groups-implementation-plan.md`. Tệp này ghi những gì **đã dựng**; kế hoạch ghi những gì định dựng.

## Status

| Mục | Trạng thái |
|---|---|
| Tiến độ | BE-01..BE-06, FE-01..FE-06, DOC-01 xong (2026-10-19) |
| Nhánh | `claude/keen-meitner-2y7yf1` |
| Cơ sở dữ liệu | Migration `20261019024639_subject_groups` áp được lên cơ sở dữ liệu trống trong bộ kiểm thử đầu-cuối (3 migration). Không nạp seed nhóm chuyên môn (kế hoạch: R1 tự nhập trên MH-08) |
| Hiệu lực lúc chạy | R1 quản lý cây đơn vị (MH-07) và nhóm chuyên môn (MH-08); R4, R5 tự theo hàng thành viên; R2 và R4 đã xem được MH-08 theo ô seed của F-02 |
| Còn nợ | Đi thử 6 bước bằng trình duyệt (chưa làm); chưa áp migration lên cơ sở dữ liệu phát triển |

### Kết quả kiểm tra (2026-10-19)

| Dự án | Kiểu | Lint | Đơn vị | Đầu-cuối | Khác |
|---|---|---|---|---|---|
| backend | `tsc --noEmit` 0 lỗi | oxlint 0 | 101/101 (21 tệp) | 69/69 (7 tệp, Testcontainers) | Prettier sạch |
| frontend | `tsc -b` 0 lỗi | oxlint 0 | 44/44 (16 tệp) | — | `vite build` ổn; Prettier sạch |

---

## Summary

| ID | Phạm vi | Kiểm bằng | Ghi chú |
|---|---|---|---|
| BE-01 | `prisma/schema.prisma`, migration `20261019024639_subject_groups` | tsc, đầu-cuối (áp migration) | Không lệch |
| BE-02 | `src/shared/time/validity.ts`, `src/shared/subject-groups/active-membership.ts`, `src/shared/authz/scope-source.reader.ts`, role assignments của F-02 | đơn vị | Không lệch |
| BE-03 | `src/features/org-units/*` | đơn vị service, đầu-cuối | Không lệch |
| BE-04 | `src/features/subject-groups/` (nhóm, ảnh hưởng khi ngừng) | đơn vị service, đầu-cuối | Không lệch |
| BE-05 | thành viên, Điều phối, `GET /subject-group-memberships` | đơn vị service, đầu-cuối | Không lệch |
| BE-06 | `test/{org-units,subject-groups}.e2e-spec.ts`, `test/fixtures/subject-groups.ts`, `test/permission-table.ts` | `pnpm test:e2e` 69/69 | Các ca gộp thành 15 ca `it` thay vì mỗi dòng bảng một ca; vẫn phủ mọi dòng của bảng kế hoạch |
| FE-01 | `permissions.ts`, `routes.ts`, `router.tsx`, `menuItems.tsx`, `shared/validity/validity.ts` | tsc, `vite build` | Sửa lỗi — xem Incident 4 |
| FE-02 | `shared/subject-groups/*`, `shared/users/*` | đơn vị | Sửa lỗi — xem Incident 1 |
| FE-03 | `features/org-units/*` | đơn vị | Sửa lỗi và kiểm thử — xem Incident 2, 3 |
| FE-04 | `features/subject-groups/` (danh sách) | đơn vị | Sửa kiểm thử — xem Incident 2 |
| FE-05 | `features/subject-groups/` (chi tiết) | đơn vị | Sửa kiểm thử — xem Incident 2 |
| FE-06 | `features/users/{api,hooks,components}/*SubjectGroup*` | tsc, đơn vị | Không lệch |
| DOC-01 | `docs/architecture/*`, `docs/progress/*`, `docs/implementation/README.md`, tệp này | đối chiếu đường dẫn với mã | `docs/technical/technical_reference.md` không đổi (không thêm thư viện) |

---

## Incidents

### 1. `UserSelect` đẩy cả đối tượng lựa chọn lên `onChange`
- **Triệu chứng**: `UserSelect.test.tsx` — `onChange` được gọi với `('u1', { label, value })`, kiểm thử đòi `('u1')`.
- **Cơ chế**: `Select` của AntD gọi `onChange(value, option)`; thành phần truyền thẳng `onChange`, trong khi kiểu khai báo và kế hoạch FE-02 chỉ trao id.
- **Sửa**: thành phần (không phải kiểm thử) — `onChange={(next) => onChange?.(next)}`.

### 2. Kiểm thử trang không có router, không tắt retry, chờ thiếu
- **Triệu chứng**: `OrgUnitTreePage` và `SubjectGroupListPage` — chữ không tìm thấy, lỗi "Cannot destructure property 'basename' of useContext(...) as it is null"; `SubjectGroupDetailPage` — không thấy chữ 403; một ca không thấy nút "Ngừng sử dụng".
- **Cơ chế**:
  - Cả hai trang dùng `<Link>` (kế hoạch FE-03, FE-04) nhưng kiểm thử dựng không bọc router → cây React sập, thân trang rỗng. Sửa kiểm thử: bọc `MemoryRouter`.
  - Ca 403 dùng `new QueryClient()` mặc định (thử lại 3 lần có độ trễ) nên truy vấn còn `isPending` quá hạn chờ; `queryClient.ts` của ứng dụng đã không thử lại lỗi 4xx. Các kiểm thử trang khác của F-02 đều đặt `retry: false`. Sửa kiểm thử cho khớp.
  - Ca ngừng nhóm lấy nút bằng `getByRole` ngay sau khi nút "Thêm nhóm" (hiện trước dữ liệu) xuất hiện; đổi sang `findByRole`.
- Không có ca nào bị bỏ, xóa hay nới điều kiện kiểm.

### 3. Cây đơn vị không mở nút cha vừa có con đầu tiên
- **Triệu chứng**: ca "tạo khoa rồi nạp lại danh sách" — sau khi tạo, "Khoa Toán" không hiện.
- **Cơ chế**: `defaultExpandAll` của `Tree` chỉ tính lúc gắn; khi Trường chưa có con thì nó là lá, nên khoa thêm sau nằm dưới nút đóng. Đây là lỗi thật (cơ sở dữ liệu mới chỉ có Trường), kiểm thử đúng.
- **Sửa**: thành phần — `expandedKeys` có điều khiển: mọi đơn vị mở trừ nút người dùng đã thu lại.
- Cùng ca đó dùng `findByText('Trường')` nhưng tên và thẻ loại đều là "Trường" (đúng kế hoạch FE-03) nên có hai phần tử; kiểm thử đổi sang `findAllByText(...)` kiểm đúng hai.

### 4. Menu có hai cặp mục trùng
- **Triệu chứng**: `APP_MENU` chứa "Đơn vị" và "Nhóm chuyên môn" hai lần (khóa React trùng).
- **Sửa**: giữ một cặp, đặt sau "Tài khoản" như kế hoạch FE-01.

---

## Lệch kế hoạch và còn nợ

- Đi thử bằng trình duyệt chưa làm; ghi ở `docs/progress/todo.md`.
- Seed bốn nhóm chuyên môn: không làm theo kế hoạch (không có mã, tên trong tài liệu nguồn).
- Chưa kiểm tay bằng trình duyệt các điểm kế hoạch ghi "Verify: browser" (thêm khoa thấy ngay ở `OrgUnitSelect` MH-05).

## Lessons worth keeping

- Kiểm thử trang có `<Link>` hoặc hook router phải bọc router; lỗi hiện ra là thân trang rỗng, không phải thông báo rõ ràng.
- Kiểm thử dựng `QueryClient` riêng phải đặt `retry: false` khi kiểm trạng thái lỗi.
- `defaultExpandAll` của AntD `Tree` chỉ có hiệu lực lúc gắn; dữ liệu đổi sau đó cần `expandedKeys` có điều khiển.
