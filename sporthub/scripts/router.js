/**
 * Router — Hash-based SPA Navigation
 *
 * Cách hoạt động:
 *  1. Lắng nghe hashchange event trên window
 *  2. Map hash (#/home, #/booking?id=c1) → { template, controller }
 *  3. Fetch HTML template từ /pages/*.html
 *  4. Inject vào #app
 *  5. Dynamic import controller module → gọi init()
 *  6. Dispatch custom event app:route-changed để Navbar sync
 *
 * Lưu ý: cần chạy qua HTTP server (không dùng file://)
 *   → python -m http.server 8080
 */

const APP_ROOT = document.getElementById('app');

/**
 * Route table:
 * key   = hash pattern (không có query string)
 * value = { template: đường dẫn HTML, controller: dynamic import }
 */
const ROUTES = {
  '#/home': {
    template: 'pages/home.html',
    controller: () => import('./home.js'),
  },
  '#/booking': {
    template: 'pages/booking.html',
    controller: () => import('./booking.js'),
  },
  '#/profile': {
    template: 'pages/profile.html',
    controller: () => import('./profile.js'),
  },
};

/** Trang 404 fallback */
const NOT_FOUND_HTML = `
  <div class="empty-state" style="min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center">
    <div class="empty-state__icon">🔍</div>
    <h2 class="empty-state__title">Trang không tồn tại</h2>
    <p class="empty-state__desc">Đường dẫn bạn truy cập không hợp lệ.</p>
    <button class="btn btn--primary" onclick="location.hash='#/home'">Về trang chủ</button>
  </div>
`;

class Router {
  constructor() {
    this._currentRoute = null;
    this._currentController = null;
  }

  // ── Public API ─────────────────────────────────────────────

  /** Khởi động router — gọi 1 lần trong main.js */
  init() {
    // Xử lý điều hướng ban đầu
    window.addEventListener('hashchange', () => this._handleRoute());
    this._handleRoute();
  }

  /**
   * Điều hướng đến route mới
   * @param {string} hash - ví dụ: '#/booking', '#/booking?courtId=c1'
   */
  navigate(hash) {
    if (window.location.hash === hash) {
      // Cùng route → chỉ scroll lên đầu trang
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.location.hash = hash;
  }

  /** Lấy query params từ hash hiện tại */
  getParams() {
    const raw = window.location.hash; // '#/booking?courtId=c1&date=2025-01-15'
    const qIndex = raw.indexOf('?');
    if (qIndex === -1) return {};
    return Object.fromEntries(new URLSearchParams(raw.slice(qIndex + 1)));
  }

  /** Lấy hash path không có query string */
  getCurrentPath() {
    const hash = window.location.hash || '#/home';
    const qIndex = hash.indexOf('?');
    return qIndex === -1 ? hash : hash.slice(0, qIndex);
  }

  // ── Private ────────────────────────────────────────────────

  async _handleRoute() {
    const path = this.getCurrentPath();
    const route = ROUTES[path];

    // Unmount controller cũ (nếu có cleanup)
    if (this._currentController?.destroy) {
      this._currentController.destroy();
    }

    if (!route) {
      this._renderNotFound();
      return;
    }

    // Show loading spinner trong lúc fetch
    this._showLoading();

    try {
      // Fetch HTML template
      const html = await this._fetchTemplate(route.template);

      // Inject vào #app với animation
      APP_ROOT.innerHTML = html;
      APP_ROOT.querySelector('.page-wrapper')?.classList.add('page-enter');

      // Dynamic import controller → gọi init()
      const mod = await route.controller();
      this._currentController = mod.default ?? mod;

      if (typeof this._currentController.init === 'function') {
        await this._currentController.init();
      }

      // Scroll lên đầu trang
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Thông báo cho Navbar và các subscriber khác
      this._dispatchRouteChanged(path);

      this._currentRoute = path;

    } catch (err) {
      console.error('[Router] Lỗi khi load route:', path, err);
      this._renderError(err);
    }
  }

  /** Fetch HTML template từ server và trả về string */
  async _fetchTemplate(templatePath) {
    const res = await fetch(templatePath);
    if (!res.ok) throw new Error(`HTTP ${res.status} — không tải được ${templatePath}`);
    return res.text();
  }

  _showLoading() {
    APP_ROOT.innerHTML = `
      <div class="page-loading" role="status" aria-label="Đang tải trang">
        <div class="spinner" aria-hidden="true"></div>
        <span>Đang tải...</span>
      </div>
    `;
  }

  _renderNotFound() {
    APP_ROOT.innerHTML = NOT_FOUND_HTML;
    this._dispatchRouteChanged('#/404');
  }

  _renderError(err) {
    APP_ROOT.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">⚠️</div>
        <h2 class="empty-state__title">Không thể tải trang</h2>
        <p class="empty-state__desc">${err.message}</p>
        <p style="font-size:13px;color:var(--gray-400);margin-top:8px">
          Hãy chắc chắn bạn đang chạy qua HTTP server (không dùng file://)
        </p>
        <button class="btn btn--primary" style="margin-top:16px" onclick="location.reload()">Thử lại</button>
      </div>
    `;
  }

  _dispatchRouteChanged(hash) {
    window.dispatchEvent(new CustomEvent('app:route-changed', { detail: { hash } }));
  }
}

// Singleton — export 1 instance duy nhất
const router = new Router();
export default router;