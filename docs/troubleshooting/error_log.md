# Error Log

Append-only. Every real bug (crash, hang, wrong state, silent failure) gets an entry here
when it's fixed, per `ai-rules.md` Rule 11. Never edit or delete past entries. Newest
entries go at the bottom.

Format:
```
## [YYYY-MM-DD] Short title
**Symptom**: what was observed
**Possible cause**: the mechanism
**Resolution**: what changed
**How to avoid**: the general lesson
```

---

## [2026-10-15] `pnpm install` hỏng ở bước `prisma generate` khi chưa có biến `DATABASE_URL`
**Symptom**: `pnpm install` trong `source/backend` dừng ở `postinstall` với lỗi Prisma báo thiếu biến môi trường `DATABASE_URL`, dù `prisma generate` không cần kết nối cơ sở dữ liệu.
**Possible cause**: `prisma.config.ts` dùng `env('DATABASE_URL')` của `prisma/config`; hàm này ném lỗi ngay khi biến chưa đặt. `postinstall` chạy trên máy mới, trước khi ai kịp tạo tệp biến môi trường.
**Resolution**: `source/backend/prisma.config.ts` đọc `process.env.DATABASE_URL` trực tiếp (có thể `undefined`); lệnh cần kết nối thật (`migrate`) vẫn báo lỗi rõ khi thiếu.
**How to avoid**: Mọi tệp cấu hình được đọc trong lúc cài đặt hoặc sinh mã không được đòi biến môi trường chỉ cần lúc chạy. Kiểm bằng cách cài trên một bản sao sạch không có tệp biến môi trường.

## [2026-10-15] `REDIS_PORT` hợp lệ vẫn bị báo sai kiểu, ứng dụng không khởi động
**Symptom**: Đặt `REDIS_PORT=6379` thì ứng dụng dừng lúc khởi động với "REDIS_PORT must be an integer number".
**Possible cause**: `plainToInstance(..., { enableImplicitConversion: true })` đổi kiểu theo metadata `design:type`. Thuộc tính có giá trị mặc định nhưng không ghi kiểu (`REDIS_PORT = 6379`) được TypeScript phát metadata là `Object`, nên chuỗi `"6379"` không được đổi sang số và `@IsInt` thất bại. Không đặt biến thì giá trị mặc định là số nên lỗi chỉ hiện khi có biến.
**Resolution**: `source/backend/src/config/env.validation.ts` ghi kiểu tường minh cho mọi thuộc tính (`PORT: number = 3000`, `REDIS_PORT: number = 6379`); thêm chú thích giải thích tại chỗ.
**How to avoid**: Với class-transformer, mọi thuộc tính cần đổi kiểu ngầm phải có chú thích kiểu tường minh — kể cả khi đã có giá trị mặc định. Áp dụng cho DTO truy vấn (`?page=2`) như với lớp biến môi trường; kiểm thử phải đi qua nhánh có giá trị chuỗi, không chỉ nhánh mặc định.
