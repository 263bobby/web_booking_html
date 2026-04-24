import { renderNavbar } from "../components/Navbar.js";
import { renderFooter } from "../components/Footer.js";
import { renderCourtCard } from "../components/CourtCard.js";
import { showToast } from "../components/Toast.js";
import { getCurrentPage, goToProfile } from "./router.js";
import { getBooking, saveBooking, saveToHistory, getHistory, saveBookedSlots, getBookedSlots } from "./store.js";
import { 
    renderHistoryStats, 
    renderHistoryFilters, 
    createBookingHistoryCard, 
    renderEmptyState 
} from "../components/History.js";
import { renderModal, showModal, hideModal } from "../components/Modal.js";

let selectedCourt = null;

function renderSkeletonCards(container, count = 6) {
    if (!container) return;
    const skeletonHtml = Array(count).fill(0).map(() => `
        <div class="court-card reveal-up">
            <div class="skeleton" style="height: 200px; border-radius: 12px 12px 0 0;"></div>
            <div class="p-4 space-y-3">
                <div class="skeleton" style="height: 24px; width: 70%;"></div>
                <div class="skeleton" style="height: 16px; width: 40%;"></div>
                <div class="flex justify-between items-center mt-4">
                    <div class="skeleton" style="height: 20px; width: 30%;"></div>
                    <div class="skeleton" style="height: 36px; width: 40%; border-radius: 20px;"></div>
                </div>
            </div>
        </div>
    `).join("");
    container.innerHTML = skeletonHtml;
}

let map = null;
let markersLayer = null;

async function loadData() {
    const [configRes, courtsRes] = await Promise.all([
        fetch("../data/config.json"),
        fetch("../data/courts.json")
    ]);
    return {
        config: await configRes.json(),
        courts: await courtsRes.json()
    };
}

function setupNavbar(page) {
    const host = document.getElementById("app-nav");
    host.innerHTML = renderNavbar(page);
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("navMenu");
    toggle?.addEventListener("click", () => menu.classList.toggle("is-open"));
}

function setupFooter() {
    const host = document.getElementById("app-footer");
    if (!host) return;
    host.innerHTML = renderFooter();
}

function initHome(config, courts) {
    const courtsContainer = document.getElementById("featuredCourts");

    function renderCourtsByTab(type) {
        let filtered = [];
        if (type === "featured") {
            filtered = courts.filter(c => c.featured).slice(0, 3);
            courtsContainer.innerHTML = filtered.map(renderCourtCard).join("");
        } else if (type === "top_rated") {
            filtered = [...courts].sort((a, b) => b.rating - a.rating).slice(0, 3);
            courtsContainer.innerHTML = filtered.map(c => {
                const cardHtml = renderCourtCard(c);
                return cardHtml.replace('<article class="court-card">', `<article class="court-card"><div class="distance-badge" style="background: #fbbf24; color: #fff;">⭐ ${c.rating} / 5.0</div>`);
            }).join("");
        } else if (type === "cheap") {
            filtered = [...courts].sort((a, b) => a.priceFrom - b.priceFrom).slice(0, 3);
            courtsContainer.innerHTML = filtered.map(renderCourtCard).join("");
        }
        bindRevealAnimations();
    }

    // Initial render
    renderCourtsByTab("featured");

    // Tab listeners
    const tabBtns = document.querySelectorAll(".home-tab-btn");
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("is-active"));
            btn.classList.add("is-active");
            renderCourtsByTab(btn.dataset.type);
        });
    });

    // Typing effect
    const searchInput = document.getElementById("heroSearchInput");
    if (searchInput) {
        const texts = [
            "Tìm sân Pickleball ở Cầu Giấy...",
            "Tìm sân Bóng đá tại Đống Đa...",
            "Tìm sân Tennis gần bạn...",
            "Tìm sân Cầu lông giá rẻ..."
        ];
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeEffect() {
            // Focus check to pause typing if user is typing
            if (document.activeElement === searchInput) {
                setTimeout(typeEffect, 1000);
                return;
            }

            const currentText = texts[textIndex];
            if (isDeleting) {
                searchInput.placeholder = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                searchInput.placeholder = currentText.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = isDeleting ? 30 : 80;

            if (!isDeleting && charIndex === currentText.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typeSpeed = 500;
            }

            setTimeout(typeEffect, typeSpeed);
        }
        setTimeout(typeEffect, 1000);
    }

    const searchBtn = document.getElementById("heroSearchBtn");
    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", () => {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `./search.html?q=${encodeURIComponent(query)}`;
            } else {
                window.location.href = `./search.html`;
            }
        });
        // Enter key support
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") searchBtn.click();
        });
    }

    bindRevealAnimations();
}

