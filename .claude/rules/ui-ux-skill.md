# UI/UX Design Rules — Frontend (Ant Design 6)

Áp dụng khi build bất kỳ màn hình, component, hoặc layout nào cho `source/frontend`.
Tổng hợp từ: Emil Kowalski motion rules, Impeccable Design guardrails, và Taste principles.

---

## Mandatory First Step: Design Read

Trước bất kỳ công việc UI nào, output dòng này:

> "Reading this as: **[page kind]** for **[audience]**, with a **[vibe]** language, leaning toward **[aesthetic family]**."

**Giá trị mặc định cho dự án này:**
> "Reading this as: **enterprise data management dashboard** for **Vietnamese university staff (multi-role, middle-age)**, with a **structured, informative language**, leaning toward **Enterprise Clarity + Warm Functional**."

---

## Design Dials (Fixed for this project)

| Dial | Value | Ý nghĩa |
|------|-------|---------|
| DESIGN_VARIANCE | 4/10 | Structured, predictable — không daring |
| MOTION_INTENSITY | 3/10 | Purposeful only, không decorative |
| VISUAL_DENSITY | 7/10 | Info-rich: tables, cards, descriptions |

---

## Component Decision Tree

**Trước khi tạo component mới:**

1. Ant Design 6 có component này không? → **Dùng trực tiếp. Không wrap.**
2. Pattern này lặp lại ≥ 2 lần không? → Nếu không: giữ inline.
3. Đã có trong `src/shared/design-system/` chưa? → Dùng. Nếu chưa: tạo mới vào đó.

**Design-system components — dùng trong mọi trường hợp phù hợp:**

| Component | Dùng khi |
|-----------|---------|
| `DataTable<T>` | Mọi trang danh sách có pagination |
| `StatusTag` | Mọi status enum cần colorMap |
| `PageHeader` | Header của mọi trang (title + action buttons) |
| `EmptyState` | Empty list với message và optional action |
| `DetailPageLayout` | Trang chi tiết với nhiều Card xếp dọc |
| `ListPageLayout` | Trang danh sách (header + filters + table) |

Full catalog và ví dụ: `src/shared/design-system/DESIGN_SYSTEM.md`

---

## Anti-Slop Guardrails (STRICT)

❌ **BANNED** — không làm trừ khi user yêu cầu rõ ràng:

- Blue-to-purple gradients trên nền trắng/xám
- 3+ `<Card>` giống hệt nhau liên tiếp — dùng Descriptions, Table, Timeline thay thế
- Icon nổi trên mọi heading — để typography tự tạo hierarchy
- Hardcode hex color trong component — dùng AntD token system
- Generic error "Đã có lỗi xảy ra" — phải specific và actionable
- Empty state không có hành động directive
- Uniform `gap={4}` hoặc `padding={24}` mọi nơi — vary theo semantic importance

---

## Motion Rules (Emil Kowalski)

> `src/shared/design-system/motion.css` đã được import trong `main.tsx` — áp dụng toàn cục.

**Timing:**
- Tất cả animations: ≤ 300ms
- Button `:active`: 100ms
- Tooltips, popovers nhỏ: 150–180ms
- Modals, drawers: 200–250ms
- Onboarding (hiếm): có thể lên 400ms

**Easing:**
- Entrance: `cubic-bezier(0.16, 1, 0.3, 1)` — snappy ease-out
- Exit: `cubic-bezier(0.7, 0, 1, 1)` — ease-in
- Không dùng generic `ease` hoặc `linear`

**GPU rules:**
- Chỉ animate `transform` và `opacity`
- KHÔNG animate `width`, `height`, `margin`, `padding`, `top`, `left`
- `will-change: transform` chỉ dùng cho elements animate liên tục (sidebar)

**Scale entrances:**
- KHÔNG từ `scale(0)` — dùng `scale(0.93)` hoặc `scale(0.95)` làm điểm bắt đầu
- Modal entrance: `scale(0.95) + translateY(-8px)` → `scale(1) + translateY(0)` (motion.css handles)

**Reduced motion:**
- `prefers-reduced-motion` luôn được tôn trọng (motion.css handles globally)

---

## Typography

- Page title: `<Typography.Title level={2} style={{ margin: 0 }}>`
- Section title (trong Card): dùng Card `title` prop — không dùng thêm Typography bên trong
- Secondary text: `<Typography.Text type="secondary">`
- Code/ID/timestamp: `<Typography.Text code>` hoặc font-family mono
- Body paragraphs: `<Typography.Paragraph>`
- Không center-align body paragraphs
- Không dùng raw `<h1>`, `<h2>`, `<p>` — luôn dùng AntD Typography

---

## Color & Surface

- Tất cả màu qua AntD token system hoặc `colorMap` constants
- Status colors: định nghĩa trong feature's `constants/` (ví dụ: `USER_STATUS_COLORS`)
- Backgrounds: AntD token `colorBgBase` (#fafafa) và `colorBgContainer` (#ffffff)
- Không dùng pure black (#000) hay pure white (#fff) hardcode
- Borders: AntD token `colorBorderSecondary`

---

## Spacing

- Base unit: 8px (AntD default)
- Page content padding: 24px (set bởi `AppLayout` — không override)
- Card sections gap: `16px` hoặc AntD `gap="middle"`
- Inline action buttons: `gap={8}`
- Filter bar items: `<Space wrap>` với AntD default spacing
- Không dùng uniform `gap={4}` mọi nơi

---

## Copy Rules

- Empty state: specific ("Chưa có thành viên nào") — không generic ("Không có dữ liệu")
- Error state: specific + actionable ("Tên đăng nhập đã tồn tại" không phải "Lỗi server")
- Button: verb + noun ("Thêm tài khoản", "Vô hiệu hóa", "Đặt lại mật khẩu")
- Toast/confirm sau action: past tense, match button ("Đã thêm tài khoản")
- Loading state: không cần text — Skeleton/Spin đủ rõ
- Không "Lorem ipsum", không placeholder copy

---

## Self-Critique Loop

Sau mỗi section lớn, chạy kiểm tra này:

1. **Typography test**: Che màu. Hierarchy có rõ không?
2. **Color test**: Bỏ text. Palette có cohesive không? Có hardcode hex không?
3. **Pattern test**: Cùng layout lặp > 2×? Vary nó.
4. **Slop test**: Senior designer ở Linear/Stripe có approve không?
5. **Chanel test**: Bỏ 1 element nào để design mạnh hơn?
