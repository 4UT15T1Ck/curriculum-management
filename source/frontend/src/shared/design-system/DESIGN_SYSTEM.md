# Design System — Component Anatomy

Tài liệu tham chiếu cho mọi AI agent và developer khi build UI.
**Đọc file này trước khi tạo bất kỳ component FE nào.**

---

## Aesthetic Direction

**Enterprise Clarity + Warm Functional**

| Attribute | Value |
|-----------|-------|
| Target audience | Cán bộ trường đại học Việt Nam (đa vai trò, trung niên) |
| Visual mood | Structured, informative, approachable |
| Reference brands | Notion (dense + clean), Stripe Docs (info hierarchy), Linear (motion craft) |

**Design Dials (fixed):**
- `DESIGN_VARIANCE` = 4/10 — predictable grid, không daring
- `MOTION_INTENSITY` = 3/10 — purposeful, không decorative
- `VISUAL_DENSITY` = 7/10 — info-rich dashboard

---

## Component Decision Tree

Trước khi tạo bất kỳ component mới nào:

```
Ant Design 6 có sẵn không?
  └─ Có → Dùng trực tiếp. Không wrap. Không copy.
  └─ Không → Pattern này lặp ≥ 2 lần không?
       └─ Không → Giữ inline trong component.
       └─ Có → Đã có trong src/shared/design-system/ chưa?
             └─ Có → Dùng component đó.
             └─ Không → Tạo mới vào src/shared/design-system/.
```

---

## Atom Layer — Dùng AntD trực tiếp

Những component này **có sẵn trong Ant Design 6**. Dùng trực tiếp, không tạo wrapper.

| Component | AntD import | Notes |
|-----------|-------------|-------|
| Button | `Button` | `type="primary"` cho CTA chính, `danger` cho destructive |
| Input | `Input`, `Input.Search`, `Input.Password` | `allowClear` khi optional |
| Tag | `Tag` | Màu qua `colorMap` constant |
| Alert | `Alert` | `type=warning/error/info/success` |
| Popconfirm | `Popconfirm` | Thao tác destructive nhẹ |
| Modal (confirm) | `App.useApp().modal.confirm()` | Dùng hook, không `Modal.confirm()` |
| Skeleton | `Skeleton active` | Loading state cho content block |
| Spin | `Spin` | Loading cho action hoặc inline |
| Form | `Form layout="vertical"` + `Form.Item rules={...}` | Layout mặc định vertical |
| Select | `Select` | `allowClear` khi không bắt buộc |
| Descriptions | `Descriptions column={2}` | Chi tiết thực thể |
| Card | `Card title={...} extra={...}` | Wrapper section chính |
| Space | `Space`, `Flex` | Layout inline |
| Result | `Result status="error/404/403"` | Error/empty page states |
| Tree | `Tree` | Cây đơn vị tổ chức |
| Dropdown | `Dropdown menu={...}` | Menu dropdown |
| Typography | `Typography.Title/Text/Paragraph` | Không dùng raw HTML heading |

---

## Molecule Layer — `src/shared/design-system/`

Pattern lặp lại mà AntD không cover đủ. **Dùng các component này thay vì tự inline.**

### `StatusTag`

```tsx
import { StatusTag } from '../../../shared/design-system/index.js';

// Thay thế:
// <Tag color={USER_STATUS_COLORS[user.status]}>{USER_STATUS_LABELS[user.status]}</Tag>

<StatusTag
  status={user.status}
  colorMap={USER_STATUS_COLORS}
  labelMap={USER_STATUS_LABELS}
/>
```

**Khi nào dùng:** Bất kỳ status enum nào cần hiển thị với màu.

---

### `PageHeader`

```tsx
import { PageHeader } from '../../../shared/design-system/index.js';

// Thay thế:
// <Typography.Title level={2}>Tài khoản</Typography.Title>
// <Button type="primary">Thêm tài khoản</Button>

<PageHeader
  title="Tài khoản"
  actions={<Button type="primary" onClick={() => setCreating(true)}>Thêm tài khoản</Button>}
/>
```

**Khi nào dùng:** Header của mọi trang có title.

---

### `EmptyState`

```tsx
import { EmptyState } from '../../../shared/design-system/index.js';

// Thay thế:
// locale={{ emptyText: 'Chưa có tài khoản' }} trên Table

<EmptyState
  description="Chưa có thành viên nào trong nhóm"
  actionLabel="Thêm thành viên"
  onAction={() => setMemberRole('MEMBER')}
/>
```

