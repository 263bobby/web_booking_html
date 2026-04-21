import { renderNavbar } from "../components/Navbar.js";
import { renderFooter } from "../components/Footer.js";
import { renderCourtCard } from "../components/CourtCard.js";
import { showToast } from "../components/Toast.js";
import { getCurrentPage, goToProfile } from "./router.js";
import { getBooking, saveBooking } from "./store.js";

let selectedCourt = null;

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

    bindRevealAnimations();
}

function initBooking(config, courts) {
    // 1. Get Court from URL
    const urlParams = new URLSearchParams(window.location.search);
    const courtId = urlParams.get('id');
    const foundCourt = courts.find(c => c.id === courtId);
    const court = foundCourt ? foundCourt : courts[0];

    const gallery = [
        court.image || "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1554068865-24cecd4e34f8?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80"
    ];
    let imageIndex = 0;
    let activeDate = 0;
    let activeSubCourt = 0;
    const selectedSlots = new Set();

    // 2. Generate timeline from 06:00 to 22:00
    const slotTimeline = Array.from({ length: 17 }, (_, i) => `${String(i + 6).padStart(2, "0")}:00`);

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
        return busy;
    }

    let busySlots = getBusySlots();

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
        saveBooking({
            court: { ...currentSelectedCourt, name: `${currentSelectedCourt.name} - ${subCourts[activeSubCourt].label}` },
            slot: slotText,
            date: `2026-04-${dates[activeDate]}`
        });
        window.location.href = "./profile.html";
    }

    document.getElementById("continueBooking").addEventListener("click", continueFlow);
    document.getElementById("bottomConfirm").addEventListener("click", continueFlow);

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
    const box = document.getElementById("bookingInfo");
    if (booking) {
        const sportLabel = booking.court.sports ? booking.court.sports.join(', ') : (booking.court.sport || 'Thể thao');
        const price = booking.court.priceFrom || booking.court.pricePerHour || 0;
        box.innerHTML = `
      <h4>${booking.court.name}</h4>
      <p>${booking.court.district} - ${sportLabel}</p>
      <p>Khung giờ: <strong>${booking.slot}</strong></p>
      <p>Giá: <strong>${price.toLocaleString("vi-VN")}đ/giờ</strong></p>
    `;
    } else {
        box.innerHTML = "<p>Bạn chưa chọn sân. Vui lòng quay lại trang tìm sân.</p>";
    }

    const form = document.getElementById("bookingForm");
    const err = document.getElementById("formError");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const fullName = document.getElementById("fullName").value.trim();
        const phone = document.getElementById("phone").value.trim();
        if (!fullName || !/^0\d{9}$/.test(phone)) {
            err.textContent = "Vui lòng nhập họ tên và số điện thoại hợp lệ (10 số, bắt đầu bằng 0).";
            return;
        }
        err.textContent = "";
        showToast("Đặt sân thành công!");
        form.reset();
    });
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

    function render(filteredCourts) {
        resultsContainer.innerHTML = filteredCourts.length ? filteredCourts.map(renderCourtCard).join("") : '<div class="empty-state">Không tìm thấy sân phù hợp.</div>';
        countEl.textContent = filteredCourts.length;
        bindRevealAnimations();
    }

    function filterCourts() {
        const keyword = searchInput.value.toLowerCase();
        const district = districtFilter.value;
        const selectedSports = Array.from(sportFilters).filter(cb => cb.checked).map(cb => cb.value);
        const selectedPrice = document.querySelector('input[name="price"]:checked').value;

        const filtered = courts.filter(court => {
            // Keyword match (name or address)
            if (keyword && !court.name.toLowerCase().includes(keyword) && !(court.address || "").toLowerCase().includes(keyword)) return false;

            // District match
            if (district && court.district !== district) return false;

            // Sport match
            if (selectedSports.length > 0) {
                const courtSports = court.sports || [court.sport];
                if (!courtSports.some(s => selectedSports.includes(s))) return false;
            }

            // Price match
            const price = court.priceFrom || court.pricePerHour || 0;
            if (selectedPrice === 'under_100' && price >= 100000) return false;
            if (selectedPrice === '100_200' && (price < 100000 || price > 200000)) return false;
            if (selectedPrice === 'over_200' && price <= 200000) return false;

            return true;
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

    // Initial render
    render(courts);
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
