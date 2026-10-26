# Xây dựng Backend NestJS Modular Monolith (Football Booking MVP)

Ngày: 2026-10-26
Người thực hiện: Hiếu (AI Agent)
Nhánh hoặc commit: hieu

## Đã làm

1. **Khởi tạo và thiết lập NestJS Modular Monolith Runtime**:
   - `package.json`: Bổ sung toàn bộ dependencies NestJS 10, class-validator, class-transformer, @nestjs/jwt, @nestjs/passport, passport, bcryptjs, reflect-metadata, rxjs.
   - `tsconfig.json`: Cấu hình TypeScript compiler ES2021, decorator metadata, path aliases `@/* -> src/*`.
   - `src/main.ts`: Khởi chạy NestFactory, gắn prefix `/api/v1`, CORS, ValidationPipe (`whitelist: true`), HttpExceptionFilter toàn cục, và cấu hình Swagger UI tại `/api/docs`.
   - `src/app.module.ts`: Root module tích hợp 7 feature modules nghiệp vụ.

2. **Triển khai tầng dùng chung (`src/common/`)**:
   - `constants/tokens.ts`: Khai báo 7 Injection Tokens Symbol cho DIP Repository (`ACCOUNT_REPOSITORY`, `VENUE_REPOSITORY`, `COURT_REPOSITORY`, `BOOKING_REPOSITORY`, `STAFFING_REPOSITORY`, `FEEDBACK_REPOSITORY`, `NOTIFICATION_REPOSITORY`).
   - `filters/http-exception.filter.ts`: Bắt ngoại lệ và format phản hồi lỗi chuẩn RFC 7807 / OpenAPI ErrorResponse.
   - `decorators/`: `@CurrentUser()`, `@Roles()`, `@Public()`.
   - `guards/`: `JwtAuthGuard`, `RolesGuard`, `DynamicManagerGuard` (kiểm tra phân quyền động).
   - `pipes/`: `E164PhonePipe`, `TrimLowerEmailPipe`.

3. **Triển khai 7 Modules Nghiệp Vụ Chuẩn Clean Architecture (4 Lớp: Domain, Infrastructure, Application, Presentation)**:
   - `auth/`: Đăng ký, đăng nhập, JWT bearer token, hash bcrypt.
   - `users/`: Profile cá nhân (`GET /me` với `managedVenueIds`), Admin quản lý tài khoản (xem, khóa, mở khóa, xóa mềm).
   - `venues/`: Khám phá cụm sân công khai, quản lý cụm sân của Owner, quản lý sân con của Manager/Owner, tra cứu sân trống timeline.
   - `bookings/`: Đặt sân (ràng buộc 30m - 4h, tương lai), khách tự hủy trước 30m, quản lý/chủ sân hủy sân với lý do bắt buộc.
   - `staffing/`: Bật/tắt tuyển dụng quản lý, nộp hồ sơ ứng tuyển có đồng ý chia sẻ liên hệ, bổ nhiệm quản lý (ràng buộc tối đa 1 Manager active), thu hồi quyền tức thì.
   - `feedback/`: Gửi góp ý, xem danh sách góp ý của cụm sân với cơ chế bảo vệ danh tính (ẩn danh tác giả).
   - `notifications/`: Hàng đợi thông báo Outbox.

4. **Cài Đặt Đầy Đủ 5 Điểm Khiếm Khuyết Chủ Đích (Intentional Defect Hooks)**:
   - `HOOK-01`: Race condition đặt trùng sân (Check-then-act không lock) trong `BookingsService.createBooking`.
   - `HOOK-02`: N+1 query loop trong `VenuesService.getVenues()` và `getVenueDetail()`.
   - `HOOK-03`: Ghép nối thông báo đồng bộ (giả lập delay I/O 800ms) trong `NotificationsService.dispatchSync()`.
   - `HOOK-04`: Dynamic RBAC query trực tiếp không có cache trong `DynamicManagerGuard`.
   - `HOOK-05`: Thiếu rate limiting trên public endpoints (`/auth/*`, `/venues/:venueId/feedback`).

5. **Bộ Dữ Liệu InMemory & Kịch Bản Kiểm Thử**:
   - Cung cấp `InMemory...Repository` cho cả 7 module với dữ liệu seed mẫu đầy đủ khớp hoàn toàn với `prisma/seed.ts` (accounts, venues, courts, applications, appointments, bookings, feedback, notifications).
   - Viết kịch bản tái hiện race condition: `test/race-condition-baseline.spec.ts`.
   - Viết unit tests kiểm tra domain business rules: `test/unit/booking-rules.spec.ts` và `test/unit/dynamic-rbac.spec.ts`.

