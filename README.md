# Đồ Án Cơ Sở Ngành – Thiết kế front-end cho Website bán khóa học (EduCourses)

- **Sinh viên thực hiện:** Hồ Thế Lộc
- **MSSV:** 110124109
- **Lớp:** DA24TTC
- **Điện thoại / Zalo:** 0372765126
- **Email:** holoc2021.tv@gmail.com
- **Giảng viên hướng dẫn:** ThS. Phạm Minh Đương
- **Đơn vị:** Khoa Công nghệ Thông tin, Trường Kỹ thuật và Công nghệ, Đại học Trà Vinh

---

## 1. Giới thiệu đề tài
Đề tài tập trung thiết kế và cài đặt giao diện front-end cho website bán khóa học trực tuyến **EduCourses**. Hệ thống mô phỏng đầy đủ các luồng thao tác phía trình duyệt cho cả người học và quản trị viên:
- Duyệt danh mục **55 khóa học** thuộc 6 chuyên ngành (Frontend, JavaScript, Database, Công cụ, Phân tích hệ thống, Kỹ năng mềm) và 3 trình độ (Cơ bản, Trung cấp, Nâng cao).
- Tìm kiếm theo từ khóa, lọc đa tiêu chí theo chuyên ngành, trình độ, mức học phí và sắp xếp kết quả.
- Xem chi tiết khóa học, xem video học thử bài 1 miễn phí, đánh giá từ 1 đến 5 sao và lưu vào danh sách yêu thích.
- Quản lý giỏ hàng, áp mã giảm giá, thanh toán giả lập qua mã QR, quản lý hồ sơ cá nhân, theo dõi khóa học đã kích hoạt và tra cứu lịch sử đơn hàng.
- Gửi biểu mẫu liên hệ hỗ trợ và quản trị khóa học, tài khoản người dùng trên trang Admin Dashboard.

