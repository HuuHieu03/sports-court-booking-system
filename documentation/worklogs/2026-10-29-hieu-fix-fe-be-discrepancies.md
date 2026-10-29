# Công việc: Khắc phục các sai lệch dữ liệu, hợp đồng API và hardcode giữa FE, BE và DB

Ngày: 2026-10-29
Người thực hiện: Hiếu
Nhánh hoặc commit: hieu

## Đã làm

1. **Đồng bộ thông tin tài khoản demo trên trang Đăng nhập (`LoginPage.tsx`, `AuthModal.tsx`, `RegisterPage.tsx`)**:
   - Khắc phục hardcode sai lệch tên demo: cập nhật tên Chủ sân thành "Trần Quốc An (Owner)", Quản lý thành "Quản Lý Sân An Phú - Phạm Minh Đức (Manager)", Khách đặt sân thành "Nguyễn Ngọc Lan (User)" chuẩn xác theo `prisma/seed.ts`.
   - Sửa email nút test tài khoản LOCKED từ `locked.user@example.com` thành `user.locked@example.com`.
   - Chuẩn hóa placeholder họ tên trong `AuthModal.tsx` thành "Nguyễn Ngọc Lan" và placeholder mật khẩu tại `RegisterPage.tsx` thành "Tối thiểu 8 ký tự".

2. **Hỗ trợ đăng nhập linh hoạt bằng Email hoặc Số điện thoại**:
   - `LoginDto` (`src/modules/auth/presentation/dto/login.dto.ts`): cho phép nhập chuỗi email hoặc SĐT (@IsString + @IsNotEmpty) thay vì chỉ gò bó @IsEmail().
   - `AuthService.login` (`src/modules/auth/application/auth.service.ts`): phân tích định dạng identifier; tự động tìm theo email nếu có `@` hoặc chuẩn hóa và tìm kiếm theo SĐT qua `usersService.findByPhone` (kèm cơ chế fallback chéo).
   - Đồng bộ mô tả `LoginRequest` trong `documentation/api/openapi.yaml`.

3. **Tách biệt cập nhật nội dung mô tả tuyển dụng với thao tác bật/tắt tuyển dụng**:
   - Thêm `updateRecruitmentMessage` trong `AppContext.tsx` để cập nhật message mà không đảo trạng thái `isOpen`.
   - Điều chỉnh `OwnerStaffingPage.tsx` để form "Chỉnh sửa mô tả" gọi `updateRecruitmentMessage`, bảo lưu trạng thái `isOpen` hiện tại.
   - Nâng cấp `RecruitmentController.toggleRecruitment` và `VenuesService.setRecruitment` / `StaffingService.setRecruitment`: bảo lưu giá trị `recruitmentOpen` / `recruitmentMessage` hiện tại nếu tham số không được truyền vào.

4. **Truyền đầy đủ thông điệp tuyển dụng khi tạo Venue mới (`OwnerVenuesPage.tsx`)**:
   - Cập nhật hàm `addVenue` trong `AppContext.tsx` để gửi đầy đủ `recruitmentOpen` và `recruitmentMessage` lên `POST /venues` (thay vì bị drop).
   - Bổ sung state và checkbox `isRecruiting` ("Mở tuyển dụng Quản lý sân ngay sau khi tạo") trong modal tạo sân của `OwnerVenuesPage.tsx`.

5. **Xử lý hồ sơ ứng tuyển REVOKED & bổ nhiệm trong `OwnerStaffingPage.tsx`**:
   - Ẩn các nút "Mở lại xét duyệt" và "Bổ nhiệm lại" đối với hồ sơ `REVOKED`, hiển thị nhãn trạng thái giải thích rõ ràng "Đã thu hồi (Cần nộp hồ sơ mới để xét duyệt)".
   - Kiểm tra và vô hiệu hóa nút bổ nhiệm nếu cụm sân đang có Manager đương nhiệm, kèm gợi ý thu hồi quyền trước khi bổ nhiệm người mới.
   - Dọn dẹp import thừa `reopenApplication`.

6. **Hỗ trợ truy vấn lịch trống theo ngày (`GET /courts/:courtId/availability?date=...`)**:
   - Bổ sung tham số `date` tùy chọn vào `CourtsController.getAvailability` và cập nhật `openapi.yaml`. Giữ nguyên kiểm tra nghiêm ngặt `startsAt`/`endsAt` khi không truyền `date`.
   - Mở rộng `bookingsService.getBookingsForCourtDate` bao quát chính xác khung giờ lịch đặt theo múi giờ Việt Nam (UTC+7).
   - Tích hợp `VenueDetailPage.tsx` gọi API lấy tình trạng sân theo ngày, dùng so sánh timestamp chính xác và phối hợp cả backend availability lẫn local bookings fallback an toàn.

7. **Kết nối API feedback thật và tính điểm đánh giá trung bình động**:
   - Tự động nạp danh sách feedback từ `GET /venues/:venueId/feedback` trong `reloadVenuesAndCourts` của `AppContext.tsx`.
   - Thay thế điểm đánh giá hardcode `4.8 / 5.0` bằng giá trị trung bình tính toán động `avgRating` dựa trên danh sách feedback thực tế.

8. **Trả về `cancelledById` và bản địa hóa thông tin hủy booking**:
   - Bổ sung `cancelledById: booking.cancelledById ?? null` vào `toBookingWithCustomerProfile` trong `bookings.service.ts` và schema `Booking` trong `openapi.yaml`.
   - Cập nhật hiển thị bản địa hóa tiếng Việt tại `MyBookingsPage.tsx` ("Bạn tự hủy lịch đặt" / "Quản lý sân hủy lịch đặt") và `ManagerSchedulePage.tsx` ("Khách tự hủy" / "Quản lý sân hủy").

## Kiểm tra

- `python scripts/verify-architecture.py`: PASSED (84/84 files, 0 error).
- `python scripts/verify-openapi-coverage.py`: PASSED (35/35 operations, 0 missing, 0 extra).
- `python scripts/verify-status-codes.py`: PASSED (0 discrepancies).
- `python scripts/test-remedy-12-issues.py`: PASSED (12/12 audit findings 100% verified).
- `python scripts/deep-system-verification.py`: PASSED (Tất cả seed data, 5 intentional defect hooks HOOK-01 đến HOOK-05, logic nghiệp vụ thời gian và concurrency pass toàn diện).

## Vướng mắc và việc tiếp theo

- Toàn bộ 8 điểm sai lệch và lỗi hợp đồng dữ liệu giữa FE, BE và DB đã được khắc phục hoàn toàn.
- Dự án sẵn sàng cho bước kiểm thử end-to-end hoặc benchmark hiệu năng.
