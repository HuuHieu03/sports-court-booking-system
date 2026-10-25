# Ứng dụng đặt và quản lý sân bóng đá

Bản dự thảo cho MVP.

## Ứng dụng làm gì

Ứng dụng giúp người dùng tìm và đặt sân bóng đá. Chủ sân quản lý các cụm sân, theo dõi booking và bổ nhiệm người quản lý cho từng địa điểm.

Venue là một cụm sân hoặc địa điểm kinh doanh. Court là từng sân thuộc Venue. Một Venue có nhiều Court, mỗi Court thuộc một Venue.

## Người dùng và quyền hạn

| Vai trò | Quyền chính                                                                                                                                                                                |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User     | Tìm sân, đặt và hủy booking của mình, gửi feedback, ứng tuyển Manager.                                                                                                            |
| Owner    | Sở hữu nhiều Venue; tạo, cập nhật và xóa Venue của mình; có toàn bộ quyền Manager tại các Venue đó. Đăng tuyển, xem ứng viên, bổ nhiệm và thu hồi quyền Manager. |
| Manager | Quản lý các Venue được Owner bổ nhiệm. Cập nhật Venue; thêm, sửa, xóa Court; xem booking, hồ sơ người đặt và hủy booking của khách kèm lý do. Vẫn giữ các chức năng của User. |
| Admin    | Xem thông tin tài khoản, khóa, mở khóa và xóa tài khoản. Quyền Admin không tự cấp quyền quản lý Venue.                                                                      |

Người đăng ký chọn User hoặc Owner. Manager được bổ nhiệm từ tài khoản User, không tự chọn khi đăng ký. Người chưa đăng nhập được tìm Venue/Court, xem thông tin sân, kiểm tra sân trống và đọc feedback.

## Các use case chính

| Chức năng                    | Người thực hiện | Cách sử dụng và kết quả                                                                                                                                                  |
| ------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Đăng ký, đăng nhập       | Các vai trò       | Người đăng ký chọn User hoặc Owner, cung cấp tên, email, số điện thoại và mật khẩu. Các tài khoản đăng nhập để sử dụng chức năng theo quyền.      |
| Tìm sân                      | Mọi người        | Tìm Venue theo tên hoặc địa chỉ, xem các Court và kiểm tra khung giờ muốn đặt. Kiểm tra sân trống chưa giữ chỗ.                                             |
| Đặt sân                     | User                | Chọn Court và giờ bắt đầu, kết thúc. Hệ thống kiểm tra lại sân trống rồi xác nhận booking ngay. Nếu giờ đã bị đặt, báo không còn chỗ.              |
| Hủy booking                   | User                | Mở booking của mình và hủy khi còn ít nhất 30 phút trước giờ bắt đầu. Booking chuyển sang đã hủy và khung giờ được giải phóng.                       |
| Hủy booking của khách | Owner, Manager | Chọn booking trong Venue mình quản lý và nhập lý do hủy. Hệ thống hủy booking, giải phóng khung giờ và gửi thông báo kèm lý do cho người đặt. |
| Quản lý sân                 | Owner, Manager      | Owner tạo Venue. Owner hoặc Manager của Venue thêm và cập nhật Court, sửa thông tin Venue. Quyền xóa áp dụng theo bảng phân quyền.                             |
| Tuyển Manager                 | Owner, User         | Owner mở tuyển trên trang Venue. User đọc thông báo chia sẻ profile rồi đồng ý ứng tuyển. Owner xem liên hệ và trao đổi với ứng viên ngoài ứng dụng. |
| Bổ nhiệm Manager             | Owner               | Sau khi thỏa thuận, Owner chọn hồ sơ ứng tuyển và xác nhận bổ nhiệm. User được quyền quản lý Venue và toàn bộ Court trong Venue đó.                     |
| Thu hồi quyền Manager        | Owner               | Owner gỡ bổ nhiệm tại Venue của mình. Quyền quản lý hết hiệu lực ngay; tài khoản User và booking cá nhân vẫn giữ nguyên.                                   |
| Xem booking và hồ sơ khách | Owner, Manager      | Xem booking của các Court trong Venue mình quản lý. Từ booking, xem profile người đặt.                                                                              |
| Gửi feedback                  | User                | Gửi góp ý bằng văn bản cho Venue. Nội dung được hiển thị trên trang Venue.                                                                                        |
| Quản trị tài khoản         | Admin               | Tìm và xem tài khoản, khóa hoặc mở khóa khi cần. Tài khoản bị khóa không được đăng nhập hoặc tiếp tục dùng chức năng cần xác thực.                |

