# Frontend — Quản lý Chương trình đào tạo

React 19 + Vite, Ant Design (ngôn ngữ `vi_VN`), TanStack Query, React Router. Lựa chọn công nghệ ở `docs/design/tech-stack.md`.

## Chạy

Cần Node.js 22 (≥ 22.22), pnpm 10, và backend đang chạy ở cổng 3000 (`source/backend/README.md`).

1. `pnpm install`
2. `pnpm dev` — mở `http://localhost:5173`. Vite chuyển mọi yêu cầu `/api` sang `http://localhost:3000`, nên trình duyệt chỉ thấy một nguồn, giống khi Caddy phục vụ ở máy chủ thật.

## Lệnh

| Lệnh                                | Việc                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `pnpm dev`                          | Máy chủ phát triển                                                     |
| `pnpm build`                        | Kiểm kiểu rồi dựng ra `dist/`                                          |
| `pnpm test`                         | Vitest + React Testing Library trên jsdom                              |
| `pnpm lint`                         | oxlint                                                                 |
| `pnpm format` · `pnpm format:check` | Prettier                                                               |
| `pnpm api:types`                    | Sinh lại `src/api/schema.d.ts` từ đặc tả OpenAPI của backend đang chạy |

## Kiểu dữ liệu của API

Không viết tay kiểu của dữ liệu trả về. Sau khi backend đổi endpoint hay DTO, chạy `pnpm api:types` và dùng `components['schemas'][...]` từ `src/api/schema.d.ts` (xem `src/api/health.ts`). Tệp sinh ra được đưa vào git, để dựng giao diện không cần backend đang chạy.

## Quy ước

| Mục          | Quy ước                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| Tên trong mã | Tiếng Anh. Chữ hiển thị cho người dùng: tiếng Việt                                                                 |
| Tệp          | Thành phần React `PascalCase.tsx`; còn lại `camelCase.ts`; kiểm thử `*.test.tsx` cạnh tệp được kiểm                |
| Thư mục      | `api/` gọi máy chủ và kiểu · `layout/` khung trang · `pages/` một tệp cho mỗi màn hình · `routes.ts` mọi đường dẫn |
| Đường dẫn    | Lấy từ `ROUTES`, không viết chuỗi trực tiếp                                                                        |
| Gọi API      | Qua `getJson` trong `src/api/client.ts` và `useQuery`; khóa truy vấn đặt cạnh hàm gọi                              |
