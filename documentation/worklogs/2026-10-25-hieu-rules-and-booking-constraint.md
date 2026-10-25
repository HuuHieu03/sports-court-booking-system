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

## Kiểm tra

- Đã đối chiếu toàn bộ dữ liệu mẫu trong `prisma/seed.ts`: tất cả 6 booking mẫu đều có thời lượng 60 phút hoặc 90 phút, hoàn toàn thỏa mãn điều kiện `[30 minutes, 4 hours]`.
- Cú pháp migration SQL tuân thủ chuẩn PostgreSQL với kiểu dữ liệu `timestamptz` và toán tử `INTERVAL`.
- File `AGENTS.md` được định dạng chuẩn markdown với quy trình task rõ ràng.

## Vướng mắc và việc tiếp theo

- Chưa chạy `docker compose up -d` để deploy migration mới này vào container PostgreSQL (có thể chạy khi khởi động môi trường local).
- Tiếp tục theo dõi các điểm nghiệp vụ chưa chốt: rating feedback, khung giờ mở cửa chi tiết theo Venue/Court, và cơ chế xử lý khi xóa tài khoản Owner.
