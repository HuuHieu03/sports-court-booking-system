# Football Booking MVP (Pitchly)

Dự án phát triển hệ thống đặt và quản lý sân bóng đá phong trào, phục vụ cho đồ án môn **Kiến trúc Phần mềm**. 

Hệ thống được xây dựng theo mô hình **Modular Monolith** kết hợp **Clean Architecture** (Layered Architecture). Phiên bản hiện tại là **Baseline**, trong đó có chủ đích cài cắm 5 điểm yếu kiến trúc kinh điển để thực hiện đo lường hiệu năng (benchmark) trước khi chuyển sang giai đoạn tối ưu và tái cấu trúc.

---

## 1. Bài toán và Phạm vi nghiệp vụ

Hệ thống giải quyết bài toán vận hành chuỗi sân bóng và nhu cầu tìm/đặt sân của người chơi, gồm 4 nhóm người dùng chính:

* **Khách hàng (User):** Tìm kiếm cụm sân theo khu vực/địa chỉ, xem sân con và bảng giá theo giờ; kiểm tra khung giờ trống; đặt sân (hệ thống tự động xác nhận `CONFIRMED` và tính tiền); tự hủy lịch đặt trước giờ đá tối thiểu 30 phút; gửi đánh giá (feedback); nộp hồ sơ ứng tuyển làm Quản lý sân.
* **Chủ cụm sân (Owner):** Tạo và quản lý các cụm sân (`Venue`) mình sở hữu; quản lý danh sách sân con (`Court`) và đơn giá theo giờ; mở đợt tuyển dụng, duyệt hồ sơ và bổ nhiệm/thu hồi quyền Quản lý.
* **Quản lý sân (Manager):** Được Owner bổ nhiệm vận hành tại một cụm sân cụ thể. Có quyền quản lý danh sách sân con, xem toàn bộ lịch đặt sân của khách, tra cứu thông tin liên hệ của người đặt và hủy lịch đặt của khách trong trường hợp bất khả kháng (bắt buộc nhập lý do).
* **Quản trị viên (Admin):** Quản trị danh mục tài khoản trên toàn hệ thống (tra cứu, khóa/mở khóa tài khoản người dùng vi phạm).

> **Lưu ý về Phân quyền động (Dynamic RBAC):** Manager không phải là một vai trò (role) cố định trong mã token JWT. Quyền quản lý sân được xác định động tại thời điểm gửi request thông qua bảng bổ nhiệm trong cơ sở dữ liệu (`manager_appointments`). Một tài khoản User có thể là quản lý của sân này nhưng chỉ là khách thông thường tại sân khác.

---

## 2. Kiến trúc Hệ thống & Công nghệ sử dụng

### 2.1. Phân tầng và Tổ chức mã nguồn
Backend tổ chức theo dạng **Modular Monolith** chia thành 7 module độc lập (`auth`, `users`, `venues`, `bookings`, `staffing`, `feedback`, `notifications`). Giao tiếp liên module bắt buộc phải thông qua Public Service, nghiêm cấm việc module này gọi trực tiếp Repository của module khác.

Bên trong mỗi module áp dụng **4 tầng Clean Architecture**:
1. **Presentation Layer:** Controller nhận HTTP request, validate dữ liệu đầu vào thông qua DTO (Class-Validator) và trả về response.
2. **Application Layer:** Điều phối luồng nghiệp vụ (Use Cases), kiểm tra quyền thao tác trên dữ liệu.
3. **Domain Layer:** Chứa Domain Entities, Business Rules và Repository Interfaces. Đây là code TypeScript thuần túy (POJO), không phụ thuộc vào framework bên ngoài hay Prisma.
4. **Infrastructure Layer:** Hiện thực các Repository Interface từ tầng Domain bằng Prisma ORM. Sử dụng Dependency Inversion (DIP) thông qua Symbol token để inject vào Service.

### 2.2. Công nghệ sử dụng (Tech Stack)
* **Backend:** NestJS 10, TypeScript, Prisma ORM 7, bcryptjs, Passport JWT.
* **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, React Router 6.
* **Database:** PostgreSQL 17 (chế độ UTC, kiểu dữ liệu thời gian `timestamptz`, hỗ trợ xóa logic `deleted_at`, Partial Indexes và CHECK constraints).
* **DevOps & Triển khai:** Docker & Docker Compose đa tầng (multi-stage build), NGINX Alpine làm Reverse Proxy mặt tiền phục vụ SPA và điều hướng API `/api/v1/`.