## Quy tắc nghiệp vụ

- Tất cả mọi người đã đăng ký trong hệ thống đều là User bao gồm cả Owner và Manager.
- Email và số điện thoại không trùng giữa các tài khoản, kể cả tài khoản đã xóa.
- Booking được xác nhận tự động, không cần Owner hoặc Manager duyệt.
- Giờ bắt đầu phải ở tương lai, giờ kết thúc phải sau giờ bắt đầu, thời lượng mỗi lượt đặt từ 30 phút đến 4 giờ. Một Court không có hai booking chưa hủy trùng giờ. Hai booking có thể liền nhau.
- Thời hạn hủy được tính theo giờ hệ thống. Khi dùng quyền User, mỗi người chỉ hủy booking của mình. Owner và Manager được hủy booking của khách trong Venue mình quản lý, bắt buộc nhập lý do và gửi thông báo cho người đặt.
- Một Manager có thể quản lý nhiều Venue. Mỗi Venue có tối đa một Manager tại một thời điểm. Owner chỉ bổ nhiệm hoặc thu hồi Manager trong Venue thuộc sở hữu của mình.
- User không được xem hồ sơ User khác. Owner và Manager được xem hồ sơ khách đã đặt sân trong Venue mình quản lý.
- Chỉ Owner của Venue được xem và liên hệ ứng viên đã đồng ý chia sẻ và hồ sơ Manager đã bổ nhiệm tại Venue đó. Manager không được xem danh sách ứng viên.
- Việc gửi ID của Venue, Court, booking hoặc tài khoản không tự cấp quyền truy cập. Mọi thao tác phải được kiểm tra theo người gọi và phạm vi dữ liệu.
- Khi hai người đặt cùng Court và khung giờ đồng thời, chỉ một booking được xác nhận. Người còn lại nhận thông báo sân đã được đặt; không được tạo hai booking trùng nhau.
- Xóa Venue/Court là xóa logic để giữ lịch sử. Không xóa khi còn booking đang diễn ra hoặc sắp tới chưa bị hủy. Xóa Venue đồng thời xóa các Court, đóng tuyển và thu hồi bổ nhiệm Manager tại Venue đó.
- Admin xóa tài khoản bằng cách chuyển sang trạng thái đã xóa, chặn đăng nhập và sử dụng phiên hiện tại. Giữ lịch sử booking và không tự hủy booking. Admin không tự xóa tài khoản đang sử dụng.

## Các điểm cần lưu ý

- Race condition: kiểm tra sân trống và tạo booking phải bảo đảm không đặt trùng khi có nhiều request đồng thời. Cần xử lý cả trường hợp đặt sân cùng lúc với hủy booking hoặc xóa Court/Venue.
- Profile và ứng tuyển: kiểm tra quyền theo Venue và quan hệ booking hoặc hồ sơ ứng tuyển. Chỉ chia sẻ liên hệ sau khi User đồng ý. Owner chỉ phê duyệt hồ sơ của Venue mình sở hữu; bổ nhiệm và thu hồi phải cập nhật quyền ngay.
- Số Manager: hiện mỗi Venue có tối đa một Manager, một Manager có thể quản lý nhiều Venue. Cần xác định cách thay thế Manager và xử lý khi hai hồ sơ được phê duyệt đồng thời.
- Feedback và rating: hiện có feedback bằng văn bản. Cần chốt điều kiện đã hoàn tất booking, số lần đánh giá, quyền sửa/xóa, thang điểm và cách tính rating của Venue.
- Hủy booking của khách: cần chốt thời hạn Owner/Manager được hủy, kênh gửi thông báo và cách gửi lại nếu thất bại. Thông báo phải có booking liên quan và lý do hủy, tránh gửi trùng khi request được thử lại.
- Giờ mở cửa và cách chia khung giờ. Độ dài mỗi lượt đặt đã được cố định từ 30 phút đến 4 giờ qua CHECK constraint.
- Khi Admin xóa tài khoản, cần chốt cách xử lý Venue thuộc sở hữu, quyền Manager và dữ liệu cá nhân. Cơ chế xóa logic và giữ lịch sử đã được thống nhất.

Chi tiết endpoint, dữ liệu gửi lên và kết quả trả về nằm trong [Swagger](https://huuhieu03.github.io/sports-court-booking-system/) và [đặc tả OpenAPI](../api/openapi.yaml).

Tech stack, cấu trúc mã nguồn và baseline có lỗi chủ đích được mô tả trong [tài liệu kiến trúc](../architecture/ARCHITECTURE.md).
