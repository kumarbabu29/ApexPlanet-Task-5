/**
 * AURA E-Commerce — Home Page Logic (Module 2)
 * Handles newsletter subscription validation and UI button feedback.
 */

document.addEventListener('DOMContentLoaded', () => {
    initNewsletterValidation();
    initAddToCartFeedback();
});

/**
 * Validates the home page newsletter subscription form on the client side.
 */
function initNewsletterValidation() {
    const form = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('newsletter-email');
    const feedbackContainer = document.getElementById('newsletter-feedback');

    if (!form || !emailInput || !feedbackContainer) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const emailValue = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailValue || !emailRegex.test(emailValue)) {
            showFeedback(feedbackContainer, 'Please enter a valid email address.', 'danger');
            emailInput.focus();
        } else {
            showFeedback(feedbackContainer, 'Thanks for subscribing! Check your inbox for your welcome discount.', 'success');
            emailInput.value = '';
        }
    });
}

/**
 * Helper to display alert messages inside the feedback container.
 */
function showFeedback(container, message, type) {
    container.innerHTML = `
        <div class="alert alert-${type} mt-2" role="alert" style="margin-bottom: 0; padding: 0.75rem 1rem; font-size: 0.9rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                ${type === 'success'
            ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
            : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
        }
            </svg>
            <span>${message}</span>
        </div>
    `;
}

/**
 * Displays a non-intrusive notification toast when clicking "Add to Cart" placeholder buttons.
 */
function initAddToCartFeedback() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.js-add-to-cart');
        if (btn) {
            e.preventDefault();
            const productId = parseInt(btn.getAttribute('data-product-id'), 10) || 1;
            if (window.AuraCart && typeof window.AuraCart.addToCart === 'function') {
                const res = window.AuraCart.addToCart(productId, 1);
                showToast(res.message || 'Added product to your cart!');
            } else {
                showToast('Added product to your cart!');
            }
        }
    });
}

/**
 * Renders a floating notification toast.
 */
function showToast(message) {
    let toast = document.getElementById('ui-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'ui-toast';
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
