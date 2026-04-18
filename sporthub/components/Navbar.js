/**
 * Navbar Component
 *
 * Trách nhiệm:
 *  - Render thanh điều hướng vào #navbar-root
 *  - Highlight active link dựa theo route hiện tại
 *  - Subscribe store → cập nhật booking badge khi confirmedCount thay đổi
 *
 * Pattern: Class component với mount/unmount lifecycle
 */

import store from '../scripts/store.js';
import router from '../scripts/router.js';

export default class Navbar {
    constructor() {
        this.root = document.getElementById('navbar-root');
        this.unsubscribe = null; // cleanup function
    }

    // ── Lifecycle ──────────────────────────────────────────────

    mount() {
        this.render();
        this._attachEvents();
        // Subscribe store để re-render badge khi bookings thay đổi
        this.unsubscribe = store.subscribe(() => this._updateBadge());
    }

    unmount() {
        if (this.unsubscribe) this.unsubscribe();
    }

    // ── Render ─────────────────────────────────────────────────

    render() {
        this.root.innerHTML = `
      <nav class="navbar" role="navigation" aria-label="Điều hướng chính">
        <div class="navbar__inner">

          <!-- Brand -->
          <a class="navbar__brand" href="#/home" aria-label="SportHub - Trang chủ">
            <span class="navbar__brand-icon" aria-hidden="true">⚡</span>
            <span class="navbar__brand-name">Sport<span>Hub</span></span>
          </a>

          <!-- Nav links -->
          <div class="navbar__links" role="list">
            <button
              class="navbar__btn"
              data-route="#/home"
              role="listitem"
              aria-label="Trang chủ"
            >
              <span aria-hidden="true">🏠</span> Trang chủ
            </button>

            <button
              class="navbar__btn"
              data-route="#/profile"
              role="listitem"
              aria-label="Lịch sử đặt sân"
            >
              <span aria-hidden="true">📋</span> Lịch sử đặt sân
              <span
                class="navbar__badge"
                id="booking-badge"
                aria-label="số lượt đặt sân đang hoạt động"
                hidden
              >0</span>
            </button>
          </div>

        </div>
      </nav>
    `;

        // Cập nhật active state ngay sau render
        this._updateActiveLink(window.location.hash || '#/home');
        this._updateBadge();
    }

    // ── Private ─────────────────────────────────────────────────

    /** Gắn sự kiện click và lắng nghe route changes từ router */
    _attachEvents() {
        // Click các nav buttons
        this.root.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-route]');
            if (!btn) return;
            router.navigate(btn.dataset.route);
        });

        // Lắng nghe router thay đổi để cập nhật active state
        window.addEventListener('app:route-changed', (e) => {
            this._updateActiveLink(e.detail.hash);
        });
    }

    /** Highlight button tương ứng với route đang active */
    _updateActiveLink(hash) {
        const buttons = this.root.querySelectorAll('.navbar__btn[data-route]');
        buttons.forEach((btn) => {
            const isActive = hash.startsWith(btn.dataset.route);
            btn.classList.toggle('navbar__btn--active', isActive);
            btn.setAttribute('aria-current', isActive ? 'page' : 'false');
        });
    }

    /** Cập nhật số badge dựa theo confirmed bookings trong store */
    _updateBadge() {
        const badge = document.getElementById('booking-badge');
        if (!badge) return;

        const { bookings } = store.getState();
        const count = bookings.filter((b) => b.status === 'confirmed').length;

        if (count > 0) {
            badge.textContent = count;
            badge.hidden = false;
        } else {
            badge.hidden = true;
        }
    }
}