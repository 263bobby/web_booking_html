
## 🔗 Luồng dữ liệu kết nối 4 phần

```
[Leader] courts.json → fetch() → initSearch() → user chọn sân
            ↓ redirect: booking.html?id=c4
[B] initHome() (khám phá) | initBooking() (đặt sân) → saveBooking()
            ↓ chuyển sang profile.html
[C] initProfile() → hiển thị đơn → form xác nhận → saveToHistory()
            ↓ lưu vào localStorage
[D] History system → đọc localStorage → renderHistoryCard → filter/xem chi tiết
```

---

---

# 👑 LEADER — Kiến trúc & Tầng lõi & Trang Tìm Sân (~40%)

> **Vai trò trình bày:** Mở đầu toàn bộ buổi, giới thiệu dự án, giải thích nền tảng kỹ thuật, sau đó demo trang tìm sân. Là người duy nhất hiểu "tại sao mọi thứ hoạt động".

### Phụ trách file:

| File | Vai trò |
|---|---|
| `sporthub/index.html` | Điểm vào duy nhất — redirect sang home |
| `sporthub/scripts/router.js` | Nhận diện trang hiện tại |
| `sporthub/scripts/store.js` | Quản lý trạng thái toàn app (localStorage) |
| `sporthub/data/courts.json` | 25 sân × đầy đủ thuộc tính |
| `sporthub/data/config.json` | Cấu hình ứng dụng |
| `sporthub/scripts/main.js` — `bootstrap()`, `loadData()`, `setupNavbar()`, `setupFooter()`, `bindRevealAnimations()` | Hàm khởi động app + utilities dùng chung |
| `sporthub/scripts/main.js` — `initSearch()` (dòng ~907–1026) | Toàn bộ logic trang tìm sân |
| `sporthub/pages/search.html` | Giao diện trang tìm sân |
| `sporthub/components/CourtCard.js` | Component card sân dùng chung |
| `sporthub/styles/main.css` | Toàn bộ hệ thống CSS |

---

### Nội dung trình bày:

#### 1. Kiến trúc tổng thể — "Tại sao không dùng React?"
- Dự án là **SPA thuần Vanilla JS** — không framework, không build tool
- Điều hướng bằng **file URL** (`home.html`, `search.html`...) thay vì hash routing
- Toàn bộ UI render bằng **DOM manipulation thủ công** (`innerHTML`, `classList`, `addEventListener`)
- Không có backend — dữ liệu từ **JSON tĩnh**, state từ **localStorage**
- `index.html` chỉ là redirect wrapper:
```html
<meta http-equiv="refresh" content="0; url=./pages/home.html">
```

#### 2. Router (`router.js` — 9 dòng)
```javascript
// Mỗi page HTML có data-page trên <body>
// <body data-page="search">
export function getCurrentPage() {
    return document.body.dataset.page || "home";
}
// Trả về: "home" | "search" | "booking" | "profile"
```
→ `bootstrap()` dùng kết quả này để quyết định hàm nào chạy

#### 3. Hàm khởi động `bootstrap()` — "Nhạc trưởng"
```javascript
async function bootstrap() {
    const page = getCurrentPage();            // "search"
    setupNavbar(page);                        // inject Navbar.js vào #app-nav
    setupFooter();                            // inject Footer.js vào #app-footer
    const { config, courts } = await loadData(); // fetch song song 2 file JSON
    if (page === "home")    initHome(config, courts);
    if (page === "booking") initBooking(config, courts);
    if (page === "profile") initProfile();
    if (page === "search")  initSearch(config, courts);
    bindRevealAnimations(); // IntersectionObserver cho hiệu ứng cuộn
}
```

#### 4. Tầng dữ liệu (`data/courts.json`)
- **25 sân** với đầy đủ: `id`, `name`, `district`, `sports[]`, `rating`, `priceFrom`, `amenities[]`, `image`
- Fetch bất đồng bộ cùng lúc bằng `Promise.all`:
```javascript
const [configRes, courtsRes] = await Promise.all([
    fetch("../data/config.json"),
    fetch("../data/courts.json")
]);
```
- Kết quả `courts[]` được truyền thẳng vào các hàm `initXxx()` — không có cache, không có store trung gian

