export function renderNavbar(currentPage) {
  const pages = [
    { href: "./home.html", key: "home", label: "Trang chủ" },
    { href: "./search.html", key: "search", label: "Tìm sân" },
    { href: "./profile.html", key: "profile", label: "Lịch sử" }
  ];

  return `
    <nav class="nav">
      <div class="container nav__inner">
        <a class="nav__brand" href="./home.html">
          <span class="nav__logo">⚡</span>
          <span>SportHub</span>
        </a>
        <div class="nav__search">
          <input type="search" placeholder="Tìm sân theo tên, khu vực..." aria-label="Tìm kiếm sân">
        </div>
        <button class="nav__toggle" id="navToggle" type="button">☰</button>
        <div class="nav__menu" id="navMenu">
          ${pages
      .map(
        (p) =>
          `<a href="${p.href}" class="nav__link ${p.key === currentPage ? "is-active" : ""}">${p.label}</a>`
      )
      .join("")}
        </div>
      </div>
    </nav>
  `;
}