function initBooking(config, courts) {
    // 1. Get Court from URL
    const urlParams = new URLSearchParams(window.location.search);
    const courtId = urlParams.get('id');
    const foundCourt = courts.find(c => c.id === courtId);
    const court = foundCourt ? foundCourt : courts[0];

    // Gallery: 3 sport-specific photos per sport type
    const sportType = (court.sports && court.sports[0]) || "Tennis";
    const sportGalleries = {
        "Pickleball": [
            "https://images.unsplash.com/photo-1554068865-24cecd4e34f8?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=80"
        ],
        "Tennis": [
            "https://images.unsplash.com/photo-1545809027-1b44e55b5a38?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80"
        ],
        "Cầu lông": [
            "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1659203073213-57c6b26524b6?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80"
        ],
        "Bóng đá": [
            "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80"
        ],
        "Bóng rổ": [
            "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?auto=format&fit=crop&w=1200&q=80"
        ],
        "Bóng chuyền": [
            "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=1200&q=80"
        ]
    };
    // Default fallback gallery (indoor sport facility)
    const defaultGallery = [
        "https://images.unsplash.com/photo-1545809027-1b44e55b5a38?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80"
    ];
    const galleryBase = sportGalleries[sportType] || defaultGallery;
    // If the court has its own image, use it as the hero (slot 0), keep rest sport-specific
    const gallery = court.image
        ? [court.image, galleryBase[1], galleryBase[2]]
        : galleryBase;
    let imageIndex = 0;
    let activeDate = 0;
    let activeSubCourt = 0;
    const selectedSlots = new Set();

    // 2. Generate timeline from 06:00 to 22:00
    const slotTimeline = Array.from({ length: 17 }, (_, i) => `${String(i + 6).padStart(2, "0")}:00`);

    // Dates and subCourts used in getBusySlots
    const dates = ["21", "22", "23", "24", "25", "26", "27"];
    const subCourts = court.sports.includes("Pickleball")
        ? [
            { id: "A", label: "Pickleball 1", multiplier: 1 },
            { id: "B", label: "Pickleball 2", multiplier: 1.15 },
            { id: "C", label: "Pickleball VIP", multiplier: 1.3 }
        ]
        : [
            { id: "D", label: "Sân 1", multiplier: 1 },
            { id: "E", label: "Sân 2", multiplier: 1.1 }
        ];

    // Dynamic busy slots function
    function getBusySlots() {
        const seed = (activeDate + 1) * (activeSubCourt + 1) * court.id.charCodeAt(0);
        const busy = new Set();
        // Deterministically mock 3-5 busy slots
        const count = (seed % 3) + 3;
        for (let i = 0; i < count; i++) {
            const slotIndex = (seed * (i + 2)) % slotTimeline.length;
            busy.add(slotTimeline[slotIndex]);
        }
        
        // Add previously booked slots from localStorage
        const dateStr = `2026-04-${dates[activeDate]}`;
        const subcourtId = subCourts[activeSubCourt].id;
        const bookedSlots = getBookedSlots(court.id, dateStr, subcourtId);
        
        if (bookedSlots && typeof bookedSlots === 'object') {
            if (Array.isArray(bookedSlots)) {
                bookedSlots.forEach(slot => busy.add(slot));
            } else {
                Object.keys(bookedSlots).forEach(slot => busy.add(slot));
            }
        }
        
        return busy;
    }

    let busySlots = getBusySlots();

    const heroImage = document.getElementById("bookingHeroImage");
    const thumbs = document.getElementById("bookingThumbs");
    const dateList = document.getElementById("dateList");
    const subcourtList = document.getElementById("subcourtList");
    const timeGrid = document.getElementById("timeGrid");
    const detailMeta = document.getElementById("detailMeta");
    const reviewsTitle = document.getElementById("reviewsTitle");
    const reviewList = document.getElementById("reviewList");
    const starRating = document.getElementById("starRating");
    const submitReview = document.getElementById("submitReview");
    const reviewComment = document.getElementById("reviewComment");
    const REVIEW_KEY = "sporthub_user_reviews";
    let selectedRating = 0;

    const defaultReviews = [
        { author: "Nguyễn Văn A", rating: 5, comment: "Sân mới, đẹp, chủ sân nhiệt tình. Trải nghiệm rất tốt." },
        { author: "Trần Thị B", rating: 5, comment: "Mặt sân ổn, ánh sáng tốt. Mình sẽ quay lại thường xuyên." }
    ];

    function readStoredReviews() {
        try {
            const raw = localStorage.getItem(REVIEW_KEY);
            const parsed = raw ? JSON.parse(raw) : {};
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch {
            return {};
        }
    }

    function writeStoredReviews(allReviews) {
        localStorage.setItem(REVIEW_KEY, JSON.stringify(allReviews));
    }

    function getCourtReviews() {
        const all = readStoredReviews();
        return Array.isArray(all[court.id]) ? all[court.id] : [];
    }

    function renderStars(rating) {
        const full = "★".repeat(rating);
        const empty = "☆".repeat(5 - rating);
        return `${full}${empty}`;
    }

    function renderReviewList() {
        const userReviews = getCourtReviews();
        const merged = [...userReviews, ...defaultReviews];
        reviewList.innerHTML = merged
            .map(
                (item) => `
          <div class="review-item">
            <div class="review-item__head">
              <strong>${item.author}</strong>
              <span class="review-item__stars">${renderStars(item.rating)}</span>
            </div>
            <p class="review-item__text">${item.comment}</p>
          </div>
        `
            )
            .join("");
    }

    function updateStarInput() {
        const buttons = starRating?.querySelectorAll(".star-btn") || [];
        buttons.forEach((btn) => {
            const value = Number(btn.dataset.value);
            btn.classList.toggle("is-active", value <= selectedRating);
            btn.textContent = value <= selectedRating ? "★" : "☆";
        });
    }

    function getCurrentPrice() {
        const basePrice = court.priceFrom || court.pricePerHour || 0;
        return Math.round(basePrice * subCourts[activeSubCourt].multiplier);
    }

    function formatVnd(value) {
        return `${value.toLocaleString("vi-VN")}đ`;
    }

    function renderGallery() {
        heroImage.src = gallery[imageIndex];
        thumbs.innerHTML = gallery
            .map(
                (src, idx) =>
                    `<img src="${src}" class="booking-thumb ${idx === imageIndex ? "is-active" : ""}" data-index="${idx}" alt="thumbnail">`
            )
            .join("");

        const indicators = document.getElementById("heroIndicators");
        if (indicators) {
            indicators.innerHTML = gallery
                .map((_, idx) => `<div class="hero-indicator ${idx === imageIndex ? "is-active" : ""}"></div>`)
                .join("");
        }
    }

    function renderDates() {
        dateList.innerHTML = dates
            .map(
                (d, idx) =>
                    `<button class="date-chip ${idx === activeDate ? "is-active" : ""}" data-index="${idx}" type="button"><strong>${d}</strong><span>T4</span></button>`
            )
            .join("");
    }

    function renderSubCourts() {
        subcourtList.innerHTML = subCourts
            .map(
                (item, idx) => {
                    const price = court.priceFrom || court.pricePerHour || 80000;
                    return `<button class="subcourt-chip ${idx === activeSubCourt ? "is-active" : ""}" data-index="${idx}" type="button">
            <strong>${item.label}</strong>
            <span style="font-size: 0.8rem; opacity: 0.8">${formatVnd(price * item.multiplier)}/h</span>
          </button>`;
                }
            )
            .join("");
    }

    function renderSlots() {
        timeGrid.innerHTML = slotTimeline
            .map((slot, idx) => {
                const isBusy = busySlots.has(slot);
                const isSelected = selectedSlots.has(slot);
                const stateClass = isBusy ? "is-busy" : isSelected ? "is-selected" : "";
                const nextHour = `${String(Number(slot.slice(0, 2)) + 1).padStart(2, "0")}:00`;
                return `<button class="time-cell ${stateClass}" data-slot="${slot}" ${isBusy ? "disabled" : ""} type="button">
            <strong>${slot}</strong>
            <span style="font-size:0.75rem">${nextHour}</span>
          </button>`;
            })
            .join("");
    }

    function renderSummary() {
        const currentPrice = getCurrentPrice();
        const totalHours = selectedSlots.size;
        const totalPrice = totalHours * currentPrice;
        document.getElementById("summaryPrice").innerHTML = `${formatVnd(currentPrice)}<span class="text-sm">/giờ</span>`;
        document.getElementById("summaryDate").textContent = `T3, ${dates[activeDate]}/04/2026`;
        document.getElementById("summaryCourtName").textContent = subCourts[activeSubCourt].label;
        document.getElementById("summarySlots").textContent = `${totalHours} slot`;
        document.getElementById("summaryTotal").textContent = formatVnd(totalPrice);
        document.getElementById("bottomHours").textContent = `${totalHours}h`;
        document.getElementById("bottomTotal").textContent = formatVnd(totalPrice);
        document.getElementById("bottomConfirm").textContent = `${totalHours} khung giờ đã chọn`;

        const detailName = document.getElementById("detailCourtName");
        if (detailName) detailName.textContent = court.name;

        const breadcrumbName = document.getElementById("breadcrumbCourtName");
        if (breadcrumbName) breadcrumbName.textContent = court.name;

        if (detailMeta) {
            detailMeta.innerHTML = `
        <span class="meta-item">📍 ${court.address || court.district}</span>
        <span class="meta-item">🕒 ${court.openTime || "06:00"} - ${court.closeTime || "22:00"}</span>
        <span class="meta-item">⭐ ${court.rating || 0} (${court.reviews || 0} đánh giá)</span>
      `;
        }

        if (reviewsTitle) {
            reviewsTitle.textContent = `ĐÁNH GIÁ (${court.reviews || 0})`;
        }
    }

    function draw() {
        renderGallery();
        renderDates();
        renderSubCourts();
        renderSlots();
        renderSummary();
    }

    document.getElementById("heroPrev").addEventListener("click", () => {
        imageIndex = imageIndex === 0 ? gallery.length - 1 : imageIndex - 1;
        renderGallery();
    });
    document.getElementById("heroNext").addEventListener("click", () => {
        imageIndex = (imageIndex + 1) % gallery.length;
        renderGallery();
    });

    // Auto slide
    let slideInterval = setInterval(() => {
        imageIndex = (imageIndex + 1) % gallery.length;
        renderGallery();
    }, 3000);

    // Pause auto slide on hover
    const heroSection = document.querySelector(".booking-hero");
    if (heroSection) {
        heroSection.addEventListener("mouseenter", () => clearInterval(slideInterval));
        heroSection.addEventListener("mouseleave", () => {
            slideInterval = setInterval(() => {
                imageIndex = (imageIndex + 1) % gallery.length;
                renderGallery();
            }, 3000);
        });
    }

    thumbs.addEventListener("click", (e) => {
        const item = e.target.closest("img[data-index]");
        if (!item) return;
        imageIndex = Number(item.dataset.index);
        renderGallery();
    });

    dateList.addEventListener("click", (e) => {
        const item = e.target.closest(".date-chip");
        if (!item) return;
        activeDate = Number(item.dataset.index);
        selectedSlots.clear();
        busySlots = getBusySlots();
        draw();
    });

    subcourtList.addEventListener("click", (e) => {
        const item = e.target.closest(".subcourt-chip");
        if (!item) return;
        activeSubCourt = Number(item.dataset.index);
        selectedSlots.clear();
        busySlots = getBusySlots();
        renderSubCourts();
        renderSlots();
        renderSummary();
    });

    timeGrid.addEventListener("click", (e) => {
        const item = e.target.closest(".time-cell");
        if (!item || item.classList.contains("is-busy")) return;
        const { slot } = item.dataset;
        if (selectedSlots.has(slot)) {
            selectedSlots.delete(slot);
        } else {
            selectedSlots.add(slot);
        }
        renderSlots();
        renderSummary();
    });

    function continueFlow() {
        if (!selectedSlots.size) {
            showToast("Vui lòng chọn ít nhất 1 khung giờ");
            return;
        }
        const currentSelectedCourt = court;
        const slotText = [...selectedSlots].join(", ");
        
        // Save booked slots to prevent re-booking
        const dateStr = `2026-04-${dates[activeDate]}`;
        const subcourtId = subCourts[activeSubCourt].id;
        saveBookedSlots(court.id, dateStr, subcourtId, Array.from(selectedSlots));
        
        saveBooking({
            court: { ...currentSelectedCourt, name: `${currentSelectedCourt.name} - ${subCourts[activeSubCourt].label}` },
            slot: slotText,
            date: dateStr
        });
        window.location.href = "./profile.html";
    }

    document.getElementById("continueBooking").addEventListener("click", continueFlow);

    starRating?.addEventListener("click", (e) => {
        const button = e.target.closest(".star-btn");
        if (!button) return;
        selectedRating = Number(button.dataset.value);
        updateStarInput();
    });

    submitReview?.addEventListener("click", () => {
        const comment = (reviewComment?.value || "").trim();
        if (!selectedRating) {
            showToast("Vui lòng chọn số sao từ 1 đến 5");
            return;
        }
        if (!comment) {
            showToast("Vui lòng nhập nội dung đánh giá");
            return;
        }

        const allReviews = readStoredReviews();
        const list = Array.isArray(allReviews[court.id]) ? allReviews[court.id] : [];
        list.unshift({
            author: "Bạn",
            rating: selectedRating,
            comment
        });
        allReviews[court.id] = list;
        writeStoredReviews(allReviews);

        if (reviewComment) reviewComment.value = "";
        selectedRating = 0;
        updateStarInput();
        renderReviewList();
        showToast("Cảm ơn bạn đã gửi đánh giá!");
    });

    // Tab switching logic
    const tabBtns = document.querySelectorAll("#bookingTabBar .tab-btn");
    const blockDate = document.getElementById("blockDate");
    const blockSubCourt = document.getElementById("blockSubCourt");
    const blockTime = document.getElementById("blockTime");
    const blockInfo = document.getElementById("blockInfo");
    const blockReviews = document.getElementById("blockReviews");
    const bottomBar = document.getElementById("bottomBar");

    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                tabBtns.forEach(b => b.classList.remove("is-active"));
                btn.classList.add("is-active");

                const tab = btn.dataset.tab;

                // Hide all
                blockDate.style.display = "none";
                blockSubCourt.style.display = "none";
                blockTime.style.display = "none";
                blockInfo.style.display = "none";
                blockReviews.style.display = "none";
                bottomBar.style.display = "none";

                // Show active
                if (tab === "booking") {
                    blockDate.style.display = "block";
                    blockSubCourt.style.display = "block";
                    blockTime.style.display = "block";
                    bottomBar.style.display = "flex";
                } else if (tab === "info") {
                    blockInfo.style.display = "block";
                } else if (tab === "reviews") {
                    blockReviews.style.display = "block";
                }
            });
        });
    }

    draw();
    renderReviewList();
    updateStarInput();
    bindRevealAnimations();
}