#### 5. State Management (`store.js`)
```javascript
// 3 kho lưu trong localStorage:
"sporthub_booking"       → 1 đơn đặt đang xử lý (tạm thời, xóa sau khi vào profile)
"sporthub_history"       → mảng lịch sử đặt sân
"sporthub_booked_slots"  → slot đã đặt, key = "courtId_date_subcourtId"

// Pattern module — trang nào cần thì import:
import { getBooking, saveBooking } from "./store.js";
```
→ Đây là "database giả" của toàn app

#### 6. Trang Tìm Sân (`search.html` + `initSearch()`)

**Bộ lọc 4 chiều đồng thời:**
```javascript
function filterCourts() {
    const keyword        = searchInput.value.toLowerCase();
    const district       = districtFilter.value;
    const selectedSports = Array.from(sportFilters)
                               .filter(cb => cb.checked).map(cb => cb.value);
    const selectedPrice  = document.querySelector('input[name="price"]:checked').value;

    const filtered = courts.filter(court => {
        if (keyword && !court.name.toLowerCase().includes(keyword)) return false;
        if (district && court.district !== district) return false;
        if (selectedSports.length > 0 &&
            !court.sports.some(s => selectedSports.includes(s))) return false;
        // lọc giá...
        return true;
    });
    render(filtered);
}
```

**Luồng URL param → filter tự động (bug đã fix):**
```
home.html bấm "Tennis" → search.html?sport=Tennis
    ↓ URL params được đọc TRƯỚC setTimeout
    ↓ tick checkbox Tennis
    ↓ setTimeout 1s (hiệu ứng skeleton loading)
    ↓ filterCourts() → đọc checkbox đã tick → render đúng sân Tennis
```
- ❌ **Bug cũ:** `setTimeout` gọi `render(courts)` → ghi đè filter, hiện tất cả sân
- ✅ **Fix:** `setTimeout` gọi `filterCourts()` → tôn trọng filter đang active

**Bản đồ Leaflet.js:**
- Thư viện map mã nguồn mở, không cần API key
- Mỗi sân được đánh marker trên bản đồ, click → popup thông tin + link "Đặt ngay"

#### 7. `CourtCard.js` — Component dùng chung
```javascript
// Render 1 sân thành HTML card — dùng ở cả home lẫn search
renderCourtCard(court) → "<article class='court-card'>...</article>"
```

#### 8. CSS Design System (`styles/main.css`)
```css
:root {
    --color-primary: ...;   /* màu xanh lá chủ đạo */
    --color-muted: ...;     /* màu chữ phụ */
    --radius: ...;          /* bo góc chuẩn */
}
/* Hiệu ứng cuộn dùng IntersectionObserver: */
.reveal-up { opacity: 0; transform: translateY(30px); transition: all 0.5s; }
.reveal-up.is-visible { opacity: 1; transform: translateY(0); }

/* Loading skeleton animation: */
.skeleton { background: linear-gradient(90deg, #f0f0f0, #e0e0e0, #f0f0f0);
            background-size: 200%; animation: shimmer 1.5s infinite; }
```

---

---

# 👤 THÀNH VIÊN B — Trang Chủ & Trang Đặt Sân (~30%)

> **Vai trò:** Trình bày 2 trang có UI phong phú nhất — "bộ mặt" của app.

### Phụ trách file:

| File | Vai trò |
|---|---|
| `sporthub/pages/home.html` | Giao diện trang chủ |
| `sporthub/scripts/home.js` + `main.js initHome()` (dòng 63–159) | Logic trang chủ |
| `sporthub/pages/booking.html` | Giao diện trang đặt sân |
| `sporthub/scripts/main.js` — `initBooking()` (dòng 161–567) | Logic đặt sân (~400 dòng) |
| `sporthub/components/Toast.js` | Thông báo nhanh |

---

### Nội dung trình bày:

#### 1. Trang Chủ (`home.html` + `initHome()`)

**Hero Section + Typing Effect:**
```javascript
// Hiệu ứng gõ chữ trên placeholder input — dùng setTimeout đệ quy
function typeEffect() {
    if (isDeleting) { searchInput.placeholder = currentText.substring(0, --charIndex); }
    else            { searchInput.placeholder = currentText.substring(0, ++charIndex); }
    setTimeout(typeEffect, isDeleting ? 30 : 80);
}
```

**3 Tab sân nổi bật:**
- `Sân nổi bật` → lọc `c.featured === true` từ courts[]
- `Đánh giá cao` → sort theo `rating` giảm dần, lấy top 3
- `Giá tốt hôm nay` → sort theo `priceFrom` tăng dần, lấy top 3

