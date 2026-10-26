# Xây dựng và Thiết lập Giao diện Frontend UI/UX (PitchSync MVP)

Ngày: 2026-10-25
Người thực hiện: Antigravity AI
Nhánh hoặc commit: feat/frontend-ui-ux-implementation

## Đã làm

1. **Khởi tạo và thiết lập hạ tầng Frontend (`frontend/`)**:
   - `package.json`: Cấu hình React 18, Vite, TypeScript, Tailwind CSS, Lucide icons, clsx.
   - `tsconfig.json` & `tsconfig.node.json`: Cấu hình TypeScript compiler, path alias `@/*` -> `src/*`, strict mode.
   - `vite.config.ts`: Cấu hình Vite React plugin, alias và proxy API `/api/v1` trỏ về backend `localhost:3000`.
   - `tailwind.config.js` & `postcss.config.js`: Cấu hình Dark Pitch Athletic theme (`slate-950`, `emerald-500`, `amber`, `rose`), font `Inter`.
   - `index.html`: Cấu hình tiêu đề, Google font Inter và dark mode viewport.
   - `src/styles/globals.css`: Tích hợp Tailwind, animations (`fade-in`), thanh cuộn athletic và selection highlighting.

2. **Xây dựng Domain Models & Unified State Store (`src/app/`, `src/types/`, `src/lib/`)**:
   - `src/types/index.ts`: Định nghĩa đầy đủ kiểu dữ liệu: `Account`, `Venue`, `Court`, `Booking`, `ManagerApplication`, `Feedback`, `NotificationItem`, `UserRole`.
   - `src/lib/utils.ts`: Hàm tính toán tiền VND, format ngày giờ Việt Nam, tính thời lượng và validator đặt sân (thời lượng 30 phút - 4 giờ theo ràng buộc CHECK constraint).
   - `src/lib/mock-data.ts`: Dữ liệu mock phong phú bao gồm tài khoản (User, Manager, Owner, Admin), cụm sân, sân con, lịch đặt sân, hồ sơ ứng tuyển, đánh giá và thông báo.
   - `src/app/AppContext.tsx`: Quản lý state tập trung, giả lập chuyển đổi vai trò (Role Simulator), xử lý đặt sân, hủy sân của cá nhân, hủy sân khách hàng với lý do bắt buộc (CHECK constraint), phê duyệt/thu hồi Manager, xóa logic sân con và tài khoản.
   - `src/lib/api-client.ts`: Module gọi API chuẩn OpenAPI có fallback local state giúp frontend chạy độc lập hoàn hảo.

3. **Xây dựng Persistent Layout Shell & Shared Components (`src/components/`)**:
   - `Header.tsx`: Top bar cố định với logo bóng đá PitchSync, huy hiệu MVP, bộ điều hướng linh hoạt theo vai trò, Role Simulator trực quan, chuông thông báo Outbox và hồ sơ người dùng.
   - `Footer.tsx`: Chân trang hiển thị thông tin kiến trúc phần mềm (Modular Monolith, UTC timestamptz, Dynamic RBAC).
   - `Modal.tsx`: Hộp thoại modal chuẩn accessibility (hỗ trợ phím Escape, click backdrop để đóng).
   - `NotificationsPopover.tsx`: Drawer xem danh sách thông báo Outbox theo thời gian thực (xác nhận đặt, thông báo hủy sân kèm lý do, bổ nhiệm manager).
   - `ToastContainer.tsx`: Hệ thống thông báo toast góc màn hình mượt mà, phân loại màu sắc thể thao.

