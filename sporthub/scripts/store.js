const KEY = "sporthub_booking";
const HISTORY_KEY = "sporthub_history";

export function saveBooking(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getBooking() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveToHistory(booking) {
  const history = getHistory();
  history.unshift(booking);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function getHistory() {
  const raw = localStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}
