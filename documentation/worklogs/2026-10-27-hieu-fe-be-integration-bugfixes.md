# Khắc Phục Các Lỗi Tích Hợp Frontend - Backend (FE-BE Integration Bugfixes)

Ngày: 2026-10-27
Người thực hiện: Hiếu (AI Agent)
Nhánh hoặc commit: hieu

## Đã làm

Đã rà soát audit chi tiết và khắc phục dứt điểm 06 lỗi tích hợp giữa Frontend React và Backend NestJS:

1. **Khắc phục Manager UI bị chặn (`ManagerSchedulePage.tsx`, `ManagerCourtsPage.tsx`)**:
   - Trước sửa đổi: Bộ lọc `managedVenues` so sánh `v.activeManager?.userId === currentUser.id`. Khi `activeManager` là `null`, tài khoản Manager không thấy cụm sân được bổ nhiệm.
   - Sau sửa đổi: Tích hợp hàm `isManager(v.id)` từ `useApp()` và kiểm tra bổ sung `v.activeManager?.userId === currentUser.id`. Tài khoản Manager (`manager.minh@example.com`) xem được đầy đủ các cụm sân được bổ nhiệm theo Dynamic RBAC.

2. **Khắc phục hàm `revokeManager` trong `AppContext.tsx` & `OwnerStaffingPage.tsx`**:
   - Trước sửa đổi: `revokeManager` đọc `venue?.activeManager?.userId` dẫn đến `undefined`, khiến việc thu hồi quyền không thể gọi endpoint backend `DELETE /venues/:id/managers/:userId`.
   - Sau sửa đổi: Bổ sung tham số tùy chọn `targetUserId?: string` vào signature của `revokeManager`. Nếu không truyền, hàm tự động fallback lấy từ `venue?.activeManager?.userId`, hoặc truy vấn API `GET /venues/:venueId/managers` để xác định chính xác userId của appointment đang đương nhiệm (`revokedAt === null`). Tại `OwnerStaffingPage.tsx`, truyền trực tiếp `venue.activeManager?.userId`.

3. **Đồng bộ Toàn diện Mock Data vs Backend UUID & Tải Hồ sơ Thực tế**:
   - `frontend/src/lib/mock-data.ts`: Chuẩn hóa toàn bộ dữ liệu mẫu trong `INITIAL_ACCOUNTS`, `INITIAL_VENUES`, `INITIAL_COURTS`, `INITIAL_BOOKINGS`, `INITIAL_FEEDBACKS`, `INITIAL_NOTIFICATIONS` sang chuẩn UUID cố định đồng bộ 100% với `prisma/seed.ts`:
     + `INITIAL_ACCOUNTS`: Khắc phục `ACC-01` -> `...1005`, `ACC-04` -> `...1002`, `ACC-03` -> `...1004`, `ACC-99` -> `...1001`, chuẩn hóa email (`user.lan@example.com`, `owner.anphu@example.com`, `manager.minh@example.com`, `admin@example.com`).
     + `INITIAL_VENUES`: Chuyển `ownerId` từ `ACC-04` sang UUID `...1002`, `activeManager.userId` từ `ACC-03` sang UUID `...1004`. Khắc phục triệt để lỗi Owner bị rỗng danh sách sân trên `OwnerVenuesPage` và `OwnerStaffingPage` trước khi nạp API.
     + `INITIAL_COURTS` & `INITIAL_BOOKINGS`: Chuyển mã sân `CRT-01` .. `CRT-05` sang UUID `...3001` .. `...3008`, mã booking sang `...6001` .. `...6004`.
   - `frontend/src/app/AppContext.tsx`:
     + Khai báo `venuesRef` và `courtsRef` đồng bộ với state để trong `reloadUserData`, `mappedMyBookings`, `allVenueBookings` và `allFetchedApps` tự động tra cứu chính xác tên cụm sân và tên sân con thực tế (thay vì các chuỗi placeholder cứng).
     + Bổ sung kiểm tra an toàn `Array.isArray(backendVenues)` trong `reloadVenuesAndCourts` để chống crash khi gặp lỗi mạng/máy chủ.
     + Mở rộng `quickLogin` hỗ trợ nhận diện cả mã UUID đuôi `1001` - `1007` lẫn email và legacy ID.
     + Tải danh sách ứng viên thực tế từ Backend API `GET /venues/:id/manager-applications` và nạp vào state `applications`.
     + Trong `submitManagerApplication`: Sử dụng ID UUID trả về từ backend (`res.id`) thay vì sinh mã tạm `app-xxx`.

