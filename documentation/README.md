# Tài liệu dự án

Đây là nơi lưu tài liệu chung của team. Nội dung được chia theo mục đích để dễ tìm và cập nhật.

## Cấu trúc tài liệu

```text
documentation/
  README.md
  product/
    PRD.md
  architecture/
    ARCHITECTURE.md
    DATABASE.md
  api/
    openapi.yaml
    swagger.html
  worklogs/
    README.md
```

| Nội dung | Đọc ở đâu |
| --- | --- |
| Ứng dụng làm gì, ai được làm gì, use case và quy tắc nghiệp vụ | [PRD](product/PRD.md) |
| Tech stack, module, phân lớp, dữ liệu và lỗi baseline có chủ đích | [Kiến trúc](architecture/ARCHITECTURE.md) |
| Bảng, cột, ràng buộc, index và ERD của database | [Thiết kế database](architecture/DATABASE.md) |
| Endpoint, quyền truy cập, request, response và mã lỗi | [OpenAPI](api/openapi.yaml) hoặc [Swagger trực tuyến](https://huuhieu03.github.io/sports-court-booking-system/) |
| Công việc đã làm, kết quả kiểm tra và vướng mắc của team | [Worklog](worklogs/README.md) |

Thành viên mới nên đọc PRD, tiếp đến kiến trúc, rồi xem các API liên quan tới phần mình làm. Worklog giúp theo dõi công việc đang diễn ra.

## Cấu trúc khung dự án

| Thư mục | Mục đích |
| --- | --- |
| `src/modules/` | Backend theo nhóm nghiệp vụ: auth, users, venues, bookings, staffing, feedback, notifications. |
| `src/common/` | Guard, decorator, filter, interceptor và pipe dùng chung. |
| `src/config/` | Cấu hình backend. |
| `prisma/` | Prisma schema, migration và dữ liệu mẫu. Xem [thiết kế database](architecture/DATABASE.md#triển-khai). |
| `frontend/src/modules/` | Các nhóm giao diện tương ứng nghiệp vụ backend. Mỗi nhóm có pages, components và api. |
| `frontend/src/app/` | Khởi tạo giao diện và cấu hình điều hướng. |
| `frontend/src/components/`, `frontend/src/hooks/`, `frontend/src/lib/`, `frontend/src/types/` | Thành phần giao diện, hook, tiện ích và kiểu dữ liệu dùng chung. |
| `frontend/src/assets/`, `frontend/src/styles/`, `frontend/public/` | Tài nguyên và định dạng giao diện. |
| `test/` | Các khu vực unit, integration và e2e. |
| `benchmarks/` | Kịch bản đo và kết quả so sánh baseline với bản cải tiến. |

Mỗi module backend có `presentation/dto`, `application`, `domain` và `infrastructure`, tương ứng Controller/DTO, Service, mô hình nghiệp vụ/interface Repository và Repository triển khai. Chi tiết trách nhiệm nằm trong tài liệu kiến trúc.

Hiện mới có phần database: `package.json`, `prisma.config.ts`, `prisma/`, `docker/`, `docker-compose.yml` và `.env.example`. Backend và frontend chưa có mã nguồn. Git không lưu thư mục rỗng; các thư mục còn lại chỉ xuất hiện trong repo sau khi có file thực tế. Không thêm file giữ chỗ.

## Khi cập nhật tài liệu

- Sửa chức năng, phân quyền hoặc quy tắc nghiệp vụ trong PRD.
- Sửa module, luồng xử lý, dữ liệu hoặc lỗi chủ đích trong tài liệu kiến trúc.
- Sửa endpoint và payload trong `api/openapi.yaml`. `swagger.html` chỉ là giao diện đọc file này.
- Ghi tiến độ và kết quả kiểm tra vào worklog. Quyết định làm thay đổi sản phẩm hoặc kiến trúc cần cập nhật cả tài liệu tương ứng.
- Ghi rõ phần nào đã làm, phần nào đang đề xuất hoặc cần chốt. Không mô tả khung hoặc thiết kế như chức năng đã chạy được.

Tài liệu dùng câu ngắn và ví dụ cụ thể. Cập nhật nội dung tại đúng nơi, tránh chép cùng một mô tả vào nhiều file.

## Xem và xuất bản Swagger

Mở [Swagger trực tuyến](https://huuhieu03.github.io/sports-court-booking-system/) để xem ngay. Trong VS Code, mở `api/openapi.yaml` và dùng preview OpenAPI nếu đã cài extension hỗ trợ.

Khi cần xem trang HTML ở local, chạy từ thư mục gốc:

```powershell
python -m http.server 8080 --bind 127.0.0.1 --directory documentation/api
```

Sau đó mở http://127.0.0.1:8080/swagger.html. Workflow Publish Swagger tự xuất bản khi file API hoặc workflow thay đổi được push lên `main`. Chỉ trang Swagger và đặc tả API được xuất bản lên Pages.

## Tài liệu riêng tư

`worklogs/` là nhật ký chung, được lưu trong Git. `my_workspace/` là nơi làm việc cá nhân, được Git bỏ qua. Không tự đưa ghi chú riêng tư, thông tin đăng nhập hoặc dữ liệu khách hàng vào tài liệu chung.