function initProfile() {
    const booking = getBooking();
    const activeContainer = document.getElementById("activeBookingContainer");
    const historySection = document.getElementById("historySection");
    
    // 1. Handle Active Booking
    if (booking) {
        activeContainer.classList.remove("hidden");
        const box = document.getElementById("bookingInfo");
        const sportLabel = booking.court.sports ? booking.court.sports.join(', ') : (booking.court.sport || 'Thể thao');
        const price = booking.court.priceFrom || booking.court.pricePerHour || 0;
        
        box.innerHTML = `
            <div class="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                <h4 class="font-bold text-emerald-900">${booking.court.name}</h4>
                <p class="text-sm text-emerald-700">📍 ${booking.court.district} - ${sportLabel}</p>
                <div class="mt-3 pt-3 border-top border-emerald-100 space-y-2">
                    <p class="text-sm flex justify-between"><span>Khung giờ:</span> <strong>${booking.slot}</strong></p>
                    <p class="text-sm flex justify-between"><span>Ngày:</span> <strong>${booking.date}</strong></p>
                    <p class="text-sm flex justify-between"><span>Giá:</span> <strong>${price.toLocaleString("vi-VN")}đ/giờ</strong></p>
                </div>
            </div>
        `;
        // Clear the booking after displaying to prevent duplicates on refresh
        saveBooking(null);
    } else {
        activeContainer.classList.add("hidden");
    }

    // 2. Handle History
    const statsContainer = document.getElementById("historyStatsContainer");
    const filtersContainer = document.getElementById("historyFiltersContainer");
    const historyList = document.getElementById("historyList");

    // Real Data from Store
    const realHistory = getHistory();
    // Mock Data
    const mockHistory = [
        {
            id: "m1",
            courtId: "c1",
            courtName: "Sân Pickleball Cầu Giấy",
            sport: "Pickleball",
            address: "Số 1, Duy Tân, Cầu Giấy, Hà Nội",
            time: "18:00 - 19:30",
            date: "20/04/2026",
            totalAmount: 220000,
            status: "completed"
        },
        {
            id: "m2",
            courtId: "c4",
            courtName: "Sân Cầu lông Đống Đa",
            sport: "Cầu lông",
            address: "102 Trường Chinh, Đống Đa, Hà Nội",
            time: "19:00 - 21:00",
            date: "18/04/2026",
            totalAmount: 160000,
            status: "confirmed"
        },
        {
            id: "m3",
            courtId: "c4",
            courtName: "Sân Tennis Ba Đình",
            sport: "Tennis",
            address: "20 Phan Đình Phùng, Ba Đình, Hà Nội",
            time: "06:00 - 08:00",
            date: "22/04/2026",
            totalAmount: 450000,
            status: "pending"
        },
        {
            id: "m4",
            courtId: "c8",
            courtName: "Sân Bóng đá Mini Thanh Xuân",
            sport: "Bóng đá",
            address: "Khuất Duy Tiến, Thanh Xuân, Hà Nội",
            time: "20:00 - 21:30",
            date: "15/04/2026",
            totalAmount: 600000,
            status: "cancelled"
        }
    ];

    // Combine real and mock for a better look
    const fullHistory = [...realHistory, ...mockHistory];

    function calculateStats(data) {
        return {
            total: data.length,
            completed: data.filter(i => i.status === "completed").length,
            cancelled: data.filter(i => i.status === "cancelled").length
        };
    }

    if (statsContainer) statsContainer.innerHTML = renderHistoryStats(calculateStats(fullHistory));
    if (filtersContainer) filtersContainer.innerHTML = renderHistoryFilters();

    function renderHistory(data) {
        if (!historyList) return;
        if (data.length > 0) {
            historyList.innerHTML = data.map(createBookingHistoryCard).join("");
        } else {
            historyList.innerHTML = renderEmptyState();
        }
        bindRevealAnimations();
    }

    function filterHistory() {
        const keyword = document.getElementById("historySearchInput")?.value.toLowerCase() || "";
        const sport = document.getElementById("historySportFilter")?.value || "";
        const status = document.getElementById("historyStatusFilter")?.value || "";
        const time = document.getElementById("historyTimeFilter")?.value || "all";

        const filtered = fullHistory.filter(item => {
            if (keyword && !item.courtName.toLowerCase().includes(keyword)) return false;
            if (sport && item.sport !== sport) return false;
            if (status && item.status !== status) return false;
            return true;
        });

        renderHistory(filtered);
        
        // Update stats based on filtered results
        const stats = calculateStats(filtered);
        const totalEl = document.getElementById("statTotal");
        const completedEl = document.getElementById("statCompleted");
        const cancelledEl = document.getElementById("statCancelled");
        if (totalEl) totalEl.textContent = stats.total;
        if (completedEl) completedEl.textContent = stats.completed;
        if (cancelledEl) cancelledEl.textContent = stats.cancelled;
    }

    // Initial render
    renderHistory(fullHistory);

    // Event listeners for filters
    const searchInp = document.getElementById("historySearchInput");
    const sportFlt = document.getElementById("historySportFilter");
    const statusFlt = document.getElementById("historyStatusFilter");
    const timeFlt = document.getElementById("historyTimeFilter");
    const clearBtn = document.getElementById("clearHistoryFilters");

    searchInp?.addEventListener("input", filterHistory);
    sportFlt?.addEventListener("change", filterHistory);
    statusFlt?.addEventListener("change", filterHistory);
    timeFlt?.addEventListener("change", filterHistory);

    clearBtn?.addEventListener("click", () => {
        if (searchInp) searchInp.value = "";
        if (sportFlt) sportFlt.value = "";
        if (statusFlt) statusFlt.value = "";
        if (timeFlt) timeFlt.value = "all";
        renderHistory(fullHistory);
        
        // Reset stats
        const stats = calculateStats(fullHistory);
        if (document.getElementById("statTotal")) document.getElementById("statTotal").textContent = stats.total;
        if (document.getElementById("statCompleted")) document.getElementById("statCompleted").textContent = stats.completed;
        if (document.getElementById("statCancelled")) document.getElementById("statCancelled").textContent = stats.cancelled;
    });

    // View Details Logic
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".js-view-detail");
        if (!btn) return;

        const bookingId = btn.dataset.id;
        const booking = fullHistory.find(b => b.id === bookingId);
        if (!booking) return;

        const modalHtml = renderModal(
            "Chi tiết đơn đặt sân",
            `
            <div class="space-y-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="text-lg font-bold text-gray-900">${booking.courtName}</h4>
                        <p class="text-sm text-gray-500">${booking.address}</p>
                    </div>
                    <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">${booking.status.toUpperCase()}</span>
                </div>
                
                <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                    <div>
                        <p class="text-xs text-gray-500 uppercase font-bold">Môn thể thao</p>
                        <p class="font-medium">${booking.sport}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 uppercase font-bold">Ngày đặt</p>
                        <p class="font-medium">${booking.date}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 uppercase font-bold">Khung giờ</p>
                        <p class="font-medium">${booking.time}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 uppercase font-bold">Mã đơn hàng</p>
                        <p class="font-medium">#${booking.id}</p>
                    </div>
                </div>

                <div>
                    <p class="text-xs text-gray-500 uppercase font-bold mb-2">Thanh toán</p>
                    <div class="flex justify-between items-center py-2 border-b border-dashed">
                        <span class="text-gray-600">Giá thuê sân</span>
                        <span class="font-bold">${booking.totalAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-dashed">
                        <span class="text-gray-600">Phí dịch vụ</span>
                        <span class="font-bold">0đ</span>
                    </div>
                    <div class="flex justify-between items-center py-3">
                        <span class="text-gray-900 font-bold">Tổng cộng</span>
                        <span class="text-xl font-bold text-emerald-600">${booking.totalAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                </div>

                <div class="bg-amber-50 p-3 rounded-lg border border-amber-100">
                    <p class="text-xs text-amber-800 flex items-center gap-2">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" fill-rule="evenodd"></path></svg>
                        Vui lòng đến sân trước 15 phút để làm thủ tục nhận sân.
                    </p>
                </div>
            </div>
            `,
            `
            <button class="px-6 py-2 rounded-lg font-bold bg-gray-100 text-gray-700 hover:bg-gray-200" id="modalCloseBtn">Đóng</button>
            `
        );

        // Inject modal to body
        let modalContainer = document.getElementById("modalContainer");
        if (!modalContainer) {
            modalContainer = document.createElement("div");
            modalContainer.id = "modalContainer";
            document.body.appendChild(modalContainer);
        }
        modalContainer.innerHTML = modalHtml;

        showModal();

        // Close logic
        document.getElementById("closeModal")?.addEventListener("click", hideModal);
        document.getElementById("modalCloseBtn")?.addEventListener("click", hideModal);
        document.getElementById("appModal")?.addEventListener("click", (e) => {
            if (e.target.id === "appModal") hideModal();
        });
    });

    // Rebook logic
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".js-rebook");
        if (!btn) return;

        const courtId = btn.dataset.courtId;
        if (courtId) {
            window.location.href = `./booking.html?id=${courtId}`;
        } else {
            showToast("Không tìm thấy thông tin sân để đặt lại");
        }
    });

    const form = document.getElementById("bookingForm");
    const err = document.getElementById("formError");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const fullName = document.getElementById("fullName").value.trim();
            const phone = document.getElementById("phone").value.trim();

            if (!fullName || fullName.length < 2) {
                err.textContent = "Vui lòng nhập họ tên hợp lệ.";
                return;
            }
            if (!/^0\d{9}$/.test(phone)) {
                err.textContent = "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0).";
                return;
            }
            const email = document.getElementById("email").value.trim();
            if (email && !email.endsWith("@gmail.com")) {
                err.textContent = "Email phải kết thúc bằng @gmail.com.";
                return;
            }
            err.textContent = "";
            
            // Add to history
            const sportLabel = booking.court.sports ? booking.court.sports.join(', ') : (booking.court.sport || 'Thể thao');
            const price = booking.court.priceFrom || booking.court.pricePerHour || 0;
            const totalHours = booking.slot.split(',').length;

            saveToHistory({
                id: "b" + Date.now(),
                courtId: booking.court.id,
                courtName: booking.court.name,
                sport: sportLabel,
                address: booking.court.district,
                time: booking.slot,
                date: booking.date,
                totalAmount: price * totalHours,
                status: "confirmed"
            });

            // Show Success Modal with Lottie
            const successContent = `
                <div class="text-center py-6">
                    <lottie-player src="https://assets10.lottiefiles.com/packages/lf20_rc67lj7p.json" background="transparent" speed="1" style="width: 150px; height: 150px; margin: 0 auto;" autoplay></lottie-player>
                    <h3 class="text-2xl font-bold text-gray-900 mt-4">Đặt sân thành công!</h3>
                    <p class="text-gray-500 mt-2">Thông tin đơn hàng đã được lưu vào lịch sử của bạn.</p>
                </div>
            `;
            
            const modalHtml = renderModal(
                "Thông báo",
                successContent,
                `<button class="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold" id="modalCloseBtn">Tuyệt vời!</button>`
            );

            let modalContainer = document.getElementById("modalContainer");
            if (!modalContainer) {
                modalContainer = document.createElement("div");
                modalContainer.id = "modalContainer";
                document.body.appendChild(modalContainer);
            }
            modalContainer.innerHTML = modalHtml;
            showModal();

            document.getElementById("modalCloseBtn")?.addEventListener("click", () => {
                hideModal();
                form.reset();
                saveBooking(null);
                initProfile();
            });
        });
    }
    bindRevealAnimations();
}

