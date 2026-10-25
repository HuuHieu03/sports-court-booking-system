# Thiết kế và dựng nền database

Ngày: 2026-10-18
Người thực hiện: son
Nhánh hoặc commit: `son`

## Đã làm

- Thiết kế database 8 bảng, ghi trong `documentation/architecture/DATABASE.md` (ERD, ràng buộc, index, xử lý đồng thời). Mục "Dữ liệu chính" của ARCHITECTURE.md chuyển sang link tới tài liệu này.
- Chốt email và số điện thoại không trùng giữa các tài khoản, kể cả tài khoản đã xóa. Đã cập nhật PRD và OpenAPI: đăng ký trùng số điện thoại trả 409, số điện thoại được chuẩn hóa về E.164.
- Dựng phần database bằng Prisma 7.10.1: `package.json`, `prisma.config.ts`, `prisma/schema.prisma`, migration `20261018000000_baseline`, `prisma/seed.ts`, `.env.example`.
- Docker: `docker-compose.yml` có service `postgres` (PostgreSQL 17) và `db-init` (build từ `docker/db-init.Dockerfile`) tự chạy migrate và seed. `docker compose up -d` là có database đủ dữ liệu.
- Migration baseline có đủ partial unique index và 10 CHECK constraint. Baseline cố ý chưa có ràng buộc chống đặt trùng giờ.
- Seed tạo 8 tài khoản (đủ các vai trò và trạng thái), 3 Venue, 8 Court, 6 booking, hồ sơ ứng tuyển, bổ nhiệm, feedback và thông báo.

## Kiểm tra

Lúc kiểm tra, tài khoản máy chưa dùng được Docker nên database được chạy bằng `embedded-postgres` (PostgreSQL 17, server đặt múi giờ +07):

- `prisma migrate deploy` trên database trống: thành công.
- Seed chạy hai lần: không lỗi, số bản ghi không đổi.
- `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code`: mã 0, schema khớp database.
- Thử 19 ca vi phạm hoặc tuân thủ ràng buộc bằng SQL: 19/19 đúng như thiết kế. Trong đó có ca baseline vẫn cho phép hai booking CONFIRMED trùng giờ.
- Prisma Client trả `P2002` khi vi phạm unique, `P2003` khi vi phạm FK, `P2039` khi vi phạm CHECK.
- `docker compose config`: hợp lệ, kể cả khi chưa có `.env`.
- Mô phỏng các bước của `docker/db-init.Dockerfile` trong thư mục chỉ chứa các file được COPY: `npm ci`, `prisma generate`, rồi lệnh CMD hai lần. Lần đầu áp dụng migration và seed, lần hai bỏ qua migration và seed lại không lỗi. Thiếu `SEED_PASSWORD` thì seed dừng với thông báo rõ ràng.

Sau khi cấp quyền Docker, chạy thật `docker compose up -d --build`:

- `postgres` (PostgreSQL 17.11, múi giờ UTC) healthy; `db-init` áp dụng migration, seed rồi thoát với mã 0.
- Từ máy host: `prisma migrate status` báo schema up to date, `migrate diff` mã 0, đủ 10 CHECK constraint, số bản ghi đúng như seed, booking mẫu lưu đúng 18:00 giờ Việt Nam.
- Chạy `docker compose up -d` lần hai: `db-init` báo không có migration mới, seed lại không lỗi; `postgres` giữ nguyên dữ liệu.

## Vướng mắc và việc tiếp theo

- Phát hiện `@prisma/adapter-pg` gửi thời gian không kèm múi giờ. Server PostgreSQL đặt múi giờ khác UTC sẽ lưu lệch giờ mà không báo lỗi. Đã xử lý bằng `options: '-c TimeZone=UTC'` trong seed và trong `DATABASE_URL`. Backend phải giữ cấu hình này khi tạo PrismaClient (xem DATABASE.md, mục "Dùng trong backend").
- Cần thống nhất với backend: `package.json` ở thư mục gốc hiện chỉ có phần Prisma; khi dựng NestJS cần thêm vào file này, không tạo mới. Prisma Client được sinh dạng CommonJS vào `src/generated/prisma`.
- Việc tiếp theo: query kiểm tra booking trùng giờ, script tái hiện race condition, migration bản cải tiến với `EXCLUDE`.
- Các điểm PRD còn mở có ảnh hưởng tới database: rating feedback, kênh gửi thông báo, giờ mở cửa, cách xử lý Venue khi Admin xóa Owner.