4. **Triển khai 7 Phân hệ Nghiệp vụ (`src/modules/`)**:
   - `venues/ExplorePage`: Khám phá danh sách cụm sân bóng, tìm kiếm theo tên/địa chỉ, chọn ngày, hiển thị huy hiệu tuyển dụng.
   - `venues/VenueDetailPage`: Chi tiết cụm sân, bảng giờ tương tác theo thời gian thực (Time slot timeline), tính giá tự động, kiểm tra ràng buộc 30m - 4h, đánh giá khách hàng (Feedback) và modal ứng tuyển Manager.
   - `bookings/MyBookingsPage`: Xem danh sách booking cá nhân (User, Manager, Owner đều có quyền), hủy lượt đặt miễn phí trước giờ thi đấu.
   - `bookings/ManagerSchedulePage`: Bảng điều độ lịch khách dành cho Manager & Owner, xem hồ sơ khách đặt, hủy sân khách với lý do bắt buộc (CHECK constraint) và gửi Outbox notification.
   - `venues/ManagerCourtsPage`: CRUD sân con, kiểm tra chặn xóa sân nếu đang có lịch đặt CONFIRMED sắp tới theo quy định PRD.
   - `venues/OwnerVenuesPage`: Quản lý cụm sân thuộc quyền sở hữu của Owner, xem tình trạng Manager, tạo cụm sân mới.
   - `staffing/OwnerStaffingPage`: Bật/tắt chiến dịch tuyển dụng, quản lý Manager đương nhiệm (tối đa 1 Manager theo DB constraint), thu hồi quyền tức thì (revoked_at), duyệt bổ nhiệm ứng viên có đồng ý chia sẻ thông tin (`consented_at`).
   - `users/AdminUsersPage`: Quản trị tài khoản hệ thống (khóa, mở khóa, xóa mềm soft delete bảo toàn lịch sử booking).
   - `auth/AuthModal`: Modal hỗ trợ đăng nhập và đăng ký tài khoản mới với lựa chọn USER hoặc OWNER.

## Đánh giá thẩm mỹ & Hoàn thiện UI/UX (Review & Refinement)

5. **Đánh giá thẩm mỹ & Khắc phục khiếm khuyết UI/UX**:
   - **Xử lý triệt để lỗi phát hiện trùng lịch (Overlap Bug)**: Cải tiến thuật toán phát hiện trùng lịch đặt sân trong `VenueDetailPage.tsx` và `utils.ts` bằng `isTimeOverlapping(slot.start, slot.end, b.startTime, b.endTime)`, khắc phục triệt để lỗi so khớp nông `startTime === slot.start` (tránh đặt trùng các ca kéo dài 90-120 phút).
   - **Đồng bộ hóa ngữ cảnh cụm sân (Context Sync)**: Khắc phục trạng thái cục bộ tách rời trong `ManagerSchedulePage` và `ManagerCourtsPage`, chuyển sang liên kết trực tiếp với `selectedVenueId` từ `AppContext` để khi Chủ sân bấm "Quản lý sân con" hay "Điều độ lịch khách" từ bất kỳ cụm sân nào, giao diện tự động chuyển đúng cụm sân đó.
   - **Bổ sung thanh điều hướng thích ứng Mobile/Tablet (Responsive Shell)**: Tích hợp menu trượt (slide-down mobile drawer) kèm nút toggle hamburger `☰`/`✕` trên `Header.tsx`, đảm bảo người dùng trên màn hình nhỏ/tablet không bị mất menu điều hướng giữa các phân hệ.
   - **Tích hợp Modal Đăng nhập / Đăng ký (`AuthModal`)**: Đã kết nối `AuthModal` trực tiếp vào `Header.tsx` qua avatar và liên kết chuyển tài khoản, kích hoạt luồng auth mượt mà thay vì bỏ sót dead component.
   - **Mở rộng dải Time Slots & Tinh chỉnh trải nghiệm (UX Rhythms)**:
     + Bổ sung đầy đủ các khung giờ trong ngày: Sáng (06:00-09:00), Chiều (15:30-18:00), Tối Prime-time (18:00-22:00), Đêm (22:00-23:30).
     + Hỗ trợ bấm lần 2 để bỏ chọn (Toggle deselect) slot trực tiếp trên nút giờ.
     + Thanh xác nhận đặt sân (Confirmation Bar) được ghim nổi (sticky bottom drawer) kèm backdrop-blur, giúp người dùng không bị mất dấu khi cuộn trang.
   - **Cân chỉnh nhịp thị giác & Font chữ (Visual Rhythm & Contrast)**:
     + Chuẩn hóa căn lề dọc `align-middle` trên toàn bộ bảng dữ liệu (`ManagerSchedulePage`, `AdminUsersPage`).
     + Đặt `min-h-[240px]` trên các thẻ cụm sân của `ExplorePage` để tất cả nút hành động nằm trên cùng một đường thẳng ngang.
     + Bổ sung badge số lượng lịch đặt CONFIRMED trên từng thẻ sân con của `ManagerCourtsPage` để cảnh báo sớm trước khi bấm xóa.