**Quick tags điều hướng:**
```html
<a href="./search.html?sport=Tennis" class="tag">🎾 Tennis</a>
<!-- Leader nhận ?sport=Tennis và tự động lọc -->
```

#### 2. Trang Đặt Sân (`booking.html` + `initBooking()`)

**Nhận sân từ URL:**
```javascript
const courtId = new URLSearchParams(window.location.search).get('id');
const court   = courts.find(c => c.id === courtId) || courts[0];
```

**Gallery ảnh thông minh theo môn:**
```javascript
const sportGalleries = {
    "Tennis":   [tenisImg1, tenisImg2, tenisImg3],
    "Bóng đá":  [soccerImg1, soccerImg2, soccerImg3],
    // ...6 môn
};
// Auto-slide 3s, dừng khi hover chuột
```

**Hệ thống chọn slot giờ ⭐ (phần quan trọng nhất):**
```javascript
// Tạo 17 khung giờ: 06:00 → 22:00
const slotTimeline = Array.from({ length: 17 }, (_, i) => `${i+6}:00`);

// 3 trạng thái — render lại mỗi khi user tương tác:
busySlots.has(slot)     → is-busy   (đỏ, disabled)
selectedSlots.has(slot) → is-selected (xanh, đang chọn)
(không có)              → (trắng, có thể chọn)

// Slot bận = mock random + data thật từ localStorage
function getBusySlots() {
    const seed = activeDate * activeSubCourt * court.id.charCodeAt(0);
    // tạo 3-5 slot bận ngẫu nhiên có hạt giống (deterministic)
    // + merge với localStorage (slot user đã đặt trước đó)
}
```

**Cập nhật tổng tiền realtime:**
```javascript
const totalPrice = selectedSlots.size × currentPrice;
document.getElementById("summaryTotal").textContent = formatVnd(totalPrice);
```

**3 Tab nội dung:**
```
[Đặt lịch]  → blockDate + blockSubCourt + blockTime + bottomBar (hiện)
[Thông tin] → blockInfo (hiện)
[Đánh giá]  → blockReviews (hiện)
```

**Luồng đặt sân hoàn chỉnh:**
```
Chọn ngày → Chọn sân nhỏ → Click slot giờ → Bấm "Tiếp theo"
    → saveBookedSlots() + saveBooking() → chuyển sang profile.html
```

---

---

# 👤 THÀNH VIÊN C — Xác Nhận Đặt Sân & Modal (~15%)

> **Vai trò:** Trình bày bước cuối của luồng đặt sân — form xác nhận thông tin và popup thành công.

### Phụ trách file:

| File                          | Vai trò |

| `sporthub/pages/profile.html` | Giao diện hồ sơ / xác nhận |
| `sporthub/scripts/main.js` — `initProfile()` phần form + active booking (dòng 569–905) | Form xác nhận + hiển thị đơn đang xử lý |
| `sporthub/components/Modal.js` | Component popup |

---

### Nội dung trình bày:

#### 1. Hiển thị đơn đang đặt
```javascript
const booking = getBooking(); // đọc từ localStorage (do B vừa saveBooking())
if (booking) {
    // hiển thị: tên sân, slot giờ, ngày, giá/giờ
    activeContainer.classList.remove("hidden");
    saveBooking(null); // xóa ngay sau khi hiển thị — tránh duplicate nếu refresh
}
```

#### 2. Form xác nhận — Validation thủ công bằng JS
```javascript
// Không dùng HTML5 required — tự kiểm tra từng trường:
if (!fullName || fullName.length < 2) {
    err.textContent = "Vui lòng nhập họ tên hợp lệ."; return;
}
if (!/^0\d{9}$/.test(phone)) {
    err.textContent = "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)."; return;
}
if (email && !email.endsWith("@gmail.com")) {
    err.textContent = "Email phải kết thúc bằng @gmail.com."; return;
}
```

#### 3. Sau khi submit thành công
```javascript
saveToHistory({
    id: "b" + Date.now(), courtName, sport, time, date,
    totalAmount: price * totalHours,
    status: "confirmed"
});
// Hiển thị modal với Lottie animation
```

