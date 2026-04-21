export function renderModal(title, content, actions = "") {
    return `
    <div class="modal" id="appModal">
      <div class="modal__content reveal-up is-visible">
        <div class="modal__header flex justify-between items-center mb-4 border-b pb-3">
            <h3 class="text-xl font-bold text-gray-900">${title}</h3>
            <button class="text-gray-400 hover:text-gray-600" id="closeModal">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
        <div class="modal__body">
          ${content}
        </div>
        <div class="modal__actions flex justify-end gap-3 mt-6 border-t pt-4">
          ${actions || '<button class="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-bold" id="modalCloseBtn">Đóng</button>'}
        </div>
      </div>
    </div>
  `;
}

export function showModal() {
    const modal = document.getElementById("appModal");
    if (modal) modal.classList.add("is-open");
}

export function hideModal() {
    const modal = document.getElementById("appModal");
    if (modal) modal.classList.remove("is-open");
}
