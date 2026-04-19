class Modal {
    constructor() {
        this.backdrop = null;
        this.content = null;
        this.isVisible = false;
        this.createModal();
    }

    createModal() {
        // Create backdrop
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'modal-backdrop';

        // Create content container
        this.content = document.createElement('div');
        this.content.className = 'modal-content';

        // Create header
        const header = document.createElement('div');
        header.className = 'modal-header';
        const title = document.createElement('h3');
        title.textContent = 'Confirm Booking';
        header.appendChild(title);

        // Create body
        const body = document.createElement('div');
        body.className = 'modal-body';
        body.innerHTML = '<p>Are you sure you want to book this court?</p>';

        // Create footer
        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = () => this.hide();
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = 'Confirm';
        confirmBtn.onclick = () => {
            this.hide();
            // Here you could emit an event or call a callback
            // For now, just hide
        };
        footer.appendChild(cancelBtn);
        footer.appendChild(confirmBtn);

        // Assemble modal
        this.content.appendChild(header);
        this.content.appendChild(body);
        this.content.appendChild(footer);
        this.backdrop.appendChild(this.content);

        // Close on backdrop click
        this.backdrop.onclick = (e) => {
            if (e.target === this.backdrop) {
                this.hide();
            }
        };

        document.body.appendChild(this.backdrop);
    }

    show() {
        if (!this.isVisible) {
            this.backdrop.style.display = 'flex';
            this.isVisible = true;
        }
    }

    hide() {
        if (this.isVisible) {
            this.backdrop.style.display = 'none';
            this.isVisible = false;
        }
    }

    setContent(headerText, bodyHTML, confirmCallback = null) {
        const title = this.content.querySelector('h3');
        title.textContent = headerText;

        const body = this.content.querySelector('.modal-body');
        body.innerHTML = bodyHTML;

        const confirmBtn = this.content.querySelector('button:last-child');
        if (confirmCallback) {
            confirmBtn.onclick = () => {
                this.hide();
                confirmCallback();
            };
        }
    }
}

// Export for use in other modules
export default Modal;