6. **Đánh Giá Độc Lập & Khắc Phục Lỗi (Subagent Review & Refinements)**:
   - **Khắc phục vi phạm ranh giới Module (`AGENTS.md` Sec 2.1)**: Loại bỏ toàn bộ việc inject trực tiếp repository của module khác (`VENUE_REPOSITORY`, `STAFFING_REPOSITORY`, `ACCOUNT_REPOSITORY`) trong `FeedbackService`, `StaffingService`, `DynamicManagerGuard`, `JwtAuthGuard`. Chuyển sang giao tiếp 100% qua các Service công khai (`VenuesService`, `StaffingService`, `UsersService`).
   - **Khắc phục lỗi lệch chuẩn DTO so với OpenAPI**: Sửa các tên trường bị lệch khiến `ValidationPipe` nuốt mất dữ liệu:
     + `ApplyManagerDto`: chuẩn hóa trường bắt buộc `consentToShareContact: boolean`.
     + `RecruitmentToggleDto`: chuẩn hóa trường `isOpen: boolean` và `message?: string`.
     + `CancelVenueBookingDto`: chuẩn hóa trường bắt buộc `reason: string`.
   - **Khắc phục HTTP Status Code**: Sửa các endpoint POST hủy booking (`/bookings/:id/cancel` và `/venues/:id/bookings/:id/cancel`) từ mã mặc định 201 Created thành đúng chuẩn 200 OK (`@HttpCode(HttpStatus.OK)`).
   - **Khắc phục OpenAPI Response Schema**:
     + Chuẩn hóa `HttpExceptionFilter` trả về trường bắt buộc `code` (ví dụ: `BAD_REQUEST`, `NOT_FOUND`, `FORBIDDEN`, `CONFLICT`) và `message` chuẩn OpenAPI Error schema.
     + Bổ sung `customerProfile` trong `BookingWithCustomerProfile` trả về cho các API quản lý lịch đặt của Venue.
     + Bổ sung trường `managerRecruitment: { isOpen, message }` trong cấu trúc trả về của `Venue`.
     + Chuẩn hóa response của `OwnerApplicationView` (`{ application, contact }`) và `OwnerManagerView` (`{ appointment, profile }`).
     + Bổ sung `tokenType: 'Bearer'` và `expiresIn: 604800` trong `AuthResult`.
     + Chuẩn hóa endpoint tra cứu sân trống `GET /courts/:courtId/availability` nhận query `startsAt`, `endsAt` và trả schema `Availability` (`{ courtId, startsAt, endsAt, available }`).

## Kiểm tra

- Chạy `python scripts/verify-architecture.py`:
  - Quét toàn bộ 75 file TypeScript trong `src/`.
  - Kết quả: 0 broken import, 0 foreign repository injection, 100% tuân thủ cấu trúc 4 tầng, Domain là Pure TypeScript, toàn bộ 5 hook định vị chính xác.
- Chạy `python scripts/verify-openapi-coverage.py` & `scripts/verify-status-codes.py`:
  - 35/35 API operations khớp 1:1 tuyệt đối với `openapi.yaml`.
  - 0 lệch mã phản hồi HTTP status code.
- Chạy `python scripts/deep-system-verification.py`:
  - Seed integrity: 100% tài khoản, cụm sân, sân con, booking, application, appointment mẫu tồn tại chính xác.
  - Concurrency simulation (HOOK-01): Tái hiện thành công double-booking (5/5 concurrent requests được xác nhận).
  - Business rules: Đạt toàn bộ ràng buộc thời lượng (30m - 240m), lead-time hủy sân của khách (>= 30m), single manager constraint, và dynamic RBAC.
- Chạy `python scripts/test-remedy-12-issues.py`:
  - Kiểm tra độc lập toàn bộ 12 điểm khắc phục từ audit.
  - Kết quả: `ALL 12 AUDIT ISSUES ARE 100% FIXED AND VERIFIED!`.