6. **Cập nhật & Khắc phục khiếm khuyết theo Báo cáo Thẩm định độc lập (DeepInvestigator Audit)**:
   - **Hoàn thiện chức năng Sửa Sân Con (Đạt chuẩn CRUD 100%)**:
     + Bổ sung phương thức `updateCourt(courtId: string, updatedData: Partial<Court>)` vào `AppContext.tsx` và `AppContextType`.
     + Triển khai nút "Sửa" và Modal Chỉnh sửa thông tin sân con (sửa tên, loại sân 5/7/11, đơn giá thuê mỗi giờ `hourlyRate`, và mô tả) tại `ManagerCourtsPage.tsx`.
   - **Khắc phục lỗi phân quyền Dropdown chọn cụm sân**:
     + Tại `ManagerSchedulePage.tsx`, `ManagerCourtsPage.tsx` và `OwnerStaffingPage.tsx`: Lọc danh sách dropdown theo đúng quyền thực tế:
       * `OWNER`: chỉ hiển thị các cụm sân do mình sở hữu (`v.ownerId === currentUser.id`).
       * `MANAGER`: chỉ hiển thị các cụm sân mình được bổ nhiệm (`(currentUser.appointedVenues || []).includes(v.id)`).
     + Loại bỏ hoàn toàn fallback `|| venues[0]` nguy hiểm khi người dùng không sở hữu/quản lý cụm sân nào, thay thế bằng hiển thị Empty State "Bạn chưa có quyền quản trị cụm sân nào".
     + Tự động đồng bộ `selectedVenueId` sang cụm sân hợp lệ đầu tiên nếu cụm sân hiện tại không nằm trong danh sách được phép quản lý.
   - **Sửa biểu thức lọc cụm sân của Owner tại `OwnerVenuesPage.tsx`**:
     + Đổi từ `venues.filter(v => v.ownerId === currentUser.id || currentUser.role === 'OWNER')` thành `venues.filter(v => v.ownerId === currentUser.id)` để ngăn chặn triệt để rò rỉ dữ liệu cụm sân của các Owner khác.
   - **Khởi tạo ngày động & Sửa múi giờ trong `validateBookingTime` & `formatDateVN`**:
     + Tạo hàm tiện ích `getTomorrowDateString()` tính ngày mai theo giờ địa phương (`getFullYear()`, `getMonth() + 1`, `getDate()`) thay vì dùng `toISOString()` bị lệch sang ngày hôm nay vào các khung giờ sáng sớm (00:00 - 06:59 UTC+7).
     + Tích hợp `getTomorrowDateString()` vào `VenueDetailPage.tsx` và `ExplorePage.tsx`.
     + Sửa hàm `validateBookingTime`: kiểm tra chặt chẽ `isNaN(bookingDate.getTime())` để chặn chuỗi ngày giờ rỗng/không hợp lệ lọt qua validation.
     + Sửa hàm `formatDateVN`: parse trực tiếp chuỗi `YYYY-MM-DD` để ngăn lỗi lùi 1 ngày do UTC midnight ở các múi giờ Tây bán cầu.
   - **Bổ sung Empty State khi Cụm sân chưa có sân con**:
     + Tại `VenueDetailPage.tsx`: hiển thị Empty State card kèm icon `Building2` thân thiện và chỉ dẫn rõ ràng khi cụm sân chưa có sân con nào được cấu hình.
   - **Thay thế Unicode Emoji bằng icon chuẩn `lucide-react`**:
     + Thay thế triệt để các ký tự emoji trong `Header.tsx`, `ToastContainer.tsx`, `Modal.tsx`, `NotificationsPopover.tsx`, `VenueDetailPage.tsx`, `ManagerCourtsPage.tsx`, `ManagerSchedulePage.tsx`, `OwnerStaffingPage.tsx`, `OwnerVenuesPage.tsx`, `ExplorePage.tsx`, `MyBookingsPage.tsx`, `AdminUsersPage.tsx` bằng SVG icons chuẩn (`Calendar`, `Clock`, `CheckCircle2`, `XCircle`, `AlertCircle`, `MapPin`, `Bell`, `Edit2`, `Trash2`, `Plus`, `Search`, `Building2`, `Users`, `Shield`, `Layers`, `Menu`, `X`, v.v.).
   - **Tối ưu thanh Header trên màn hình 1024px - 1280px (Header Congestion)**:
     + Tinh chỉnh padding (`px-2 py-1 xl:px-2.5 xl:py-1.5`), font-size (`text-[11px] xl:text-xs`) và khoảng cách gap giữa các nút điều hướng.
     + Ẩn nhãn "Vai trò:" tĩnh trên màn hình dưới 1536px, co gọn padding của các nút role switcher (`px-1.5 lg:px-2 xl:px-2.5`) và giữ nút toggle mượt mà, không bị vỡ layout trên Laptop 13-14 inch.
   - **Đồng bộ trường `deletedAt` cho Soft Delete Account**:
     + Thêm `deletedAt?: string` vào interface `Account` trong `src/types/index.ts`.
     + Hàm `softDeleteAccount` trong `AppContext.tsx` ghi nhận thời gian `deletedAt: new Date().toISOString()`.
     + Hiển thị nhãn thời gian `deletedAt` tại bảng quản trị tài khoản `AdminUsersPage.tsx`.
   - **Xử lý trạng thái ứng viên khi thu hồi Manager & Hỗ trợ Nộp lại / Mở lại xét duyệt**:
     + Thêm trạng thái `'REVOKED'` vào kiểu `ManagerApplication.status` trong `src/types/index.ts`.
     + Khi gọi `revokeManager`, trạng thái đơn được cập nhật sang `'REVOKED'`.
     + Thêm phương thức `reopenApplication(applicationId)` vào `AppContext.tsx` cho phép Owner mở lại xét duyệt hồ sơ bị thu hồi về trạng thái `SUBMITTED`.
     + Trong `OwnerStaffingPage.tsx`, cung cấp 2 lựa chọn cho đơn `REVOKED`: "Mở lại xét duyệt" hoặc "Bổ nhiệm lại".
     + Trong `VenueDetailPage.tsx` và `submitManagerApplication`: cho phép ứng viên bị thu hồi nộp lại đơn ứng tuyển (`Nộp lại đơn ứng tuyển`), đồng thời ngăn chặn việc nộp trùng lặp khi đang ở trạng thái `SUBMITTED`.