**Khi nào dùng:** Danh sách rỗng, đặc biệt khi có action để tạo item đầu tiên.

---

## Organism Layer — `src/shared/design-system/`

### `DataTable<T>`

```tsx
import { DataTable } from '../../../shared/design-system/index.js';

// Thay thế pattern lặp lại ở mọi list page:
// <Table rowKey="id" columns={columns} dataSource={data?.items ?? []} loading={isPending}
//   locale={{ emptyText: '...' }}
//   pagination={{ current, pageSize, total, pageSizeOptions, showSizeChanger, onChange }} />

<DataTable<UserSummary>
  rowKey="id"
  columns={columns}
  dataSource={data?.items ?? []}
  total={data?.total ?? 0}
  page={params.page}
  pageSize={params.pageSize}
  loading={isPending}
  emptyText="Chưa có tài khoản nào"
  onPageChange={(page, pageSize) =>
    setParams((p) => ({ ...p, page, pageSize }))
  }
/>
```

**Khi nào dùng:** Mọi trang danh sách có server-side pagination.

---

## Template Layer — `src/shared/design-system/`

### `DetailPageLayout`

```tsx
import { DetailPageLayout } from '../../../shared/design-system/index.js';

// Thay thế:
// <Flex vertical gap="middle"> ... </Flex>

<DetailPageLayout>
  <UserInfoCard user={user} />
  <RoleAssignmentsCard userId={userId} />
</DetailPageLayout>
```

**Khi nào dùng:** Trang chi tiết với nhiều Card xếp dọc.

---

### `ListPageLayout`

```tsx
import { ListPageLayout, PageHeader, DataTable } from '../../../shared/design-system/index.js';

// Thay thế:
// <Space direction="vertical" size="middle" style={{ width: '100%' }}>
//   <Typography.Title level={2}>...</Typography.Title>
//   <Space wrap>...</Space>
//   <Table .../>
// </Space>

<ListPageLayout
  header={
    <PageHeader
      title="Tài khoản"
      actions={<Button type="primary">Thêm tài khoản</Button>}
    />
  }
  filters={
    <>
      <Input.Search placeholder="Tìm tài khoản" ... />
      <Select placeholder="Trạng thái" ... />
    </>
  }
  table={
    <DataTable<UserSummary> ... />
  }
/>
```

**Khi nào dùng:** Mọi trang danh sách.

---

## Motion Rules (Emil Kowalski)

> Tất cả rules dưới đây được enforce globally qua `motion.css` (import trong `main.tsx`).
> Không cần thêm CSS riêng cho button :active hoặc modal entrance.

| Situation | Duration | Easing |
|-----------|----------|--------|
| Button :active | 100ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Tooltip, badge | 150ms | ease-out |
| Dropdown, popover | 180ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Modal, drawer | 250ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Onboarding (rare) | 400ms | spring |

**GPU rules:**
- ✅ Animate: `transform`, `opacity`, `filter` (cẩn thận)
- ❌ Không animate: `width`, `height`, `margin`, `padding`, `top`, `left`

---

## Copy Rules

| Tình huống | ✅ Đúng | ❌ Sai |
|-----------|--------|-------|
| Empty state | "Chưa có thành viên nào" | "Không có dữ liệu" |
| Error | "Tên đăng nhập đã tồn tại" | "Đã có lỗi xảy ra" |
| Button | "Thêm tài khoản" | "Thêm" |
| Destructive | "Vô hiệu hóa" | "Xóa?" |
| Toast | "Đã thêm tài khoản" | "Thành công!" |
| 404 | "Không tìm thấy tài khoản" | "Lỗi 404" |

---

## Anti-Slop Checklist

Trước khi submit/save bất kỳ UI nào:

- [ ] Không hardcode hex color trong JSX (dùng `colorMap` constant hoặc AntD token)
- [ ] Status dùng `StatusTag` (không inline `<Tag color={...}>`)
- [ ] List page dùng `DataTable` (không tự wire pagination)
- [ ] Page header dùng `PageHeader` (không `<Typography.Title level={2}>` standalone)
- [ ] Không 3+ Card giống hệt liên tiếp
- [ ] Empty state có description specific + optional action
- [ ] Error message specific + actionable
- [ ] Tất cả animation custom ≤ 300ms (nếu có)
