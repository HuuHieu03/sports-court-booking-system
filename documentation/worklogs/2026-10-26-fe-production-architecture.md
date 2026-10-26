# Tái cấu trúc Frontend thành Hệ thống Web Đa Phân Hệ (Production Architecture)

Ngày: 2026-10-26  
Người thực hiện: Antigravity Agent  
Nhánh: main  

## Đã làm

1. **Hệ thống Routing & URL thực tế (`react-router-dom`)**:
   - Cài đặt dependency `react-router-dom` vào `frontend/`.
   - Thiết lập cấu trúc định tuyến đa cổng tại `src/routes/AppRoutes.tsx`:
     - Public & Customer: `/` (ExplorePage), `/venues/:id` (VenueDetailPage), `/my-bookings` (MyBookingsPage - Protected).
     - Standalone Auth: `/login` (LoginPage), `/register` (RegisterPage).
     - Operational Portal: `/manage/schedule`, `/manage/courts` (RequireManagerOrOwner Guard).
     - Owner Workspace: `/owner/venues`, `/owner/staffing` (RequireRole 'OWNER' Guard).
     - Enterprise Admin Console: `/admin/users` (RequireRole 'ADMIN' Guard).
     - Error & Fallback: `/403` (ForbiddenPage), `*` (NotFoundPage).
   - Xây dựng 3 Route Guards: `RequireAuth.tsx`, `RequireRole.tsx`, `RequireManagerOrOwner.tsx`.

2. **Xóa bỏ hoàn toàn thanh Role Simulator trên Header**:
   - Header hiển thị người dùng thật (Avatar, Tên, Role badge), dropdown thông tin tài khoản và nút Đăng xuất.
   - Thêm các nút chuyển không gian trực quan:
     - Owner thấy: "Vào Cổng Chủ Sân →" (`/owner/venues`).
     - Manager thấy: "Vào Cổng Quản Lý Sân →" (`/manage/schedule`).
     - Admin thấy: "Vào Admin Console →" (`/admin/users`).
   - Trong Portal quản lý luôn có nút "← Về Trang Đặt Sân Cá Nhân" để Owner và Manager tự tìm sân đi đá bóng.

3. **Phân tách 3 Layouts chuyên biệt**:
   - `CustomerLayout.tsx`: Header thể thao + Content + Footer + ToastContainer.
   - `PortalLayout.tsx`: Header điều hành màu hổ phách/xanh lá với các tab nghiệp vụ và nút chuyển về trang cá nhân.
   - `AdminLayout.tsx`: Sidebar màu đen xám chuẩn Enterprise, tách biệt hoàn toàn khỏi layout thể thao của khách hàng.

4. **Module Xác thực & Quản lý Phiên (Authentication & Session Persistence)**:
   - `LoginPage.tsx`: Form đăng nhập chuẩn, thông báo lỗi nếu tài khoản bị khóa (`LOCKED`), cụm nút Quick Login 1-click cho 4 vai trò mẫu (`Admin Tổng`, `Chủ Sân An Phú`, `Quản Lý Minh`, `Khách Lan`) kèm nút test tài khoản `LOCKED`.
   - Hỗ trợ tham số `?redirect=...`: Khi khách vãng lai chưa đăng nhập bấm đặt sân hoặc ứng tuyển, tự động chuyển hướng sang `/login?redirect=...` và sau khi đăng nhập thành công sẽ quay lại đúng trang cụm sân ban đầu.
   - `RegisterPage.tsx`: Form đăng ký đầy đủ theo PRD với tùy chọn vai trò ban đầu (`USER` hoặc `OWNER`), có ghi chú rõ ràng về việc Manager được bổ nhiệm động.
   - `AppContext.tsx`: Tích hợp lưu phiên đăng nhập và dữ liệu domain vào `localStorage`, đồng bộ động khi có thay đổi bổ nhiệm/thu hồi quyền Manager và khóa tài khoản.

## Cải tiến & Hoàn thiện sau Đánh giá Phản biện (Subagent Review & Hardening)

1. **Bảo toàn và Tự động Khôi phục Khung giờ Đặt sân khi Chuyển hướng Đăng nhập**:
   - Khi Khách vãng lai bấm "Xác nhận đặt sân ngay", hệ thống mã hóa toàn bộ thông tin lượt đặt dự kiến (`courtId`, `date`, `start`, `end`) vào tham số `?redirect=...`.
   - Khi đăng nhập xong và quay lại `VenueDetailPage`, trang tự động nhận diện query parameters, phục hồi ngày và khung giờ sân con, đồng thời tự động mở sẵn Modal Xác nhận để người dùng chốt đặt sân với 1-click mà không phải thao tác lại từ đầu.
   - Thêm nút dọn query parameter an toàn khi modal đóng hoặc đặt sân hoàn tất.

