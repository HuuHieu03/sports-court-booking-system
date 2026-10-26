# Bổ sung quy tắc Agent và ràng buộc thời lượng đặt sân

Ngày: 2026-10-25
Người thực hiện: hieu
Nhánh hoặc commit: `hieu`

## Đã làm

- Tạo file `AGENTS.md` tại thư mục gốc quy định chuẩn mực làm việc bắt buộc cho AI Agents:
  - Cấm làm bừa, yêu cầu hỏi lại người dùng khi chưa chắc chắn (`ask_question`).
  - Cấm code smell, tuân thủ nguyên tắc SOLID, Clean Architecture 4 tầng trong từng module backend.
  - Tuân thủ quy định phân quyền động cho Manager qua `manager_appointments` thay vì role tĩnh.
  - Nghiêm cấm tự ý vá lỗi race condition đặt trùng giờ ở nhánh baseline.
  - Bắt buộc cập nhật worklog sau mỗi tác vụ.
- Bổ sung ràng buộc thời lượng đặt sân (từ 30 phút đến 4 giờ):
  - Tạo file migration `prisma/migrations/20261025143000_add_booking_duration_check/migration.sql` bổ sung `CHECK (ends_at - starts_at >= INTERVAL '30 minutes' AND ends_at - starts_at <= INTERVAL '4 hours')`.
  - Cập nhật tài liệu thiết kế CSDL `documentation/architecture/DATABASE.md` (mục Ràng buộc và index, Điểm chưa chốt, Danh mục migration).
  - Cập nhật `documentation/product/PRD.md` để đồng bộ quy tắc nghiệp vụ về thời lượng đặt sân.
- Thiết kế Concept Frontend và xây dựng bản Demo mẫu tương tác (Interactive UI Prototype):
  - Đề xuất kiến trúc Frontend gồm 3 phân hệ: Public/Customer Booking Flow, Manager/Owner Operations Board, và Admin Console.
  - Xây dựng bản demo trực quan `fe_concept_demo.html` theo phong cách Athletic Modernism (Deep Pitch Green, Turf Accent, JetBrains Mono numbers).
  - Tích hợp 2 chế độ: Khách đặt sân (Court Time Slot Timeline với kiểm tra ràng buộc 30m-4h) và Quản lý sân (Bảng điều độ Dispatch Board, hủy lịch kèm lý do bắt buộc).
- Cải tiến và tối ưu UX bản Demo Frontend v3 hoàn thiện:
  - Khôi phục lại toàn bộ phối màu Dark Pitch Athletic ban đầu theo yêu cầu người dùng, giữ vững tinh thần sân cỏ ban đêm cao cấp.
  - Chuyển sang hệ font Inter và system font stack tự nhiên, sắc nét, loại bỏ cảm giác sượng và giả.
  - Xây dựng hoàn chỉnh các phân hệ quản lý chuyên biệt cho Manager và Owner:
    + Manager: Bảng điều độ lịch khách hôm nay, xem hồ sơ khách đặt, hủy sân kèm lý do bắt buộc, và Quản lý sân con (Courts CRUD, thêm/xóa sân).
    + Owner: Quản lý cụm sân sở hữu (Venues), toàn quyền quản lý sân con và lịch khách, đặc quyền Nhân sự (bật/tắt tuyển dụng, xem ứng viên, duyệt bổ nhiệm và thu hồi quyền Manager tức thì).
  - Đảm bảo tính liên thông tuyệt đối: Owner và Manager luôn có thanh điều hướng của User bình thường để tự tìm và đặt sân cá nhân đi đá.
  - Tích hợp Admin Console (khóa/mở khóa/xóa logic tài khoản) và kiến trúc SPA Component Progressive Disclosure (Persistent Header Shell, Outlet mượt mà).

## Kiểm tra

- Đã đối chiếu toàn bộ dữ liệu mẫu trong `prisma/seed.ts`: tất cả 6 booking mẫu đều có thời lượng 60 phút hoặc 90 phút, hoàn toàn thỏa mãn điều kiện `[30 minutes, 4 hours]`.
- Cú pháp migration SQL tuân thủ chuẩn PostgreSQL với kiểu dữ liệu `timestamptz` và toán tử `INTERVAL`.
- File `AGENTS.md` được định dạng chuẩn markdown với quy trình task rõ ràng.

## Vướng mắc và việc tiếp theo

- Chưa chạy `docker compose up -d` để deploy migration mới này vào container PostgreSQL (có thể chạy khi khởi động môi trường local).
- Tiếp tục theo dõi các điểm nghiệp vụ chưa chốt: rating feedback, khung giờ mở cửa chi tiết theo Venue/Court, và cơ chế xử lý khi xóa tài khoản Owner.