#### 4. `Modal.js` — Pattern tái sử dụng
```javascript
// Nhận 3 phần HTML, ghép thành modal hoàn chỉnh:
renderModal(title, bodyHtml, footerHtml) → HTML string

// Điều khiển hiển thị:
showModal()  → thêm class "is-open"
hideModal()  → xóa class "is-open"

// Dùng ở 2 chỗ:
// → Modal thành công sau đặt sân       (Thành viên C)
// → Modal xem chi tiết lịch sử đặt    (Thành viên D)
```

---

---

# 👤 THÀNH VIÊN D — Lịch Sử & Shared Components (~15%)

> **Vai trò:** Trình bày hệ thống quản lý lịch sử và toàn bộ shared UI components.

### Phụ trách file:

| File | Vai trò |
|---|---|
| `sporthub/scripts/main.js` — `initProfile()` phần history + filter | Logic lọc & render lịch sử |
| `sporthub/components/History.js` | Render toàn bộ lịch sử (7.3 KB) |
| `sporthub/components/Navbar.js` | Thanh điều hướng |
| `sporthub/components/Footer.js` | Chân trang |
| `sporthub/components/SportFilter.js` | Filter môn thể thao |

---

### Nội dung trình bày:

#### 1. Hệ thống lịch sử đặt sân
```javascript
// Kết hợp 2 nguồn dữ liệu:
const realHistory = getHistory();    // từ localStorage (đơn user đã đặt thật)
const mockHistory = [...];           // 4 đơn mẫu cố định (để demo)
const fullHistory  = [...realHistory, ...mockHistory];
```

**Lọc 4 chiều đồng thời:**
```javascript
function filterHistory() {
    const keyword = document.getElementById("historySearchInput")?.value.toLowerCase();
    const sport   = document.getElementById("historySportFilter")?.value;
    const status  = document.getElementById("historyStatusFilter")?.value;

    const filtered = fullHistory.filter(item => {
        if (keyword && !item.courtName.toLowerCase().includes(keyword)) return false;
        if (sport  && item.sport  !== sport)  return false;
        if (status && item.status !== status) return false;
        return true;
    });
    renderHistory(filtered);
}
```

#### 2. `History.js` — Component lớn nhất (7.3 KB)
```javascript
renderHistoryStats(stats)          // 3 số: Tổng / Hoàn thành / Đã hủy
renderHistoryFilters()             // 4 ô input lọc (search, sport, status, time)
createBookingHistoryCard(item)     // card với badge màu theo status:
    // completed  → 🟢 xanh lá
    // confirmed  → 🔵 xanh dương
    // pending    → 🟡 vàng
    // cancelled  → 🔴 đỏ
renderEmptyState()                 // màn hình trống khi không có kết quả
```

#### 3. Xem chi tiết đơn — Kỹ thuật Event Delegation
```javascript
// Không gắn listener riêng cho từng card (tốn bộ nhớ)
// Thay vào đó dùng 1 listener trên document:
document.addEventListener("click", (e) => {
    const btn = e.target.closest(".js-view-detail");
    if (!btn) return;
    const booking = fullHistory.find(b => b.id === btn.dataset.id);
    // → renderModal() + showModal() (dùng chung Modal.js với Thành viên C)
});
```

#### 4. Shared Components — Pattern "Render Function"
```javascript
// Tất cả components theo cùng 1 pattern: function → trả về HTML string
renderNavbar(activePage) → "<nav>...</nav>"
renderFooter()           → "<footer>...</footer>"

// main.js inject vào các slot HTML rỗng:
document.getElementById("app-nav").innerHTML    = renderNavbar(page);
document.getElementById("app-footer").innerHTML = renderFooter();

// Ưu điểm:
// ✅ Không cần lifecycle, không cần framework
// ✅ Navbar/Footer đồng nhất trên mọi trang mà không reload
```

---

---

## 💡 Gợi ý cho buổi trình bày

| Thứ tự | Người | Nội dung | Thời gian đề xuất |
|---|---|---|---|
| 1 | **Leader** | Giới thiệu dự án + kiến trúc + data + trang tìm sân | ~12–15 phút |
| 2 | **B** | Trang chủ + Trang đặt sân | ~8–10 phút |
| 3 | **C** | Form xác nhận + Modal | ~4–5 phút |
| 4 | **D** | Lịch sử + Components | ~4–5 phút |
| — | **Q&A** | — | ~5 phút |

> **Tip:** Leader nên demo luồng hoàn chỉnh 1 lần đầu (Home → Search → Booking → Profile → History) rồi mới từng người đi sâu vào phần mình phụ trách.
