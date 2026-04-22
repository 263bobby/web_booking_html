# 🏸 SportHub Hà Nội - Ứng Dụng Đặt Sân Thể Thao

Website đặt sân thể thao trực tuyến cho phép người dùng tìm kiếm, xem thông tin chi tiết và đặt sân Pickleball, Cầu lông, Tennis, Bóng đá tại Hà Nội một cách nhanh chóng và dễ dàng.

## 📋 Mục Lục

- [Giới thiệu](#giới-thiệu)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Hướng dẫn xây dựng](#hướng-dẫn-xây-dựng)
- [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
- [Tính năng chính](#tính-năng-chính)
- [API và Dữ liệu](#api-và-dữ-liệu)

---

## 🎯 Giới Thiệu

**SportHub Hà Nội** là một ứng dụng web hiện đại được xây dựng để cung cấp trải nghiệm người dùng tối ưu trong việc đặt sân thể thao. Ứng dụng cho phép:

- ✅ Tìm kiếm sân theo loại thể thao, quận/huyện
- ✅ Xem thông tin chi tiết về sân (giá, giờ mở cửa, tiện ích)
- ✅ Đặt sân với các khung giờ khác nhau
- ✅ Lưu lịch sử đặt sân
- ✅ Xem và quản lý hồ sơ cá nhân

---

## 🛠️ Công Nghệ Sử Dụng

| Công Nghệ | Mục Đích |
|-----------|---------|
| **HTML5** | Markup cấu trúc |
| **CSS3** | Styling và responsive design |
| **JavaScript (Vanilla)** | Logic ứng dụng, không dùng framework |
| **JSON** | Lưu trữ cấu hình và dữ liệu sân |
| **LocalStorage** | Lưu dữ liệu phiên làm việc trên client |

### Tại sao Vanilla JavaScript?
- ✅ Không cần build tools phức tạp
- ✅ Dễ hiểu, dễ bảo trì
- ✅ Hiệu suất cao
- ✅ Dễ triển khai (chỉ cần web server)

---

## 📁 Cấu Trúc Dự Án

```
sporthub/
├── index.html                 # Trang chủ (redirect)
├── components/               # Các component tái sử dụng
│   ├── CourtCard.js         # Component thẻ sân
│   ├── Footer.js            # Component footer
│   ├── History.js           # Component lịch sử đặt sân
│   ├── Modal.js             # Component modal/dialog
│   ├── Navbar.js            # Component menu điều hướng
│   ├── SportFilter.js       # Component lọc thể thao
│   └── Toast.js             # Component thông báo
├── pages/                    # Các trang HTML chính
│   ├── home.html            # Trang chủ
│   ├── search.html          # Trang tìm kiếm sân
│   ├── booking.html         # Trang đặt sân
│   └── profile.html         # Trang hồ sơ cá nhân
├── scripts/                  # Logic JavaScript
│   ├── main.js              # Logic chính của các trang
│   ├── router.js            # Điều hướng trang
│   └── store.js             # Quản lý dữ liệu (localStorage)
├── styles/                   # Tệp CSS
│   ├── main.css             # Style chính
│   ├── components.css       # Style các component
│   └── variables.css        # Biến CSS (màu sắc, kích thước)
└── data/                     # Dữ liệu JSON
    ├── config.json          # Cấu hình ứng dụng
    └── courts.json          # Danh sách sân thể thao
```

---

## 🚀 Hướng Dẫn Xây Dựng

### 1. Yêu Cầu Hệ Thống
- Máy tính với hệ điều hành: Windows, macOS hoặc Linux
- Trình duyệt web hiện đại (Chrome, Firefox, Safari, Edge)
- **Không cần cài đặt Node.js hay npm** (dự án không dùng build tools)

### 2. Clone/Tải Dự Án
```bash
# Nếu có Git
git clone <repository-url>
cd web_booking_html

# Hoặc tải file ZIP và giải nén
unzip web_booking_html.zip
cd web_booking_html
```

### 3. Chuẩn Bị Môi Trường
Dự án không cần cài đặt dependencies! Tất cả file đã có sẵn.

### 4. Khởi Chạy Web Server

**Option 1: Dùng Python (Nếu cài Python)**
```bash
# Python 3.x
python -m http.server 8000

# Python 2.x
python -m SimpleHTTPServer 8000
```

**Option 2: Dùng Node.js (Nếu cài Node.js)**
```bash
# Cài http-server nếu chưa có
npm install -g http-server

# Khởi chạy
http-server -p 8000
```

**Option 3: Dùng Live Server trong VS Code**
- Cài extension "Live Server" 
- Chuột phải vào file `index.html`
- Chọn "Open with Live Server"

**Option 4: Mở trực tiếp file HTML**
```bash
# Windows
start sporthub/index.html

# macOS
open sporthub/index.html

# Linux
xdg-open sporthub/index.html
```

### 5. Truy Cập Ứng Dụng
- Nếu dùng web server: Mở trình duyệt vào `http://localhost:8000`
- Nếu mở trực tiếp: File sẽ mở trong trình duyệt

---

## 📖 Hướng Dẫn Sử Dụng

### Trang Chủ (Home)
1. **Tìm Kiếm Nhanh**: 
   - Nhập tên sân hoặc loại thể thao trong thanh tìm kiếm
   - Nhấn "Tìm sân" hoặc Enter

2. **Lọc Theo Thể Thao**:
   - Nhấp vào các tag: 🥎 Pickleball, 🏸 Cầu lông, 🎾 Tennis, ⚽ Bóng đá

3. **Xem Danh Sách Nổi Bật**:
   - Sân nổi bật (Featured courts)
   - Sân xếp hạng cao nhất (Top rated)
   - Sân có giá tốt nhất (Cheapest)

### Trang Tìm Kiếm (Search)
1. **Lọc Sân**:
   - Chọn loại thể thao
   - Chọn quận/huyện
   - Chọn khoảng giá

2. **Xem Chi Tiết Sân**:
   - Nhấp vào thẻ sân để xem thông tin đầy đủ
   - Xem giá, giờ mở cửa, tiện ích

### Trang Đặt Sân (Booking)
1. **Chọn Ngày**:
   - Chọn ngày đặt sân (từ hôm nay trở đi)

2. **Chọn Khung Giờ**:
   - Chọn giờ bắt đầu và kết thúc
   - Xem giá tương ứng

3. **Nhập Thông Tin**:
   - Nhập tên của bạn
   - Nhập số điện thoại

4. **Xác Nhận**:
   - Nhấp "Đặt Sân"
   - Đơn đặt sẽ được lưu vào lịch sử

### Trang Hồ Sơ (Profile)
1. **Xem Lịch Sử Đặt Sân**:
   - Danh sách tất cả các đơn đặt sân
   - Hiển thị ngày, giờ, tên sân, giá tiền

2. **Thống Kê**:
   - Tổng số lần đặt sân
   - Tổng số tiền đã chi tiêu

3. **Lọc Lịch Sử**:
   - Tìm kiếm theo tên sân
   - Lọc theo loại thể thao

---

## ✨ Tính Năng Chính

### 🔍 Tìm Kiếm Thông Minh
- Tìm kiếm theo tên sân, loại thể thao, địa chỉ
- Gợi ý tìm kiếm nhanh
- Lọc nâng cao (giá, quận, thể thao)

### 🎫 Đặt Sân Dễ Dàng
- Giao diện trực quan
- Lựa chọn khung giờ linh hoạt
- Thanh toán an toàn

### 📱 Responsive Design
- Hoạt động tốt trên mọi thiết bị (mobile, tablet, desktop)
- Giao diện tối ưu cho người dùng

### 💾 Lưu Trữ Dữ Liệu
- Lưu lịch sử đặt sân tự động
- Dữ liệu được lưu trên thiết bị (không cần tài khoản)
- Bảo mật thông tin người dùng

### 🎨 Giao Diện Đẹp
- Thiết kế hiện đại, chuyên nghiệp
- Animations mượt mà
- Tối ưu cho trải nghiệm người dùng

### 📊 Thống Kê & Lịch Sử
- Xem lịch sử tất cả các đơn đặt sân
- Thống kê chi tiêu
- Xem chi tiết từng lần đặt

---

## 📡 API và Dữ Liệu

### config.json
Chứa cấu hình chung của ứng dụng:
```json
{
  "brand": "SportHub Ha Noi",
  "city": "Ha Noi",
  "sports": ["Bong da", "Cau long", "Tennis", ...],
  "districts": ["Ba Dinh", "Cau Giay", ...],
  "timeSlots": ["05:00", "07:00", "09:00", ...]
}
```

### courts.json
Danh sách tất cả các sân với thông tin:
```json
{
  "id": "c1",
  "name": "Tên sân",
  "district": "Quận/Huyện",
  "address": "Địa chỉ",
  "sports": ["Thể thao"],
  "rating": 4.9,
  "reviews": 98,
  "openTime": "06:00",
  "closeTime": "21:30",
  "priceFrom": 100000,
  "featured": true,
  "amenities": ["Tiện ích"],
  "image": "URL ảnh"
}
```

### LocalStorage
Dữ liệu được lưu với key:
- `sporthub_booking`: Đơn đặt sân hiện tại
- `sporthub_history`: Lịch sử đặt sân

---

## 🔧 Quản Trị và Bảo Trì

### Cập Nhật Danh Sách Sân
1. Mở file `sporthub/data/courts.json`
2. Thêm/sửa/xóa sân theo định dạng JSON
3. Lưu file

### Cập Nhật Cấu Hình
1. Mở file `sporthub/data/config.json`
2. Cập nhật danh sách thể thao, quận, khung giờ
3. Lưu file

### Tùy Chỉnh Giao Diện
- Sửa màu sắc trong `sporthub/styles/variables.css`
- Sửa style trong `sporthub/styles/main.css`
- Sửa style component trong `sporthub/styles/components.css`

---

## 🐛 Troubleshooting

### Ứng dụng không tải
**Giải pháp:**
- Kiểm tra xem đã mở web server chưa
- Kiểm tra URL có đúng không
- Xoá cache trình duyệt (Ctrl+Shift+Delete)

### Dữ liệu không lưu
**Giải pháp:**
- Kiểm tra xem browser có bật localStorage không
- Kiểm tra dung lượng lưu trữ có đủ không
- Thử dùng trình duyệt khác

### CSS không load
**Giải pháp:**
- Kiểm tra đường dẫn file CSS có đúng không
- Reload trang (F5 hoặc Ctrl+F5)
- Kiểm tra console (F12) xem có lỗi nào không

---

## 📚 Cấu Trúc Code

### Modular JavaScript
Dự án sử dụng ES6 modules để tổ chức code:
```javascript
// Export từ component
export function renderCard(data) { ... }

// Import vào main script
import { renderCard } from "../components/Card.js";
```

### BEM CSS Naming
Sử dụng phương pháp BEM cho CSS:
```css
.block { }
.block__element { }
.block--modifier { }
```

---

## 📝 Lưu Ý Quan Trọng

1. **Lưu ý CORS**: Nếu muốn fetch dữ liệu từ API ngoài, cần chú ý vấn đề CORS
2. **Lưu trữ dữ liệu**: Hiện chỉ dùng localStorage, nên dữ liệu sẽ bị xoá nếu xoá cache browser
3. **Hiệu suất**: Với dữ liệu lớn, cần tối ưu hoá tìm kiếm

---

## 🚀 Hướng Phát Triển Tương Lai

- [ ] Thêm chức năng đăng nhập/tài khoản
- [ ] Kết nối với backend API
- [ ] Thanh toán trực tuyến
- [ ] Gửi email xác nhận đơn đặt
- [ ] Đánh giá và bình luận sân
- [ ] Đặt sân theo nhóm
- [ ] Ứng dụng mobile native

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra lại hướng dẫn trên
2. Xem console (F12) để tìm lỗi
3. Kiểm tra file `huongdan_phanviec.md` để biết thêm chi tiết

---

## 📄 License

Dự án này được tạo cho mục đích học tập và phát triển.

---

**Chúc bạn có trải nghiệm tuyệt vời với SportHub Hà Nội! 🎉**

*Cập nhật lần cuối: Tháng 4 năm 2026*
