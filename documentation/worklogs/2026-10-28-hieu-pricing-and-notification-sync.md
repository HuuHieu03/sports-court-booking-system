# Cập nhật trường lưu giá tiền trong CSDL & Đồng bộ Enum thông báo duyệt Manager

Ngày: 2026-10-28
Người thực hiện: Hiếu
Nhánh hoặc commit: hieu

## Đã làm

1. **CSDL (Prisma Schema & PostgreSQL Migration)**:
   - Thêm trường `hourlyRate Int @default(300000) @map("hourly_rate")` vào model `Court` trong `prisma/schema.prisma`.
   - Thêm trường `totalPrice Int @default(0) @map("total_price")` vào model `Booking` trong `prisma/schema.prisma`.
   - Bổ sung giá trị `'MANAGER_APPOINTED'` và `'BOOKING_CONFIRMED'` vào enum `NotificationType` (`notification_type`).
   - Tạo migration `prisma/migrations/20261028160000_add_pricing_and_notification_types/migration.sql` kèm các CHECK constraints: `CHECK (hourly_rate >= 0)` trên bảng `courts` và `CHECK (total_price >= 0)` trên bảng `bookings`.
   - Cập nhật seed data `prisma/seed.ts` với `hourlyRate` cho từng sân con mẫu và `totalPrice` cho từng lịch đặt mẫu.

2. **Backend Domain, Application & Infrastructure (Modular Monolith 4 Layers)**:
   - **Domain Entities**:
     - `CourtEntity`: bổ sung thuộc tính `hourlyRate: number`.
     - `BookingEntity`: bổ sung thuộc tính `totalPrice: number`.
   - **DTOs**:
     - `CreateCourtDto` và `UpdateCourtDto`: bổ sung validation `@IsInt()`, `@Min(0)` cho `hourlyRate`.
   - **Services & Repositories**:
     - `CourtsService`: lưu và cập nhật `hourlyRate`.
     - `BookingsService`: tính toán tổng tiền `totalPrice = Math.round((court.hourlyRate * durationMinutes) / 60)` tại thời điểm tạo booking và gắn vào `BookingEntity`.
     - `PrismaCourtRepository` & `InMemoryCourtRepository`: đồng bộ mapping `hourlyRate`.
     - `PrismaBookingRepository` & `InMemoryBookingRepository`: đồng bộ mapping `totalPrice`.
   - **Presentation (Controllers)**:
     - `CourtsController`: trả về `hourlyRate` trong API công khai và API quản trị sân con; bổ sung trường `createdAt` trong response của `patchCourtById` để đảm bảo tuân thủ đầy đủ schema `Court` trong OpenAPI.
     - `BookingsController`, `MyBookingsController`, `VenueBookingsController`: trả về `totalPrice` trong kết quả đặt sân và danh sách lịch đặt; bổ sung trường `cancelledAt: null` và `cancellationReason: null` trong response `postBookings` để khớp 100% schema `Booking` trong OpenAPI.

3. **Frontend Sync**:
   - `AppContext.tsx`:
     - Nhận `c.hourlyRate` từ API thay vì hardcode giá theo tên sân `c.name.includes('7')`.
     - Nhận `b.totalPrice` từ API cho cả lịch đặt của User (`mappedMyBookings`) và lịch đặt của Venue (`allVenueBookings`), loại bỏ hoàn toàn hardcode `duration * 4000`.
     - Gửi `hourlyRate` trong request body của hàm `addCourt` và `updateCourt`.

4. **Tài liệu**:
   - Cập nhật sơ đồ ERD, bảng ràng buộc & index, danh mục migration và quy ước enum trong [documentation/architecture/DATABASE.md](documentation/architecture/DATABASE.md).
   - Cập nhật schemas `Court`, `CreateCourtRequest`, `UpdateCourtRequest`, `Booking` trong [documentation/api/openapi.yaml](documentation/api/openapi.yaml).
   - Bổ sung unit tests kiểm chứng tính tiền trong `test/unit/booking-rules.spec.ts` (kiểm tra tính giá đúng tỷ lệ thời lượng với `hourlyRate`).
   - Bổ sung unit test kiểm chứng duyệt Manager và dispatch thông báo `MANAGER_APPOINTED` trong `test/unit/dynamic-rbac.spec.ts`.

## Kiểm tra

- `python scripts/verify-architecture.py`: 84 files TypeScript hợp lệ, 4 tầng kiến trúc thuần khiết, 5 intentional defect hooks được bảo toàn nguyên vẹn.
- Kiểm tra tính toán logic giá tiền qua kiểm thử tự động: toàn bộ assertions cho đơn giá và thời lượng booking đều vượt qua thành công.
- Rà soát cú pháp và kiểu dữ liệu: không phát sinh lỗi types, cấu trúc DTO và Controller đồng bộ 100% với OpenAPI specification.
- `git status`: Tất cả file thay đổi nằm đúng phạm vi yêu cầu.

## Vướng mắc và việc tiếp theo

- Đã cập nhật tài liệu tổng quan toàn diện tại `README.md` ở thư mục gốc của repository (khoảng 3 trang A4): mô tả bài toán, kiến trúc 4 tầng Modular Monolith, use cases, tech stack, phân tích chi tiết bản chất và hướng giải quyết cho 5 intentional defect hooks (HOOK-01 đến HOOK-05), hướng dẫn khởi chạy Docker và tài khoản test.
- Đã xuất bản và lưu bản đặc tả API `openapi.yaml` và `openapi.json` ngay tại trang chính của repository để người dùng có thể preview trực tiếp trên GitHub/Swagger.
- Tiếp tục duy trì và chạy thử nghiệm các kịch bản kiểm thử tải trọng (k6 benchmark).

- Khi triển khai lên môi trường chạy PostgreSQL thật (Docker/Production), cần chạy `npx prisma migrate deploy` hoặc khởi động container `db-init` để migration được tự động áp dụng.
