// Improved Header Loader with Error Handling and Optimized Scroll Behavior

class HeaderLoader {
    constructor(headerElement) {
        this.headerElement = headerElement;
        this.lastScrollY = window.scrollY;
        this.init();
    }

    init() {
        window.addEventListener('scroll', this.onScroll.bind(this));
    }

    onScroll() {
        try {
            const currentScrollY = window.scrollY;
            if (currentScrollY > this.lastScrollY) {
                this.hideHeader();
            } else {
                this.showHeader();
            }
            this.lastScrollY = currentScrollY;
        } catch (error) {
            console.error('Error in onScroll:', error);
        }
    }

    hideHeader() {
        this.headerElement.style.transform = 'translateY(-100%)';
    }

    showHeader() {
        this.headerElement.style.transform = 'translateY(0)';
    }
}

// Usage:
const header = document.querySelector('header');
const headerLoader = new HeaderLoader(header);