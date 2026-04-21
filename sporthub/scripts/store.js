const KEY = "sporthub_booking";

export function saveBooking(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getBooking() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}
