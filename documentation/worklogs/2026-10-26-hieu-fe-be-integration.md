# Tích hợp Kết nối Toàn diện Frontend và Backend NestJS (FE-BE Integration)

Ngày: 2026-10-26
Người thực hiện: Hiếu (AI Agent)
Nhánh hoặc commit: hieu

## Đã làm

1. **Cấu hình Reverse Proxy trong Frontend (Vite Dev Server)**:
   - `frontend/vite.config.ts`: Cấu hình proxy định tuyến tất cả các request có tiền tố `/api/v1` từ cổng `5173` sang Backend NestJS tại `http://localhost:3000/api/v1`.
   - Giữ nguyên cấu hình CORS linh hoạt trên cả hai phía, đảm bảo không gặp lỗi Cross-Origin Resource Sharing.

2. **Khởi tạo HTTP Client & Tích hợp Tầng Trạng Thái Ứng Dụng (`AppContext.tsx`)**:
   - `frontend/src/lib/api-client.ts`: Hiện thực hàm `apiRequest<T>` hỗ trợ tự động đính kèm JWT Bearer Token từ `localStorage` và xử lý lỗi đồng bộ theo chuẩn RFC 7807 / OpenAPI.
   - `frontend/src/app/AppContext.tsx`: Tích hợp gọi Backend API trực tiếp cho toàn bộ các luồng nghiệp vụ:
     + **Khởi tạo dữ liệu**: Tải danh sách Cụm sân (`GET /venues`) và danh sách Sân con (`GET /venues/:id/courts`).
     + **Xác thực & Phiên làm việc**: Đăng nhập (`POST /auth/login`), Đăng ký (`POST /auth/register`), Lấy thông tin cá nhân kèm quyền quản lý động (`GET /me`).
     + **Nghiệp vụ Đặt sân (Customer Booking)**: Đặt sân (`POST /bookings` với thời gian UTC ISO 8601), Khách tự hủy sân trước 30 phút (`POST /bookings/:id/cancel`), Tải lịch sử đặt sân cá nhân (`GET /me/bookings`).
     + **Nghiệp vụ Quản lý sân (Manager / Owner Schedule)**: Xem lịch đặt sân cụm sân quản lý (`GET /venues/:id/bookings`), Hủy lịch đặt của khách kèm lý do bắt buộc (`POST /venues/:id/bookings/:id/cancel`).
     + **Nghiệp vụ Nhân sự (Staffing)**: Bật/tắt tuyển dụng (`PATCH /venues/:id/manager-recruitment`), Nộp đơn ứng tuyển (`POST /venues/:id/manager-applications`), Bổ nhiệm quản lý (`POST /venues/:id/managers`), Thu hồi quyền Manager tức thì (`DELETE /venues/:id/managers/:userId`).
     + **Nghiệp vụ Đánh giá (Feedback)**: Gửi phản hồi (`POST /venues/:id/feedback`).
     + **Nghiệp vụ Quản trị viên (Admin Console)**: Xem danh sách tài khoản (`GET /admin/accounts`), Cập nhật trạng thái khóa/mở khóa (`PATCH /admin/accounts/:id/status`), Xóa mềm (`DELETE /admin/accounts/:id`).

3. **Cập nhật Màn hình & Form Nhập liệu (Frontend Pages)**:
   - `frontend/src/modules/auth/pages/LoginPage.tsx`: Cập nhật tài khoản Demo khớp với seed backend (`admin@example.com`, `owner.anphu@example.com`, `manager.minh@example.com`, `user.lan@example.com`, `user.locked@example.com` với mật khẩu chung `Secret123@`), chuyển các handler sang bất đồng bộ (`async/await`).
   - `frontend/src/modules/auth/pages/RegisterPage.tsx`: Chuyển handler sang `async/await`, cập nhật ràng buộc mật khẩu tối thiểu 8 ký tự.
   - `frontend/src/modules/venues/pages/VenueDetailPage.tsx`: Chuyển xử lý đặt sân, nộp đơn ứng tuyển và gửi góp ý sang bất đồng bộ.
   - `frontend/src/modules/venues/pages/ManagerCourtsPage.tsx`: Chuyển thao tác xóa sân sang bất đồng bộ (`await deleteCourt`).
   - `frontend/src/modules/bookings/pages/ManagerSchedulePage.tsx`: Chuyển thao tác hủy sân sang bất đồng bộ.
   - `frontend/src/modules/staffing/pages/OwnerStaffingPage.tsx`: Chuyển thao tác bổ nhiệm và thu hồi Manager sang bất đồng bộ.

4. **Xử lý Triệt để Lỗi Runtime & Build**:
   - **Lỗi Circular Dependency trong NestJS**: Bao bọc các dependency chéo giữa `UsersModule`, `StaffingModule`, `VenuesModule`, `BookingsModule` bằng `forwardRef(() => ModuleName)`.
   - **Lỗi Reflection Metadata của Swagger**: Thêm `import 'reflect-metadata';` tại dòng đầu của `src/main.ts`, biên dịch code NestJS bằng `tsc -p tsconfig.json` ra thư mục `dist/` và chạy trực tiếp bằng `node dist/main.js`.
   - **Lỗi Kiểu Dữ liệu TypeScript Frontend**: Bổ sung `description?: string;` vào interface `Venue` trong `frontend/src/types/index.ts`, khắc phục các cảnh báo biến chưa dùng và type mismatch.

## Kiểm tra

1. **Kiểm tra biên dịch tĩnh (Typecheck)**:
   - Frontend: `cd frontend; npx tsc --noEmit` -> Kết quả: **Mã thoát 0, 0 lỗi biên dịch**.
   - Backend: `npx tsc -p tsconfig.json` -> Kết quả: **Mã thoát 0, 0 lỗi biên dịch**.

2. **Kiểm tra End-to-End luồng tích hợp qua Vite Proxy (`http://localhost:5173/api/v1`)**:
   - **Đăng nhập**: `POST /auth/login` với `user.lan@example.com` thành công 100%, trả về JWT access token và thông tin cá nhân.
   - **Tải Cụm sân**: `GET /venues` trả về 3 cụm sân mẫu (An Phú, Thảo Điền, Thủ Đức) kèm số lượng sân con chính xác.
   - **Tải Sân con**: `GET /venues/:venueId/courts` trả về đầy đủ các sân 5/7 người tương ứng.
   - **Tạo Booking**: `POST /bookings` thành công tạo lịch đặt sân mới với trạng thái `CONFIRMED`.
   - **Hủy Booking**: `POST /bookings/:id/cancel` cho phép khách tự hủy lịch đặt thành công với trạng thái chuyển sang `CANCELLED`.
   - **Manager Dashboard**: Đăng nhập với `manager.minh@example.com`, truy vấn `GET /venues/:venueId/bookings` nhận đúng 5 booking thuộc sân An Phú, hiển thị đầy đủ thông tin khách hàng.
   - **Admin Console**: Đăng nhập với `admin@example.com`, truy vấn `GET /admin/accounts` nhận đủ 8 tài khoản với trạng thái quản lý chính xác.
   - **Bảo mật**: Đăng nhập tài khoản bị khóa `user.locked@example.com` bị từ chối chính xác với mã lỗi 401/403.

## Vướng mắc và việc tiếp theo

- Cả Backend (port 3000) và Frontend (port 5173) đang chạy ổn định trong chế độ phục vụ.
- Người dùng có thể truy cập ngay tại `http://localhost:5173/` để trải nghiệm toàn bộ hệ thống đã kết nối hoàn chỉnh.