7. **Khắc Phục Toàn Diện 12 Vấn Đề Thẩm Định (DeepInvestigator Audit Remediation)**:
   - **Issue 1 (Dynamic RBAC trên `PATCH /venues/:venueId`)**: Đổi guard tại `VenuesController.updateVenue` sang `DynamicManagerGuard` (gỡ bỏ `@Roles('OWNER')`); cập nhật `VenuesService.updateVenue` cho phép cả Owner và Active Manager thực hiện cập nhật.
   - **Issue 2 (Chặn Admin tự khóa chính mình)**: Trong `AdminAccountsController.updateStatus`, ném `ConflictException` với mã lỗi `ADMIN_CANNOT_LOCK_SELF` nếu Admin đang đăng nhập tự khóa tài khoản của mình.
   - **Issue 3 (Chặn Admin tự xóa chính mình)**: Trong `AdminAccountsController.deleteAccount`, ném `ConflictException` với mã lỗi `SELF_DELETE_NOT_ALLOWED` nếu Admin đang đăng nhập tự xóa tài khoản của mình.
   - **Issue 4 (Mã lỗi 409 Conflict khi xóa Venue/Court có active bookings)**:
     + `VenuesService.deleteVenue`: ném `ConflictException({ code: 'VENUE_HAS_ACTIVE_BOOKINGS', message: 'Chưa thể xóa Venue vì còn booking chưa kết thúc.' })`.
     + `CourtsService.deleteCourt`: ném `ConflictException({ code: 'COURT_HAS_ACTIVE_BOOKINGS', message: 'Chưa thể xóa Court vì còn booking chưa kết thúc.' })`.
   - **Issue 5 (Bảo vệ thông tin cá nhân của Manager trên API công khai `GET /venues/:venueId`)**: Loại bỏ hoàn toàn object `activeManager` (chứa email, phone) khỏi dữ liệu trả về của `getVenueDetail`, chuẩn hóa trả về đúng schema `Venue` công khai.
   - **Issue 6 (Đóng tuyển dụng và thu hồi Manager khi xóa mềm Venue)**: Trong `VenuesService.deleteVenue`, thiết lập `venue.recruitmentOpen = false`, `venue.recruitmentMessage = null` và gọi `StaffingService.revokeManagerOnVenueDeletion(venueId)` để thu hồi bổ nhiệm APPOINTED -> REVOKED.
   - **Issue 7 (Bổ sung `managedVenueIds` trong `GET /admin/accounts`)**: Mọi endpoint quản lý tài khoản của Admin (`getAccounts`, `getAccountById`, `updateStatus`) đều trả về trường `managedVenueIds: string[]` thông qua `UsersService.getManagedVenueIds(userId)`.
   - **Issue 8 (Idempotent DELETE tài khoản trả về HTTP 204)**: Trong `UsersService.softDeleteAccount`, nếu tài khoản đã bị xóa mềm trước đó (`account.deletedAt !== null`), trả về ngay lập tức (không ném BadRequestException).
   - **Issue 9 (Dọn dẹp `exports` của 6 `*.module.ts`)**: Loại bỏ toàn bộ các token `*_REPOSITORY` (`ACCOUNT_REPOSITORY`, `VENUE_REPOSITORY`, `COURT_REPOSITORY`, `BOOKING_REPOSITORY`, `STAFFING_REPOSITORY`, `FEEDBACK_REPOSITORY`, `NOTIFICATION_REPOSITORY`) khỏi mảng `exports` của 6 module, đảm bảo tính đóng gói tuyệt đối (encapsulation) và giao tiếp 100% qua Exported Services.
   - **Issue 10 (Thêm validator decorators cho các trường fallback trong DTO)**: Bổ sung `@IsOptional()` và validator type decorator hợp lệ cho `cancellationReason` (`CancelVenueBookingDto`), `consented` (`ApplyManagerDto`), `recruitmentOpen` và `recruitmentMessage` (`RecruitmentToggleDto`), ngăn ngừa nguy cơ bị `ValidationPipe` chặn hoặc lọc sai.
   - **Issue 11 (Bắt buộc `startsAt` và `endsAt` tại `GET /courts/:courtId/availability`)**: Ném `BadRequestException` nếu thiếu tham số khung giờ; loại bỏ việc làm lộ toàn bộ booking intervals trong ngày.
   - **Issue 12 (Ràng buộc độ dài mật khẩu trong `RegisterDto`)**: Cập nhật `@MinLength(8)` và `@MaxLength(128)` đúng đặc tả `RegisterRequest` của OpenAPI.

8. **Hoàn thiện bổ sung sau rà soát sâu (Adversarial Quality Check)**:
   - Sửa `UsersService.updateAccountStatus`: Khi tài khoản đã bị xóa logic (`account.deletedAt !== null`), ném `ConflictException` với mã lỗi `ACCOUNT_STATUS_CONFLICT` (HTTP 409) thay vì `BadRequestException` (HTTP 400) để tuân thủ chính xác 100% hợp đồng OpenAPI spec.
   - Đồng bộ hóa `AdminAccountsController.updateStatus`: Bổ sung trường `deletedAt` trong payload trả về để đồng nhất hoàn toàn với `getAccounts` và `getAccountById`.

9. **Đồng bộ chi tiết 5 Khiếm khuyết chủ đích vào Tài liệu Kiến trúc Dự án**:
   - Cập nhật mục ## Baseline có lỗi chủ đích (Intentional Defect Hooks) trong documentation/architecture/ARCHITECTURE.md ghi rõ: vị trí mã nguồn, bản chất khiếm khuyết, hậu quả, kịch bản đo lường benchmark tải, và các gợi ý hướng giải quyết chuyên sâu (CSDL, Lock, Queue, Cache, Throttler) cho 5 điểm:
     + HOOK-01: Race Condition Đặt Sân (Check-Then-Act).
     + HOOK-02: Vấn đề Truy vấn N+1 trong API Đọc.
     + HOOK-03: Khớp nối Đồng bộ trong Xử lý Thông báo Outbox.
     + HOOK-04: Thắt cổ chai I/O Dynamic RBAC do truy vấn CSDL liên tục.
     + HOOK-05: Thiếu cơ chế Giới hạn Tần suất (Rate Limiting) phân tán trên Public Endpoints.
   - Cập nhật liên kết và tóm tắt đồng bộ tại documentation/architecture/DATABASE.md mục ## Đồng thời và baseline có lỗi chủ đích.

## Vướng mắc và việc tiếp theo

- Vướng mắc: Không có. Toàn bộ 12 điểm góp ý cùng các trường hợp biên chi tiết đã được kiểm tra, xử lý triệt để và xác minh qua bộ scripts kiểm thử tự động.
- Việc tiếp theo: Báo cáo kết quả kiểm thử và hoàn thành nhiệm vụ.
