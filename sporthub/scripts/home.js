/**
 * Home Page Controller
 *
 * Trách nhiệm:
 *  - init(): gọi sau khi home.html được inject vào #app
 *  - Render CourtCard components
 *  - Mount SportFilter component
 *  - Xử lý search + filter logic
 *  - Subscribe store (favorites sync)
 *  - destroy(): cleanup khi rời khỏi trang
 *
 * Được gọi bởi router.js sau khi load template xong.
 */

import store from './store.js';
import router from './router.js';
import api from './api.js';
import CourtCard from '../components/CourtCard.js';
import SportFilter from '../components/SportFilter.js';

// ── Module-level state (reset mỗi lần init) ──────────────────
let allCourts = [];
let activeSport = 'all';
let searchQuery = '';
let unsubscribe = null;  // store cleanup

// ── Lifecycle ─────────────────────────────────────────────────

async function init() {
  // 1. Fetch dữ liệu sân
  allCourts = await api.getCourts();

  // 2. Mount sport filter
  _mountSportFilter();

  // 3. Render lưới sân lần đầu
  _renderGrid();

  // 4. Gắn sự kiện
  _attachEvents();

  // 5. Subscribe store để re-render khi favorites thay đổi
  unsubscribe = store.subscribe(() => _renderGrid());
}

function destroy() {
  if (unsubscribe) unsubscribe();
  unsubscribe = null;
}

// ── Mount Sport Filter ─────────────────────────────────────────

function _mountSportFilter() {
  const root = document.getElementById('sport-filter-root');
  if (!root) return;

  const filter = new SportFilter({
    onSelect(sport) {
      activeSport = sport;
      _renderGrid();
    },
  });
  filter.mount(root);
}

// ── Render Logic ───────────────────────────────────────────────

function _renderGrid() {
  const grid = document.getElementById('courts-grid');
  const countEl = document.getElementById('courts-count');
  if (!grid) return;

  const { favorites } = store.getState();
  const filtered = _filterCourts(allCourts, activeSport, searchQuery);

  // Cập nhật counter
  if (countEl) countEl.textContent = `${filtered.length} sân tìm thấy`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state__icon">🔍</div>
        <h3 class="empty-state__title">Không tìm thấy sân phù hợp</h3>
        <p class="empty-state__desc">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
      </div>
    `;
    return;
  }

  // Render từng CourtCard
  grid.innerHTML = '';
  filtered.forEach((court) => {
    const card = new CourtCard({
      court,
      isFavorite: favorites.includes(court.id),
      onToggleFavorite: (id) => _handleToggleFavorite(id),
      onBook: (id) => router.navigate(`#/booking?courtId=${id}`),
      onView: (id) => _handleViewDetails(id),
    });
    grid.appendChild(card.render());
  });
}

/** Lọc sân theo môn thể thao và search query */
function _filterCourts(courts, sport, query) {
  return courts.filter((c) => {
    const matchSport =
      sport === 'all' || c.sports.includes(sport);
    const matchSearch =
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.district.toLowerCase().includes(query) ||
      c.address.toLowerCase().includes(query);
    return matchSport && matchSearch;
  });
}

// ── Event Handlers ─────────────────────────────────────────────

function _attachEvents() {
  // Search input với debounce nhẹ
  const input = document.getElementById('search-input');
  if (input) {
    let debounceTimer;
    input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchQuery = e.target.value.trim().toLowerCase();
        _renderGrid();
      }, 250);
    });
  }

  // Hero CTA buttons
  document.getElementById('hero-find-btn')?.addEventListener('click', () => {
    document.querySelector('.search-bar')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('hero-history-btn')?.addEventListener('click', () => {
    router.navigate('#/profile');
  });
}

async function _handleToggleFavorite(courtId) {
  const { favorites } = store.getState();
  const isFav = favorites.includes(courtId);

  store.setState({
    favorites: isFav
      ? favorites.filter((id) => id !== courtId)
      : [...favorites, courtId],
  });

  // Toast feedback
  const { toast } = await import('./utils.js').catch(() => ({}));
  // Vì đây là sync context, dùng event thay vì await
  window.dispatchEvent(new CustomEvent('app:toast', {
    detail: {
      message: isFav ? 'Đã bỏ yêu thích' : '❤️ Đã thêm vào yêu thích',
      type: isFav ? 'info' : 'success',
    },
  }));
}

function _handleViewDetails(courtId) {
  const court = allCourts.find((c) => c.id === courtId);
  if (!court) return;
  // Dispatch event để Modal.js bắt
  window.dispatchEvent(new CustomEvent('app:open-court-details', { detail: { court } }));
}

// ── Export controller interface ────────────────────────────────
export default { init, destroy };