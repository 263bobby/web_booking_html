export function renderHistoryStats(stats = { total: 0, completed: 0, cancelled: 0 }) {
  return `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <p class="text-sm text-gray-500 mb-1">Tổng số đơn</p>
        <h3 class="text-2xl font-bold text-gray-900" id="statTotal">${stats.total}</h3>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <p class="text-sm text-gray-500 mb-1">Đã hoàn thành</p>
        <h3 class="text-2xl font-bold text-emerald-600" id="statCompleted">${stats.completed}</h3>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <p class="text-sm text-gray-500 mb-1">Đã hủy</p>
        <h3 class="text-2xl font-bold text-rose-600" id="statCancelled">${stats.cancelled}</h3>
      </div>
    </div>
  `;
}

export function renderHistoryFilters() {
  return `
    <div class="flex flex-col md:flex-row gap-3 mb-6 items-end">
      <div class="flex-1 w-full">
        <label class="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </span>
          <input type="text" id="historySearchInput" placeholder="Tìm theo tên sân..." class="pl-10 w-full rounded-lg border-gray-200 focus:ring-emerald-500 focus:border-emerald-500">
        </div>
      </div>
      
      <div class="w-full md:w-48">
        <label class="block text-sm font-medium text-gray-700 mb-1">Loại sân</label>
        <select id="historySportFilter" class="w-full rounded-lg border-gray-200 focus:ring-emerald-500 focus:border-emerald-500">
          <option value="">Tất cả</option>
          <option value="Pickleball">Pickleball</option>
          <option value="Cầu lông">Cầu lông</option>
          <option value="Tennis">Tennis</option>
          <option value="Bóng đá">Bóng đá</option>
        </select>
      </div>

      <div class="w-full md:w-48">
        <label class="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
        <select id="historyStatusFilter" class="w-full rounded-lg border-gray-200 focus:ring-emerald-500 focus:border-emerald-500">
          <option value="">Tất cả</option>
          <option value="completed">Hoàn thành</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="pending">Chờ thanh toán</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      <div class="w-full md:w-48">
        <label class="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
        <select id="historyTimeFilter" class="w-full rounded-lg border-gray-200 focus:ring-emerald-500 focus:border-emerald-500">
          <option value="all">Tất cả thời gian</option>
          <option value="7days">7 ngày qua</option>
          <option value="30days">30 ngày qua</option>
          <option value="this_month">Tháng này</option>
        </select>
      </div>

      <button class="text-emerald-600 hover:text-emerald-700 font-medium text-sm py-2 px-1 whitespace-nowrap" id="clearHistoryFilters">
        Xóa lọc
      </button>
    </div>
  `;
}

export function createBookingHistoryCard(booking) {
  const { courtName, sport, address, time, date, totalAmount, status } = booking;

  let statusClass = "";
  let statusText = "";

  switch (status) {
    case "completed":
      statusClass = "bg-emerald-100 text-emerald-700";
      statusText = "Hoàn thành";
      break;
    case "confirmed":
      statusClass = "bg-blue-100 text-blue-700";
      statusText = "Đã xác nhận";
      break;
    case "pending":
      statusClass = "bg-amber-100 text-amber-700";
      statusText = "Chờ thanh toán";
      break;
    case "cancelled":
      statusClass = "bg-rose-100 text-rose-700";
      statusText = "Đã hủy";
      break;
    default:
      statusClass = "bg-gray-100 text-gray-700";
      statusText = status;
  }

  return `
    <div class="flex flex-col md:flex-row justify-between p-5 bg-white rounded-xl border border-gray-200 transition-shadow duration-300 hover:shadow-md mb-4 gap-4" data-id="${booking.id || ''}">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-1">
          <h3 class="text-lg font-bold text-gray-900">${courtName}</h3>
          <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">${sport}</span>
        </div>
        <p class="text-sm text-gray-500 mb-2">📍 ${address}</p>
        <p class="text-sm font-medium text-gray-700">
          <span class="inline-flex items-center gap-1">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            ${time} | ${date}
          </span>
        </p>
      </div>

      <div class="flex flex-col items-start md:items-end justify-between gap-4">
        <div class="text-left md:text-right">
          <p class="text-lg font-bold text-gray-900">${totalAmount.toLocaleString('vi-VN')}đ</p>
        </div>
        
        <div class="flex gap-2 w-full md:w-auto">
          <button class="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium text-sm flex-1 md:flex-none transition-colors js-view-detail" data-id="${booking.id || ''}">
            Xem chi tiết
          </button>
          <button class="bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-2 rounded-lg font-medium text-sm flex-1 md:flex-none transition-colors">
            Đặt lại sân
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderEmptyState() {
  return `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
        </svg>
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Chưa có lịch sử đặt sân nào</h3>
      <p class="text-gray-500 mb-8 max-w-xs">Hãy khám phá các sân thể thao tuyệt vời và bắt đầu tập luyện ngay hôm nay!</p>
      <a href="./search.html" class="bg-emerald-600 text-white hover:bg-emerald-700 px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-200">
        Tìm sân ngay
      </a>
    </div>
  `;
}
