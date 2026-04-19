class Toast {
    constructor() {
        this.element = null;
        this.timeoutId = null;
        this.createToast();
    }

    createToast() {
        this.element = document.createElement('div');
        this.element.className = 'toast';
        document.body.appendChild(this.element);
    }

    show(message, duration = 3000) {
        this.element.textContent = message;
        this.element.classList.add('show');

        // Clear any existing timeout
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        // Auto hide after duration
        this.timeoutId = setTimeout(() => {
            this.hide();
        }, duration);
    }

    hide() {
        this.element.classList.remove('show');
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
}

// Export for use in other modules
export default Toast;