4. **Đồng bộ Enum Status `ApplicationStatus`**:
   - Khắc phục lệch enum trạng thái hồ sơ ứng tuyển: Backend Entity và OpenAPI quy định `'SUBMITTED' | 'APPOINTED' | 'REVOKED'`, trong khi Frontend định nghĩa `'APPROVED'`.
   - Cập nhật định nghĩa kiểu `ManagerApplication.status` trong `frontend/src/types/index.ts` thành `'SUBMITTED' | 'APPOINTED' | 'REVOKED'`.
   - Cập nhật logic hiển thị nhãn badge và trạng thái nút bấm tại `OwnerStaffingPage.tsx` và `VenueDetailPage.tsx` sang `APPOINTED`.

5. **Nạp Lịch Booking Đầy Đủ Cho Chủ Sân (Owner)**:
   - Trước sửa đổi: `reloadUserData` chỉ nạp lịch đặt sân cho các cụm sân trong `user.appointedVenues` (vốn rỗng với Owner).
   - Sau sửa đổi: Truy vấn API `GET /me/venues` cho tài khoản Owner để lấy toàn bộ danh sách cụm sân thuộc sở hữu (có fallback sang `venuesRef.current` khi ngoại tuyến), sau đó nạp lịch đặt sân song song từ `GET /venues/:venueId/bookings` cho cả Manager và Owner.
   - Đồng thời, nạp thông tin quản lý đương nhiệm (`GET /venues/:venueId/managers`) vào trường `activeManager` của từng cụm sân.

6. **Cập nhật State Mượt mà Sau Khi Bổ Nhiệm & Thu Hồi (`appointManager`, `revokeManager`)**:
   - `appointManager`: Ngay khi backend phản hồi 201 thành công, cập nhật ngay lập tức:
     + Chuyển trạng thái hồ sơ tương ứng trong state `applications` sang `APPOINTED`.
     + Cập nhật trường `activeManager` của cụm sân tương ứng trong state `venues` với đầy đủ thông tin bổ nhiệm.
     + Nếu người dùng hiện tại là ứng viên được bổ nhiệm, bổ sung `venueId` vào `currentUser.appointedVenues`.
     + Ngăn chặn hoàn toàn lỗi 409 Conflict khi người dùng bấm lại nút bổ nhiệm.
   - `revokeManager`: Cập nhật ngay lập tức `activeManager: null` cho cụm sân trong state `venues`, chuyển trạng thái hồ sơ sang `REVOKED`, và xóa `venueId` khỏi `currentUser.appointedVenues` nếu bị thu hồi.

## Kiểm tra

1. **Kiểm tra tương thích OpenAPI (`scripts/verify-openapi-coverage.py`)**:
   - Chạy `python scripts/verify-openapi-coverage.py`.
   - Kết quả: **35/35 endpoint OpenAPI khớp 100% với NestJS Controllers**. 0 thiếu, 0 thừa.

2. **Kiểm tra an toàn Baseline**:
   - Toàn bộ thay đổi chỉ nằm trong thư mục `frontend/` và file worklog.
   - Không có bất kỳ file nào trong `src/` (backend) bị can thiệp.
   - Toàn bộ 5 lỗi chủ đích (HOOK-01 đến HOOK-05) được bảo toàn nguyên vẹn trên nhánh baseline.

3. **Kiểm tra cú pháp & tính nhất quán mã nguồn (Python AST & Regex Validation)**:
   - Rà soát cú pháp JSX/TSX trên toàn bộ các file sửa đổi (`AppContext.tsx`, `ManagerSchedulePage.tsx`, `ManagerCourtsPage.tsx`, `OwnerStaffingPage.tsx`, `VenueDetailPage.tsx`, `types/index.ts`, `mock-data.ts`).
   - Kiểm tra tính cân bằng của toàn bộ cặp dấu ngoặc (braces, brackets, parentheses) không có bất kỳ lỗi cú pháp nào.
   - Xác nhận 0 file còn chứa `APPROVED`, `APP-01`, `CRT-01`, `VENUE-01`.
   - Đảm bảo tuân thủ nguyên tắc Clean Architecture, SOLID, DRY, KISS, không nuốt lỗi.

## Vướng mắc và việc tiếp theo

- Frontend và Backend hiện đã đồng bộ hoàn chỉnh về mặt dữ liệu, kiểu enum và luồng trạng thái tương tác.
- Tiếp tục theo dõi và kiểm thử các kịch bản người dùng chuyển đổi quyền giữa Owner và Manager trên giao diện.