---

## 3. Các Lỗi Kiến Trúc Cố Ý Cài Cắm (Baseline Defect Hooks)

Để phục vụ việc đo lường, kiểm thử tải (benchmark) và đối sánh kiến trúc trong đồ án, phiên bản Baseline giữ nguyên 5 lỗi chủ đích sau:

### HOOK-01: Đặt trùng sân do Race Condition (Concurrency Defect)
* **Vị trí:** `src/modules/bookings/application/bookings.service.ts` (phương thức `createBooking`).
* **Bản chất:** Luồng đặt sân kiểm tra lịch trống rồi mới tạo bản ghi (mô hình *Check-Then-Act*) nhưng không có bất kỳ cơ chế khóa nào (không dùng `SELECT ... FOR UPDATE`, không có khóa phân tán, bảng `bookings` cố tình không đặt PostgreSQL exclusion constraint). Hệ thống còn có thêm độ trễ nhân tạo 50ms giữa bước Check và Act để phơi bày lỗi khi có nhiều request đồng thời.
* **Hậu quả:** Khi 2 hoặc nhiều khách hàng cùng bấm đặt một khung giờ trong cùng một tích tắc, hệ thống sẽ xác nhận thành công cho tất cả các bên, dẫn tới việc nhiều người bị xếp trùng một sân.
* **Hướng cải tiến:** Áp dụng Pessimistic Locking (Khóa bi quan) ở tầng database hoặc sử dụng PostgreSQL GiST Exclusion Constraint trên trường dải thời gian (`tsrange`).

### HOOK-02: Tải dữ liệu tuần tự N+1 (N+1 Query Problem)
* **Vị trí:** `src/modules/venues/application/venues.service.ts` (phương thức `findAll`).
* **Bản chất:** Sau khi truy vấn lấy danh sách cụm sân (`Venue`), hệ thống sử dụng vòng lặp để truy vấn tuần tự danh sách sân con (`Court`) của từng cụm sân thay vì gom nhóm truy vấn.
* **Hậu quả:** Khi số lượng cụm sân tăng lên $N$, số lượng truy vấn xuống database sẽ là $1 + N$, gây tăng đột biến độ trễ API và nghẽn tài nguyên I/O của database.
* **Hướng cải tiến:** Sử dụng Eager Loading kết hợp `JOIN` trong một câu truy vấn duy nhất, hoặc gom nhóm ID để truy vấn theo lô (`WHERE venue_id IN (...)`).

### HOOK-03: Khóa luồng đồng bộ với Outbox (Synchronous Blocking Coupling)
* **Vị trí:** `src/modules/notifications/application/notifications.service.ts` (phương thức `dispatchSync`).
* **Bản chất:** Khi Quản lý hủy lịch đặt của khách hoặc khi Chủ sân bổ nhiệm quản lý, hệ thống chèn trực tiếp logic gửi thông báo đồng bộ vào luồng xử lý HTTP request kèm một độ trễ giả lập 800ms (mô phỏng việc gọi sang bên thứ ba như SMS Gateway / Zalo ZNS).
* **Hậu quả:** Thời gian phản hồi của request HTTP bị kéo dài lên gần 1 giây. Nếu cổng gửi thông báo bị treo hoặc phản hồi chậm, luồng chính của ứng dụng sẽ bị nghẽn toàn bộ, gây sụt giảm throughput nghiêm trọng.
* **Hướng cải tiến:** Triển khai đúng chuẩn mô hình Outbox Pattern bất đồng bộ: Request HTTP chỉ lưu thông báo vào database rồi phản hồi ngay; một tiến trình ngầm riêng biệt (Message Queue / Worker / Cron) sẽ đảm nhận việc đọc và gửi thông báo độc lập.

