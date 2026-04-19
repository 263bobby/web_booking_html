
---

# 👥 Team Structure

## 🔹 Tuan anh

**Role: Architect + Reviewer + Integrator**

Trách nhiệm:



> kiểm soát logic + đảm bảo mọi thứ chạy đúng

---

## 🔹 NGA 

**Phụ trách: UI tĩnh (HTML + CSS)**

Task:

* `pages/home.html`
* `pages/profile.html`
* CSS trong `styles/main.css`

Yêu cầu:

* KHÔNG viết JS phức tạp
* Chỉ dựng layout theo design
* Class name rõ ràng

---

## 🔹 Thịnh 

**Phụ trách: Component đơn giản**

Task:

* `components/Toast.js`
* `components/Modal.js`
* CSS trong `components.css`

Yêu cầu:

* Logic đơn giản (show/hide)
* Không đụng vào store hoặc router

---

## 🔹 Quyền

**Phụ trách: Logic chính**

Task:

* `scripts/router.js`
* `scripts/store.js`
* `scripts/home.js`

Yêu cầu:

* Xử lý navigation
* Xử lý state (booking, favorite)
* Kết nối data với UI

---

# 🧠 Các bước làm

## 🥇 Bước 1: Setup (Leader)

* Tạo structure project
* Tạo file rỗng
* Define convention

---

## 🥈 Bước 2: UI First (Member A + B)

* Build toàn bộ HTML + CSS
* Chưa cần logic
* Mock data nếu cần

---

## 🥉 Bước 3: Logic (Member C)

* Implement:

  * router
  * store
  * page logic
* Kết nối với UI

---

## 🥇 Bước 4: Integration (Leader)

* Merge toàn bộ code
* Fix lỗi conflict
* Đảm bảo flow chạy đúng

---

## 🥈 Bước 5: Polish

* Fix bug UI
* Optimize code
* Clean structure

---

# 🔁 Data Flow

```
User Action
   ↓
Component (CourtCard, Navbar)
   ↓
Store (update state)
   ↓
UI re-render (manual JS)
```

---

# 📦 Coding Rules (BẮT BUỘC)

## 1. Không được:


## 2. Bắt buộc:

* ✅ Mỗi component = 1 file
* ✅ JS dùng module (import/export)
* ✅ Code dễ đọc, có comment

---

# 🧩 File Responsibility

| File         | Người phụ trách |
| ------------ | --------------- |
| index.html   | Tuấn Anh         
| Navbar.js    | Tuấn Anh         
| CourtCard.js | Tuấn Anh         
| home.html    | Nga        
| profile.html | Nga        
| Modal.js     | Thịnh        
| Toast.js     | Thịnh      
| router.js    | Quyền         
| store.js     | Quyền       
| home.js      | Quyền        

---

# 🔥 Workflow làm việc hàng ngày

1. Mỗi người làm task riêng
2. Push code lên branch riêng
3. Leader review
4. Merge vào main

---



---

# 🎯 Kết luận

* Project chia rõ:

  * UI
  * Logic
  * Control

* Leader kiểm soát toàn bộ

* Member làm phần độc lập

👉 Mục tiêu:

> Code sạch – dễ debug – dễ mở rộng
1. Nhóm Giao diện tĩnh (HTML)
Đây là bộ khung xương của website, nơi hiển thị những gì người dùng nhìn thấy đầu tiên. Phần này do Nga phụ trách chính.

index.html: File gốc, là "cửa chính" của toàn bộ website. Nó chứa thẻ <head> để nhúng CSS chung, và một thẻ <body> có vùng trống (ví dụ <div id="app"></div>) để các file Javascript bơm nội dung vào.

Thư mục pages/: Chứa các "màn hình" của website.

pages/home.html: Giao diện trang chủ (Hero banner, giới thiệu).

pages/profile.html: Giao diện trang thông tin cá nhân.

pages/booking.html: Giao diện trang đặt lịch, ma trận chọn giờ.

2. Nhóm Giao diện động (Components JS)
Thay vì viết đi viết lại một đoạn HTML nhiều lần, chúng ta tách chúng thành các Component độc lập. Phần này chia đều cho bạn (Tuấn Anh) và Thịnh.

components/Navbar.js: Chứa code tạo ra thanh menu điều hướng trên cùng.

components/CourtCard.js: Chứa code tạo ra hình ảnh một "thẻ sân bóng" (gồm ảnh, tên sân, giá tiền). Nếu có 10 sân, file này sẽ được gọi 10 lần.

