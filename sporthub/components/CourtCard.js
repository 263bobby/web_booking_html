export function renderCourtCard(court) {
  const sportLabel = court.sports ? court.sports.join(', ') : (court.sport || 'Thể thao');
  const price = court.priceFrom || court.pricePerHour || 0;
  return `
    <article class="court-card reveal-up">
      <img src="${court.image}" alt="${court.name}">
      <div class="court-card__body">
        <span class="badge">${sportLabel}</span>
        <h3>${court.name}</h3>
        <p class="court-card__meta">${court.district} - ${court.rating} ★</p>
        <div class="court-card__footer">
          <p class="court-card__price"><strong>${price.toLocaleString("vi-VN")}đ/giờ</strong></p>
          <button class="btn btn--primary js-select-court" data-id="${court.id}" type="button">Đặt ngay</button>
        </div>
      </div>
    </article>
  `;
}
