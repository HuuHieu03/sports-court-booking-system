# Football Booking MVP

Prototype đặt và quản lý sân bóng đá. User tìm và đặt sân; Owner quản lý các Venue thuộc sở hữu; Manager quản lý một Venue được bổ nhiệm; Admin quản trị tài khoản.

## Xem API

**[Mở Swagger](https://huuhieu03.github.io/sports-court-booking-system/)**

Swagger mở trực tiếp trên trình duyệt, không cần cài đặt hay chạy dự án. Đây là bản thiết kế API đang được rà soát; backend chưa được triển khai nên chưa thể gửi request thử.

- [Đặc tả OpenAPI](documentation/openapi.yaml): endpoint, quyền truy cập, request, response và mã lỗi.
- [Trang Swagger UI](documentation/swagger.html): giao diện đọc đặc tả.

Các điểm nghiệp vụ chưa chốt được ghi ở đầu Swagger. Khi sửa API, cập nhật `documentation/openapi.yaml`. GitHub Actions tự xuất bản lại trang sau khi thay đổi Swagger được push lên `main`; cũng có thể chạy thủ công workflow **Publish Swagger** trong tab **Actions**.

Để xem khi đang chỉnh sửa trong VS Code, dùng extension OpenAPI (Swagger) Editor và mở lệnh `OpenAPI: show preview using Swagger UI`.