components/SportFilter.js: Khối chứa các nút bấm tìm kiếm, chọn môn thể thao bên cột trái.

components/Modal.js: Cửa sổ bật lên (popup) để xác nhận thông tin đặt sân.

components/Toast.js: Các thông báo nhỏ bay ra ở góc màn hình (ví dụ: "Đặt lịch thành công", "Vui lòng chọn giờ").

3. Nhóm Logic cốt lõi (Scripts)
Đây là "bộ não" của dự án, nơi xử lý dữ liệu và luồng chạy. Phần này do Quyền và bạn phối hợp.

scripts/main.js: File chạy đầu tiên khi web load lên. Nó đóng vai trò như nhạc trưởng, khởi tạo các cài đặt chung.

scripts/router.js: Người điều hướng (Bộ định tuyến). Nó kiểm tra xem người dùng đang muốn xem trang nào (home hay booking) để lấy file HTML tương ứng trong thư mục pages/ đắp lên màn hình.

scripts/store.js: Thủ kho. File này chuyên lưu trữ trạng thái của web (ví dụ: đang chọn môn thể thao nào, giỏ hàng đang có những giờ đặt nào).

scripts/home.js: Chứa logic dành riêng cho trang chủ (ví dụ: hiệu ứng trượt, tính toán số liệu đặc thù).

4. Nhóm Tài nguyên & Dữ liệu (Styles & Data)
data/courts.json: Trái tim dữ liệu. Chứa toàn bộ thông tin về các sân bóng, giá tiền, địa chỉ (thay cho Database thực).

data/config.json: Các cấu hình chung của web (ví dụ: danh sách các môn thể thao, thông tin liên hệ chân trang).

styles/variables.css: Nơi khai báo các mã màu chính, font chữ chung (nếu cần đè lên Tailwind).

styles/main.css: Code CSS dùng chung cho toàn dự án.

styles/components.css: Code CSS dành riêng cho các thành phần nhỏ (như hiệu ứng nhấp nháy cho nút Toast).

Cách chúng tương tác với nhau (Luồng hoạt động)
Để hiểu rõ cách hệ thống chạy, hãy hình dung hành trình khi người dùng vừa gõ địa chỉ web và bấm Enter:

Bước Khởi động: Trình duyệt tải file index.html. File này lập tức gọi styles/main.css để lấy màu sắc cơ bản và gọi scripts/main.js để đánh thức hệ thống.

Định hướng Trang: main.js gọi router.js. Thấy người dùng đang ở trang chủ, router.js lấy nội dung từ pages/home.html và hiển thị ra giữa màn hình.

Lấy Dữ liệu: Đồng thời, scripts/store.js sẽ làm nhiệm vụ kết nối (fetch) đến file data/courts.json để lấy danh sách toàn bộ các sân bóng về lưu vào bộ nhớ tạm.

Bơm Dữ liệu vào Giao diện: File logic scripts/home.js lấy dữ liệu từ "Thủ kho" store.js. Nó chạy một vòng lặp, ứng với mỗi sân bóng, nó gọi components/CourtCard.js một lần để vẽ ra các thẻ sân bóng tuyệt đẹp trên màn hình.

Tương tác Người dùng: Khi người dùng click vào nút "Đặt ngay" trên một Thẻ sân, lệnh sẽ được bắn tới scripts/store.js để lưu thông tin. Lập tức, components/Toast.js được gọi để bay ra một thông báo xanh lá cây "Đã chọn sân thành công!".


website/
├── index.html          # 🚪 Cửa chính
├── pages/              # 📄 Các màn hình
│   ├── home.html
│   ├── profile.html
│   └── booking.html
├── components/         # 🧩 Các khối giao diện tái sử dụng
│   ├── Navbar.js
│   ├── CourtCard.js
│   ├── SportFilter.js
│   ├── Modal.js
│   └── Toast.js
├── scripts/            # 🧠 Bộ não logic
│   ├── main.js        # 🎼 Nhạc trưởng
│   ├── router.js      # 🗺️ Điều hướng
│   ├── store.js       # 🏪 Thủ kho dữ liệu
│   └── home.js        # 🔧 Logic trang chủ
└── data/              # 📦 Tài nguyên
    ├── courts.json    # ❤️ Dữ liệu sân bóng
    └── config.json




   