### HOOK-04: Thắt cổ chai CSDL ở Guard phân quyền (Uncached Dynamic RBAC)
* **Vị trí:** `src/common/guards/dynamic-manager.guard.ts`.
* **Bản chất:** Mỗi một HTTP request có yêu cầu quyền quản lý sân đều phải thực hiện truy vấn trực tiếp xuống bảng `manager_appointments` trong cơ sở dữ liệu để kiểm tra trạng thái hiệu lực mà không sử dụng bộ nhớ đệm (cache).
* **Hậu quả:** Khi lượng truy cập của các nhà quản lý tăng cao (thao tác kiểm tra lịch, xem hồ sơ khách), cơ sở dữ liệu phải xử lý hàng loạt truy vấn lặp đi lặp lại giống hệt nhau, làm quá tải kết nối CSDL.
* **Hướng cải tiến:** Áp dụng bộ nhớ đệm (Redis Cache hoặc In-memory Cache) lưu danh sách cụm sân mà quản lý được phân quyền với TTL hợp lý, đồng thời xóa cache (Cache Invalidation) ngay khi có sự kiện bổ nhiệm hoặc thu hồi quyền.

### HOOK-05: Thiếu giới hạn tần suất truy cập (Missing Rate Limiting)
* **Vị trí:** `src/modules/auth/presentation/auth.controller.ts`, `src/modules/feedback/presentation/feedback.controller.ts`.
* **Bản chất:** Các API công khai (đăng nhập, đăng ký, gửi phản hồi) không được trang bị cơ chế giới hạn số lần gọi (Rate Limiting).
* **Hậu quả:** Hệ thống có nguy cơ bị tấn công vét cạn mật khẩu (Brute-force Attack), tạo tài khoản rác hàng loạt hoặc spam dữ liệu đánh giá làm tràn bộ nhớ CSDL.
* **Hướng cải tiến:** Tích hợp middleware hoặc Guard giới hạn tần suất (`@nestjs/throttler`), áp dụng hạn ngạch số request tối đa từ một địa chỉ IP trong một khoảng thời gian (ví dụ tối đa 5 lần đăng nhập sai/phút).

---

## 4. Đặc tả API (OpenAPI & Swagger)

Đặc tả toàn bộ API của dự án tuân theo chuẩn **OpenAPI 3.0.3**, được lưu ngay tại thư mục gốc của repository để tiện xem trước và tích hợp:

* **File YAML gốc:** [`openapi.yaml`](openapi.yaml) (Có thể mở xem trực tiếp trên GitHub hoặc import vào Postman / Insomnia).
* **File JSON:** [`openapi.json`](openapi.json).
* **Xem Swagger UI trực tuyến:** [https://huuhieu03.github.io/sports-court-booking-system/](https://huuhieu03.github.io/sports-court-booking-system/)
* **Xem Swagger UI trên server đang chạy:** Truy cập trực tiếp endpoint `/api/docs` (ví dụ: `http://localhost/api/docs` hoặc `http://pitchly.duckdns.org/api/docs`).

---

## 5. Hướng dẫn Khởi chạy Hệ thống

### 5.1. Chạy nhanh bằng Docker Compose (Khuyên dùng)
Yêu cầu máy tính đã cài đặt **Docker** và **Docker Compose**.

1. Chuẩn bị file biến môi trường:
   ```bash
   cp .env.example .env
   ```
2. Khởi chạy toàn bộ hệ thống (Database, Migration, Seed, Backend, Frontend):
   ```bash
   docker compose up -d --build
   ```
3. Sau khi lệnh hoàn tất:
   * **Giao diện Web:** Mở trình duyệt truy cập `http://localhost` (hoặc cổng cấu hình trong `.env`).
   * **Tài liệu API Swagger:** Truy cập `http://localhost/api/docs`.
   * **Backend API:** Điều hướng tại `http://localhost/api/v1/`.

### 5.2. Danh sách Tài khoản Mẫu để Thử nghiệm (Seed Data)
Mật khẩu mặc định cho toàn bộ tài khoản mẫu là: **`Secret123@`**

| Vai trò | Email đăng nhập | Mô tả & Quyền hạn |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | Quản trị viên hệ thống (quản lý, khóa/mở khóa tài khoản). |
| **Owner** | `owner.anphu@example.com` | Chủ sở hữu Sân An Phú và Sân Thảo Điền. |
| **Owner** | `owner.thuduc@example.com` | Chủ sở hữu Sân Thủ Đức. |
| **Manager** | `manager.minh@example.com` | Quản lý đương nhiệm tại Sân An Phú. |
| **User** | `user.lan@example.com` | Khách đặt sân; đã nộp hồ sơ ứng tuyển làm quản lý Sân An Phú. |
| **User** | `user.huy@example.com` | Khách đặt sân; cựu quản lý Sân Thảo Điền (đã bị thu hồi quyền). |