function initSearch(config, courts) {
    const searchInput = document.getElementById("searchInput");
    const districtFilter = document.getElementById("districtFilter");
    const sportFilters = document.querySelectorAll('input[name="sport"]');
    const priceFilters = document.querySelectorAll('input[name="price"]');
    const clearBtn = document.getElementById("clearFilters");
    const resultsContainer = document.getElementById("searchResults");
    const countEl = document.getElementById("courtCount");

    // Show Skeletons initially
    renderSkeletonCards(resultsContainer);
    if (countEl) countEl.textContent = "...";

    // Initialize Map if it exists
    if (document.getElementById("map") && !map) {
        map = L.map('map').setView([21.0285, 105.8542], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        markersLayer = L.layerGroup().addTo(map);
    }

    // Apply URL params BEFORE the timeout so filters are set when skeleton resolves
    const urlParams = new URLSearchParams(window.location.search);
    const qParam = urlParams.get('q');
    const sportParam = urlParams.get('sport');

    if (qParam) searchInput.value = qParam;
    if (sportParam) {
        sportFilters.forEach(cb => {
            if (cb.value === sportParam) cb.checked = true;
        });
    }

    // Artificial delay to show skeleton effect.
    // filterCourts() reads the checkboxes/inputs that are already set above,
    // so URL param filters (e.g. ?sport=Tennis) are always respected.
    setTimeout(() => {
        filterCourts();
    }, 1000);

    function updateMarkers(filteredData) {
        if (!markersLayer) return;
        markersLayer.clearLayers();
        filteredData.forEach(court => {
            if (!court.lat || !court.lng) {
                console.warn("[Thiếu tọa độ] Sân: " + court.name);
                return;
            }
            const marker = L.marker([court.lat, court.lng]);
            marker.bindPopup(`
                <div class="map-popup-card">
                    <h4>${court.name}</h4>
                    <p>📍 ${court.district}</p>
                    <p class="font-bold text-emerald-600">${court.priceFrom.toLocaleString()}đ</p>
                    <a href="./booking.html?id=${court.id}" class="text-xs text-blue-500 underline mt-1 block">Đặt ngay</a>
                </div>
            `);
            markersLayer.addLayer(marker);
        });
    }

    function render(filteredCourts) {
        if (!filteredCourts.length) {
            resultsContainer.innerHTML = '<div class="empty-state">Không tìm thấy sân phù hợp.</div>';
        } else {
            resultsContainer.innerHTML = filteredCourts.map(renderCourtCard).join("");
        }
        countEl.textContent = filteredCourts.length;
        updateMarkers(filteredCourts);
        bindRevealAnimations();
    }

    function filterCourts() {
        const keyword = searchInput.value.toLowerCase();
        const district = districtFilter.value;
        const selectedSports = Array.from(sportFilters).filter(cb => cb.checked).map(cb => cb.value);
        const selectedPrice = document.querySelector('input[name="price"]:checked').value;

        const filtered = courts.filter(court => {
            const matchKeyword =
                !keyword ||
                court.name.toLowerCase().includes(keyword) ||
                (court.address || "").toLowerCase().includes(keyword);

            const matchDistrict = !district || court.district === district;

            const courtSports = court.sports || [court.sport].filter(Boolean);
            const matchSport =
                selectedSports.length === 0 ||
                courtSports.some((s) => selectedSports.includes(s));

            const price = court.priceFrom || court.pricePerHour || 0;
            const matchPrice =
                selectedPrice === 'all' ||
                (selectedPrice === 'under_100' && price < 100000) ||
                (selectedPrice === '100_200' && price >= 100000 && price <= 200000) ||
                (selectedPrice === 'over_200' && price > 200000);

            // 2 AND + 1 OR: keyword, district và price phải thỏa mãn;
            // thể thao nhiều lựa chọn là OR trong chính nó.
            return matchKeyword && matchDistrict && matchSport && matchPrice;
        });

        render(filtered);
    }

    searchInput.addEventListener("input", filterCourts);
    districtFilter.addEventListener("change", filterCourts);
    sportFilters.forEach(cb => cb.addEventListener("change", filterCourts));
    priceFilters.forEach(cb => cb.addEventListener("change", filterCourts));

    clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        districtFilter.value = "";
        sportFilters.forEach(cb => cb.checked = false);
        document.querySelector('input[name="price"][value="all"]').checked = true;
        filterCourts();
    });

    // URL params and initial render are handled by the setTimeout above.
}

function bindRevealAnimations() {
    const targets = document.querySelectorAll(".reveal-up");
    if (!targets.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.18 }
    );

    targets.forEach((el) => observer.observe(el));
}

async function bootstrap() {
    const page = getCurrentPage();
    setupNavbar(page);
    setupFooter();
    const { config, courts } = await loadData();
    if (page === "home") initHome(config, courts);
    if (page === "booking") initBooking(config, courts);
    if (page === "profile") initProfile();
    if (page === "search") initSearch(config, courts);
    bindRevealAnimations();
}

bootstrap();

// Global handler for 'Đặt ngay' buttons across the app
document.addEventListener("click", (e) => {
    const btn = e.target.closest(".js-select-court");
    if (btn) {
        const courtId = btn.dataset.id;
        // In a real app we'd save this to global state or pass via URL
        // For now we just redirect to booking.html to continue the flow
        window.location.href = "./booking.html?id=" + courtId;
    }
});