2. **Chống Lỗ hổng Chuyển hướng Hở (Open Redirect Protection)**:
   - Thêm hàm kiểm tra `getSafeRedirectUrl` tại `LoginPage.tsx` và `RegisterPage.tsx`, ngăn chặn việc chuyển hướng sang domain ngoài độc hại (chỉ cho phép đường dẫn nội bộ bắt đầu bằng `/` và không cho phép `//` hoặc `\`).

3. **Khắc phục Xung đột Trạng thái Phiên của Tài khoản Bị khóa (LOCKED Account State)**:
   - Sửa `AppContext.tsx`: Đảm bảo tài khoản bị khóa (`LOCKED`) hoặc đã xóa (`DELETED`) không bao giờ được phục hồi làm phiên hoạt động (`currentUser`) khi khởi tạo từ `localStorage`.
   - Khi tài khoản đang trong phiên bị Admin khóa (`toggleAccountStatus`), hệ thống tự động đăng xuất (`logout()`) và dọn sạch session thay vì để treo giao diện.
   - Đồng bộ thông báo lỗi chuẩn xác giữa `quickLogin` và form login thường.
   - Cập nhật `Header.tsx`: Kiểm tra chặt chẽ `isAuthenticated && currentUser` để không hiển thị dropdown người dùng cho tài khoản không hợp lệ.

4. **Bảo vệ Tài khoản Quản trị Viên Hiện tại trong Admin Console**:
   - Tại `AdminUsersPage.tsx`, chặn nút "Khóa" và "Xóa mềm" đối với chính tài khoản Admin đang đăng nhập (`acc.id === currentUser?.id`) để tránh rủi ro tự khóa mình ra khỏi hệ thống.

5. **Đồng bộ Dynamic RBAC từ CSDL thực tế**:
   - Tinh chỉnh `isManager()` trong `AppContext.tsx`, `ManagerCourtsPage.tsx` và `ManagerSchedulePage.tsx` để căn cứ chuẩn xác theo `venue.activeManager?.userId === currentUser.id` từ CSDL, tuân thủ nghiêm ngặt quy định tại `AGENTS.md`.

6. **Phục hồi & Phòng thủ Lỗi Cụm Sân Không Tồn Tại**:
   - Xử lý kịch bản URL `/venues/:id` với mã sân không hợp lệ: Render giao diện thông báo lỗi thân thiện kèm nút điều hướng về trang chủ thay vì crash runtime.

## Kiểm tra

- `npm run build` trong `frontend/`:
  - `tsc && vite build` hoàn thành với **0 lỗi TypeScript, 0 warnings**.
  - Đóng gói Vite production thành công: `dist/assets/index-BYmd6W2Z.js` (342.43 kB).
- Kiểm tra tính toàn vẹn nghiệp vụ:
  - Giữ nguyên ràng buộc đặt sân 30 phút - 4 giờ (`validateBookingTime`).
  - Giữ nguyên thuật toán chống trùng giờ `isTimeOverlapping`.
  - Giữ nguyên CRUD sân con có validate không cho xóa khi đang có booking.
  - Giữ nguyên Outbox notifications queue.

## Tinh chỉnh Hoàn thiện & Khắc phục Khiếm khuyết (Hardening & Edge Cases)

1. **Thêm trường "Xác nhận mật khẩu" (`confirmPassword`) tại `RegisterPage.tsx`**:
   - Bổ sung ô nhập `confirmPassword` bên cạnh ô `password` (grid 2 cột trên màn hình sm).
   - Kiểm tra `password === confirmPassword` trước khi submit. Nếu không khớp hiển thị thông báo lỗi tường minh: "Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại!".
   - Tự động xóa thông báo lỗi khi người dùng bắt đầu chỉnh sửa mật khẩu (`onChange`).

2. **Kiểm tra Tính Khả Dụng & Dọn Dẹp URL khi Khôi Phục Slot tại `VenueDetailPage.tsx`**:
   - Khi khôi phục slot từ query param (`courtId`, `date`, `start`, `end`), kiểm tra xem slot đó có bị trùng với bất kỳ booking `CONFIRMED` nào trong hệ thống hay không bằng hàm `isTimeOverlapping`.
   - Nếu slot đã bị người khác đặt mất: hiển thị toast cảnh báo: "Khung giờ bạn chọn vừa có người đặt trước. Vui lòng chọn khung giờ khác!", không mở Modal chốt đơn và dọn sạch query param URL.
   - Thêm phòng thủ: Kiểm tra `targetCourt.status === 'MAINTENANCE'` và `validateBookingTime(targetDate, qStart, qEnd)` để ngăn chặn việc khôi phục các slot quá khứ hoặc sân đang bảo trì.
   - Dọn sạch query params khỏi URL ngay khi khôi phục thành công (với `{ replace: true }`), ngăn chặn tình trạng re-trigger modal khi state `bookings` hoặc `currentUser` thay đổi, và bảo đảm URL sạch sẽ.

3. **Khôi phục Tự Động cho Luồng Ứng Tuyển Quản Lý (`applyModal`)**:
   - Khi khách chưa đăng nhập bấm nút "Ứng tuyển làm Quản lý", điều hướng sang `/login?redirect=${encodeURIComponent('/venues/' + venueId + '?action=apply')}`.
   - Khi đăng nhập xong quay lại, `useEffect` phát hiện `searchParams.get('action') === 'apply'` thì tự động mở sẵn Modal Ứng tuyển cho người dùng và dọn sạch query param `action`.
   - Bổ sung kiểm tra trạng thái tuyển dụng (`venue.isRecruiting`) và tình trạng hồ sơ (`myApp?.status === 'SUBMITTED' | 'APPROVED'`) để hiển thị thông báo phù hợp thay vì mở modal không hợp lệ.

4. **Nâng cấp Hệ Thống Toast Hỗ Trợ Loại `warning`**:
   - Bổ sung type `'warning'` vào `ToastMessage` trong `AppContext.tsx`.
   - `ToastContainer.tsx` bổ sung giao diện amber hổ phách với icon `AlertCircle` chuyên biệt cho các cảnh báo xung đột lịch hoặc bảo trì.

## Kiểm tra Thực tế (Verification Record)

- **Deep Verification (Build thực tế)**:
  - Chạy `npm run build` trong `frontend/`:
    `tsc && vite build` hoàn thành xuất sắc **100% (0 errors, 0 warnings)**.
    Tạo bundle production: `dist/assets/index-CLhHb5xg.js` (345.22 kB) và `dist/assets/index-DatY8il3.css` (36.22 kB).
- **Domain & Concurrency Integrity**:
  - Tuân thủ nguyên tắc baseline intentional defect tại backend (không chạm vào backend concurrency code).
  - Đảm bảo logic kiểm tra trùng lịch phía client dùng chung hàm chuẩn `isTimeOverlapping` và `validateBookingTime`.

## Bổ sung Cải tiến UI/UX & Thuật ngữ Nghiệp vụ (Session Updates)

1. **Chuẩn hóa Thuật ngữ Nghiệp vụ (Loại bỏ hoàn toàn từ "Điều độ")**:
   - Khắc phục từ ngữ công nghiệp "Điều độ" (dispatch) vốn không phù hợp với văn hóa quản lý sân bóng đá thể thao.
   - Thay thế đồng bộ bằng các thuật ngữ tự nhiên, thân thiện:
     - `ManagerSchedulePage`: **"Lịch Sân Khách Hôm Nay"** & **"Danh Sách Đặt Sân Của Khách"**.
     - `PortalLayout`: Menu điều hướng chuyển thành **"Lịch Sân Khách Hôm Nay"** trên cả bản Desktop và Mobile.
     - `Header`: Dropdown profile người dùng chuyển thành **"📋 Cổng Quản Lý Sân Khách"**.
     - `RegisterPage`: Mô tả vai trò Owner cập nhật thành **"quản lý lịch đặt sân và bổ nhiệm Quản lý"**.
     - `OwnerStaffingPage`: Ghi chú quyền hạn bổ nhiệm cập nhật thành **"theo dõi, quản lý lịch đặt sân của khách và quản lý sân con"**.

2. **Xây dựng & Tích hợp Bộ Chọn Ngày Mini-Calendar Popover (`components/DatePicker.tsx`)**:
   - Loại bỏ các ô `<input type="date">` mặc định của trình duyệt (vốn bị lỗi icon tối màu, hiển thị định dạng US `MM/DD/YYYY` trên Windows Chrome).
   - Thiết kế `DatePicker` popover tương tác cao:
     - Hiển thị ngày theo định dạng chuẩn Việt Nam (`DD/MM/YYYY`).
     - Lưới lịch trực quan với phím chuyển tháng/năm, tiêu đề thứ tiếng Việt (`T2` - `CN`).
     - Tự động làm nổi bật ngày hôm nay, ngày đang chọn, và vô hiệu hóa các ngày quá khứ (`minDate`).
     - Nút chọn nhanh: "Hôm nay", "Ngày mai", và nút Xóa bộ lọc (`allowClear`).
     - Click outside tự động đóng dropdown.
   - Đã tích hợp đồng bộ vào:
     - **`VenueDetailPage.tsx`**: Chọn ngày xem lịch và đặt sân.
     - **`ExplorePage.tsx`**: Bộ lọc tìm kiếm sân theo ngày đá.
     - **`ManagerSchedulePage.tsx`**: Bộ lọc lịch sân khách theo ngày, mặc định hiển thị lịch hôm nay với khả năng xem tất cả ngày.

3. **Kiểm tra Trạng thái Hoạt động (Live Verification)**:
   - Server Vite dev server tiếp tục chạy ổn định tại `http://localhost:5173/`.
   - Toàn bộ các component cập nhật được Hot Module Replacement (HMR) tức thì không có lỗi runtime.


