/**
 * AURA E-Commerce - Main Application Logic
 * Module 1: Project Foundation & UI System
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize global UI handlers
    initNavbarScrollEffect();
    initAlertDismissal();
    initSmoothScrolling();
});

/**
 * Resolves local image asset path based on whether current page is in root or pages/ subfolder.
 */
window.getProductImagePath = function (imageName) {
    if (!imageName) return '';
    const isSubfolder = window.location.pathname.includes('/pages/');
    const basePath = isSubfolder ? '../assets/images/' : 'assets/images/';
    return basePath + imageName;
};

/**
 * Adds a shadow/size transition effect to the navbar when the user scrolls
 */
function initNavbarScrollEffect() {
    const navbarElement = document.querySelector('app-navbar');

    if (!navbarElement) return;

    // Check on initial load
    handleScroll(navbarElement);

    // Bind to scroll event
    window.addEventListener('scroll', () => {
        handleScroll(navbarElement);
    }, { passive: true });
}

function handleScroll(navbarElement) {
    const navbar = navbarElement.querySelector('.navbar');
    if (!navbar) return;

    if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

/**
 * Setup dismissal handlers for custom alert elements
 */
function initAlertDismissal() {
    document.addEventListener('click', (e) => {
        const dismissBtn = e.target.closest('.alert-dismiss');
        if (dismissBtn) {
            const alert = dismissBtn.closest('.alert');
            if (alert) {
                alert.style.opacity = '0';
                alert.style.transition = 'opacity 0.2s ease';
                setTimeout(() => alert.remove(), 200);
            }
        }
    });
}

/**
 * Handle smooth scrolling for anchor links to targets on the same page
 */
function initSmoothScrolling() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Only handle internal relative links containing a hash (e.g. "index.html#categories")
        if (href.includes('#') && (href.startsWith('#') || href.includes(window.location.pathname.split('/').pop() || 'index.html'))) {
            const hash = href.substring(href.indexOf('#'));
            const targetElement = document.querySelector(hash);

            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update history hash
                history.pushState(null, null, hash);
            }
        }
    });
}