## Kiểm tra

- Code tuân thủ Clean Architecture, không import lẫn lộn giữa các tầng, chia tách rõ ràng giữa component trình diễn và state logic.
- Ràng buộc nghiệp vụ được cài đặt chặt chẽ:
  + Đặt sân: 30 phút <= duration <= 240 phút (30m - 4h) và giờ bắt đầu ở tương lai (tính theo giờ địa phương).
  + Hủy sân của khách: Bắt buộc nhập lý do hủy (CHECK constraint).
  + Manager bổ nhiệm: Chặn bổ nhiệm nếu cụm sân đã có Manager đương nhiệm; thu hồi tức thì và cập nhật đơn sang `REVOKED`.
  + Phân quyền cụm sân: Dropdown lọc chuẩn xác theo quyền sở hữu của Owner và quyền bổ nhiệm của Manager, loại bỏ hoàn toàn fallback nguy cơ rò rỉ dữ liệu `|| venues[0]`.
  + Sân con: Đạt chuẩn CRUD 100% (Thêm, Sửa thông tin, Xóa logic kèm kiểm tra lịch đặt CONFIRMED sắp tới).
  + Tài khoản: Xóa mềm `DELETED` ghi nhận `deletedAt` và bảo toàn đơn đặt sân cũ.
- Thẩm mỹ: Toàn bộ emoji được thay thế bằng SVG icons `lucide-react` sắc nét; Header hiển thị thoáng mắt và cân đối trên mọi kích thước màn hình từ 1024px đến 1920px.