## 2. Đường dẫn truy cập
- **Website trực tuyến (GitHub Pages):** [https://holoc2021tv.github.io/csn-da24ttc-hotheloc-webbankhoahoc-frontend/](https://holoc2021tv.github.io/csn-da24ttc-hotheloc-webbankhoahoc-frontend/)
- **Kho mã nguồn (GitHub Repository):** [https://github.com/holoc2021tv/csn-da24ttc-hotheloc-webbankhoahoc-frontend](https://github.com/holoc2021tv/csn-da24ttc-hotheloc-webbankhoahoc-frontend)

## 3. Công nghệ sử dụng
- **Cấu trúc và định dạng:** HTML5 ngữ nghĩa, CSS3 (biến `:root`, Flexbox, CSS Grid, Media Queries).
- **Thư viện giao diện:** Bootstrap 5.3.3 và Bootstrap Icons 1.11.3 (nhúng qua CDN).
- **Xử lý logic phía trình duyệt:** Vanilla JavaScript (15 tệp tách theo từng trang và chức năng).
- **Lưu trữ dữ liệu phía trình duyệt:** Web Storage API (`LocalStorage` và `SessionStorage`).
- **Công cụ phát triển và triển khai:** Visual Studio Code, Git, GitHub, GitHub Pages.

## 4. Phạm vi và giới hạn kỹ thuật
- Dự án chỉ triển khai tầng giao diện và xử lý nghiệp vụ giả lập phía trình duyệt (client-side).
- Hệ thống không xây dựng máy chủ backend, không kết nối cơ sở dữ liệu phía máy chủ và không tích hợp cổng thanh toán trực tuyến thực tế.
- Các tên công nghệ như ReactJS, Vue.js, TypeScript, Node.js, MySQL hay MongoDB xuất hiện trong `src/js/data.js` chỉ là dữ liệu tên khóa học mẫu phục vụ hiển thị, không phải công nghệ xây dựng website.

## 5. Cấu trúc cây thư mục Repository
```text
csn-da24ttc-hotheloc-webbankhoahoc-frontend/
├── index.html                          # Tệp chuyển hướng GitHub Pages sang src/index.html
├── README.md                           # Tài liệu giới thiệu, hướng dẫn chạy và thông tin liên lạc
├── progress-report/                    # [Bắt buộc] Báo cáo tiến độ thực hiện hằng tuần
│   └── BAO CAO TIEN DO 2026.doc
├── thesis/                             # [Bắt buộc] Tài liệu văn bản của Đồ án
│   ├── abs/                            # Slide trình chiếu, tài liệu tóm tắt
│   ├── doc/                            # Tài liệu văn bản định dạng .DOC/.DOCX
│   ├── html/                           # Tài liệu dạng web
│   ├── pdf/                            # Tài liệu văn bản định dạng .PDF
│   └── refs/                           # Tài liệu tham khảo của đồ án
├── src/                                # Mã nguồn chính của website EduCourses
│   ├── assets/
│   │   └── images/                     # 05 tệp SVG (logo, logo-light, 3 banner liveshow)
│   ├── css/
│   │   └── style.css                   # Biến CSS (:root), bố cục Grid/Flexbox và Responsive
│   ├── js/
│   │   ├── about.js                    # Thống kê số liệu tương tác thực tế trên trang Giới thiệu
│   │   ├── admin.js                    # Quản trị khóa học, tài khoản người dùng và đơn hàng
│   │   ├── auth.js                     # Duy trì phiên đăng nhập và cập nhật thanh điều hướng
│   │   ├── cart.js                     # Hiển thị, tính tổng tiền và xóa khóa học khỏi giỏ hàng
│   │   ├── checkout.js                 # Kiểm duyệt biểu mẫu, thanh toán giả lập và lưu đơn hàng
│   │   ├── contact.js                  # Xử lý biểu mẫu liên hệ và hỗ trợ người dùng
│   │   ├── course-detail.js            # Đọc mã khóa học từ URL, hiển thị chi tiết và học thử
│   │   ├── courses.js                  # Tìm kiếm, lọc đa tiêu chí, sắp xếp và phân trang
│   │   ├── data.js                     # Dữ liệu gốc 55 khóa học và hàm ghi nhận tương tác
│   │   ├── home.js                     # Hiển thị danh mục và khóa học nổi bật trên Trang chủ
│   │   ├── login.js                    # Xác thực đăng nhập và phân luồng người dùng
│   │   ├── my-courses.js               # Hiển thị khóa học đã kích hoạt, tiến độ và lịch sử đơn
│   │   ├── profile.js                  # Cập nhật hồ sơ cá nhân, đổi mật khẩu và yêu thích
│   │   ├── register.js                 # Đăng ký tài khoản mới và kiểm duyệt dữ liệu đầu vào
│   │   └── storage.js                  # Tầng tiện ích đọc/ghi LocalStorage và SessionStorage
│   ├── about.html                      # Trang Giới thiệu nền tảng
│   ├── admin.html                      # Trang Quản trị hệ thống (Admin Dashboard)
│   ├── cart.html                       # Trang Giỏ hàng
│   ├── checkout.html                   # Trang Thanh toán giả lập
│   ├── contact.html                    # Trang Liên hệ và Hỗ trợ
│   ├── course-detail.html              # Trang Chi tiết khóa học
│   ├── courses.html                    # Trang Danh sách khóa học
│   ├── index.html                      # Trang chủ
│   ├── login.html                      # Trang Đăng nhập
│   ├── my-courses.html                 # Trang Khóa học của tôi và Lịch sử đơn hàng
│   ├── profile.html                    # Trang Hồ sơ cá nhân
│   └── register.html                   # Trang Đăng ký tài khoản
├── setup/                              # Tập tin hướng dẫn cài đặt và dữ liệu thử nghiệm
├── soft/                               # Phần mềm liên quan (nếu có)
└── docker/                             # Tập tin triển khai Docker (nếu có)
```

## 6. Hướng dẫn chạy dự án cục bộ
1. Tải mã nguồn về máy tính:
   ```bash
   git clone https://github.com/holoc2021tv/csn-da24ttc-hotheloc-webbankhoahoc-frontend.git
   ```
2. Mở thư mục dự án bằng **Visual Studio Code**.
3. Cài đặt tiện ích mở rộng **Live Server**, nhấp chuột phải vào `src/index.html` và chọn **Open with Live Server**, hoặc mở trực tiếp tệp `src/index.html` bằng trình duyệt.
4. Để làm mới toàn bộ dữ liệu mẫu về trạng thái mặc định 55 khóa học, mở **DevTools (F12) -> Application -> Local Storage**, xóa các khóa bắt đầu bằng `EDU_` rồi tải lại trang.