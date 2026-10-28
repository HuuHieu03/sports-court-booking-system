# Triển Khai Toàn Diện Tầng Prisma Repositories & Kết Nối CSDL PostgreSQL

Ngày: 2026-10-28  
Người thực hiện: Hiếu (AI Agent)  
Nhánh hoặc commit: `hieu`

## Đã làm

1. **Khởi tạo Prisma Infrastructure Core (`src/common/prisma/`)**:
   - `prisma.service.ts`: Kế thừa `PrismaClient` từ `src/generated/prisma/client`, tích hợp `@prisma/adapter-pg` với kết nối bắt buộc `options: '-c TimeZone=UTC'`. Hiện thực các hook vòng đời NestJS `OnModuleInit` (`$connect`) và `OnModuleDestroy` (`$disconnect`).
   - `prisma.module.ts`: Khai báo decorator `@Global()` cung cấp và export `PrismaService` cho toàn bộ các module nghiệp vụ trong ứng dụng mà không cần import lặp lại.
   - `src/app.module.ts`: Đăng ký `PrismaModule` vào danh sách `imports`.

2. **Triển khai Đầy đủ 7 Lớp Prisma Repositories Chuẩn Clean Architecture (`src/modules/*/infrastructure/`)**:
   - `src/modules/users/infrastructure/prisma-account.repository.ts`: Hiện thực `IAccountRepository` (findById, findByEmail, findByPhone, findAll có filter search/role/status, save, update). Ánh xạ đầy đủ giữa Prisma `Account` và `AccountEntity`.
   - `src/modules/venues/infrastructure/prisma-venue.repository.ts`: Hiện thực `IVenueRepository` (findById, findByOwnerId, findAll có filter search/recruitmentOnly, save, update).
   - `src/modules/venues/infrastructure/prisma-court.repository.ts`: Hiện thực `ICourtRepository` (findById, findByVenueId có hỗ trợ includeDeleted, save, update).
   - `src/modules/bookings/infrastructure/prisma-booking.repository.ts`: Hiện thực `IBookingRepository` (findById, findByUserId, findByVenueId, findByCourtId, findConflictingBookings, isCourtAvailable, save, update). Bảo toàn nguyên vẹn hành vi của HOOK-01 trên bản Baseline (không lock, không exclusion constraint).
   - `src/modules/staffing/infrastructure/prisma-staffing.repository.ts`: Hiện thực `IStaffingRepository` (quản lý cả `ManagerApplication` và `ManagerAppointment`, tìm bổ nhiệm active theo venue/user, save/update).
   - `src/modules/feedback/infrastructure/prisma-feedback.repository.ts`: Hiện thực `IFeedbackRepository` (findById, findByVenueId, save).
   - `src/modules/notifications/infrastructure/prisma-notification.repository.ts`: Hiện thực `INotificationRepository` (findById, findByRecipientId, findAll, save, update outbox notifications).

3. **Cập nhật Bộ Kiểm thử Tự động**:
   - `scripts/verify-architecture.py`: Bổ sung bỏ qua thư mục generated client (`src/generated`) khi quét đường dẫn import relative.

## Kiểm tra

1. **Kiểm tra biên dịch tĩnh (Typecheck)**:
   - Chạy `npm run build` (`tsc -p tsconfig.json`): **Mã thoát 0, hoàn thành 100% không có lỗi hoặc cảnh báo TypeScript**.
2. **Kiểm tra ranh giới kiến trúc (Architecture Verification)**:
   - Chạy `python scripts/verify-architecture.py`: Quét 84 file TypeScript nguồn, 0 broken import, 0 vi phạm ranh giới module, Domain thuần túy TypeScript, đủ 5 Intentional Defect Hooks.
3. **Kiểm tra Deep Forensic System**:
   - Chạy `python scripts/deep-system-verification.py`: Đạt 100% các điều kiện về seed integrity, OpenAPI contract và 5 hook chủ đích.
4. **Kiểm tra Vận hành Thực tế (Live PostgreSQL & API Verification)**:
   - Khởi động NestJS backend: `PrismaService` kết nối thành công tới PostgreSQL container (port 5432).
   - `GET /api/v1/venues`: Truy vấn đọc thành công 3 cụm sân mẫu từ PostgreSQL.
   - `POST /api/v1/auth/login`: Xác thực mật khẩu bcrypt thành công cho tài khoản seed `user.lan@example.com`.
   - `POST /api/v1/bookings`: Tạo thành công lượt đặt sân mới trạng thái `CONFIRMED` ghi thẳng vào CSDL PostgreSQL (ID: `3e2c3009-805c-46e5-b40b-f95d058997fa`).
   - `GET /api/v1/me/bookings`: Đọc lại lịch đặt sân của Lan cho thấy 4 booking (gồm 3 booking seed và 1 booking mới vừa tạo).

## Vướng mắc và việc tiếp theo

- Đã hoàn thành 100% việc chuyển đổi toàn bộ 6 module sang CSDL PostgreSQL thật.
- Đã đóng gói thành công file `Dockerfile` chung (multi-target cho cả NestJS backend và React Vite frontend NGINX) cùng `docker/nginx.conf`.
- Đã khắc phục lỗi khởi động NGINX trong Docker container (`host not found in upstream "backend"`) bằng cách cấu hình dynamic resolver (`resolver 127.0.0.11 valid=10s ipv6=off;`) kết hợp biến `$backend_api` trong `docker/nginx.conf`.
- Tiếp tục tiến hành triển khai lên môi trường VM và xây dựng kịch bản benchmark tải k6.
