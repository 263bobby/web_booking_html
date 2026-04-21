export function renderFooter() {
    const year = new Date().getFullYear();
    return `
    <footer class="site-footer">
      <div class="container footer__grid">
        <div>
          <h3>SportHub Hà Nội</h3>
          <p>Đặt sân thể thao nhanh, minh bạch giá, xác nhận trong vài giây.</p>
        </div>
        <div>
          <h4>Danh mục</h4>
          <a href="./home.html">Trang chủ</a>
          <a href="./search.html">Tìm sân</a>
          <a href="./profile.html">Xác nhận đặt sân</a>
        </div>
        <div>
          <h4>Hỗ trợ</h4>
          <p>Hotline: 1900 6868</p>
          <p>Email: support@sporthub.vn</p>
          <p>08:00 - 22:00 (Mỗi ngày)</p>
        </div>
      </div>
      <div class="container footer__bottom">
        <span>© ${year} SportHub. All rights reserved.</span>
        <span>Điều khoản • Bảo mật • Chính sách hoàn tiền</span>
      </div>
    </footer>
  `;
}
