# scripts/

Helper scripts cho development. Chạy từ bất kỳ thư mục nào trong repo — tất cả đều tự phát hiện project root.

## Danh sách scripts

| Script | Mô tả |
|--------|-------|
| `dev.sh` | Khởi động Backend + Frontend song song |

---

## `dev.sh` — Khởi động BE + FE

```bash
# Từ project root:
bash scripts/dev.sh

# Từ bất kỳ subfolder nào:
bash /path/to/repo/scripts/dev.sh

# Thêm quyền thực thi một lần (Mac/Linux/WSL):
chmod +x scripts/dev.sh
./scripts/dev.sh
```

Output sẽ có prefix màu để phân biệt:
- `[BE]` (xanh dương) — log từ Backend (NestJS)
- `[FE]` (xanh lá) — log từ Frontend (Vite)

### Yêu cầu

| Yêu cầu | Ghi chú |
|---------|---------|
| `bash` | Mac/Linux: có sẵn. Windows: cần Git Bash hoặc WSL |
| `pnpm` | Cài global: `npm i -g pnpm` |
| Docker | Cần cho PostgreSQL + Redis |

### Thứ tự khởi động

1. Khởi động infrastructure (PostgreSQL + Redis):
   ```bash
   cd source/backend && pnpm services:up
   ```

2. Chạy cả hai server:
   ```bash
   bash scripts/dev.sh
   ```

### Port mặc định

| Service | URL |
|---------|-----|
| Backend (NestJS) | http://localhost:3000 |
| Frontend (Vite) | http://localhost:5173 |
| API Docs (Swagger) | http://localhost:3000/api/docs |
