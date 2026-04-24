const KEY = "sporthub_booking";
const HISTORY_KEY = "sporthub_history";
const BOOKED_SLOTS_KEY = "sporthub_booked_slots";

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

// Save booked slots
export function saveBookedSlots(courtId, date, subcourtId, slots) {
  const booked = getBookedSlots();
  const key = `${courtId}_${date}_${subcourtId}`;
  booked[key] = slots;
  localStorage.setItem(BOOKED_SLOTS_KEY, JSON.stringify(booked));
}

// Get booked slots for specific court, date, and subcourt
export function getBookedSlots(courtId, date, subcourtId) {
  const booked = JSON.parse(localStorage.getItem(BOOKED_SLOTS_KEY) || "{}");
  if (courtId && date && subcourtId) {
    const key = `${courtId}_${date}_${subcourtId}`;
    return booked[key] || new Set();
  }
  return booked;
}

// Get all booked slots
export function getAllBookedSlots() {
  return JSON.parse(localStorage.getItem(BOOKED_SLOTS_KEY) || "{}");
}
