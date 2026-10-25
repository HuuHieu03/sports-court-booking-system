# Football Booking MVP

Prototype đặt và quản lý sân bóng đá. User tìm và đặt sân; Owner quản lý các Venue thuộc sở hữu; Manager quản lý các Venue được bổ nhiệm; Admin quản trị tài khoản.

[Tài liệu dự án](documentation/README.md) hướng dẫn đọc và cập nhật tài liệu chung.

- [PRD và use case](documentation/product/PRD.md): phạm vi MVP, phân quyền và quy tắc nghiệp vụ.
- [Kiến trúc](documentation/architecture/ARCHITECTURE.md): tech stack, phân lớp và baseline có lỗi chủ đích.
- [Thiết kế database](documentation/architecture/DATABASE.md): ERD, ràng buộc, migration và dữ liệu mẫu.
- [Worklog của team](documentation/worklogs/README.md): cách ghi công việc, kết quả kiểm tra và vướng mắc.

## Chạy database local

Cần Docker. Đặt file `.env` nhóm gửi riêng vào thư mục gốc (hoặc copy `.env.example` thành `.env` rồi điền giá trị), sau đó:

```bash
docker compose up -d
```

Lệnh trên chạy PostgreSQL ở cổng 5432, tự áp dụng migration và nạp dữ liệu mẫu.

Tài khoản mẫu, quy ước sửa schema và cách dùng Prisma trong backend nằm trong [thiết kế database](documentation/architecture/DATABASE.md#triển-khai).

## Xem API

**[Mở Swagger](https://huuhieu03.github.io/sports-court-booking-system/)**

Swagger mở trực tiếp trên trình duyệt, không cần cài đặt hay chạy dự án. Đây là bản thiết kế API đang được rà soát; backend chưa được triển khai nên chưa thể gửi request thử.

- [Đặc tả OpenAPI](documentation/api/openapi.yaml): endpoint, quyền truy cập, request, response và mã lỗi.
- [Trang Swagger UI](documentation/api/swagger.html): giao diện đọc đặc tả.

Các điểm nghiệp vụ chưa chốt được ghi trong PRD. Khi sửa API, cập nhật `documentation/api/openapi.yaml`. GitHub Actions tự xuất bản lại trang sau khi thay đổi Swagger được push lên `main`; cũng có thể chạy thủ công workflow **Publish Swagger** trong tab **Actions**.

Để xem khi đang chỉnh sửa trong VS Code, dùng extension OpenAPI (Swagger) Editor và mở lệnh `OpenAPI: show preview using Swagger UI`.
