/**
 * AURA E-Commerce — Shopping Cart Page Controller (Module 5)
 * Dynamically renders cart items from localStorage + central dataset,
 * handles quantity updates, item deletion, order summary calculations,
 * shipping threshold indicators, clear cart actions, and empty cart state.
 */

document.addEventListener('DOMContentLoaded', () => {
    initCartPage();
});

function initCartPage() {
    renderCart();

    // Re-render dynamically whenever cart updates
    window.addEventListener('aura-cart-updated', () => {
        renderCart();
    });
}

function renderCart() {
    const emptyContainer = document.getElementById('empty-cart-container');
    const contentContainer = document.getElementById('cart-content-container');
    const itemsList = document.getElementById('cart-items-list');
    const summaryContainer = document.getElementById('order-summary-container');

    if (!window.AuraCart) {
        console.error("[AURA Cart] AuraCart service not loaded.");
        return;
    }

    const calcs = window.AuraCart.getCartCalculations();

    // 1. Handle Empty Cart View
    if (!calcs.items || calcs.items.length === 0) {
        if (contentContainer) contentContainer.style.display = 'none';
        if (emptyContainer) emptyContainer.style.display = 'block';
        return;
    }

    // 2. Render Active Cart View
    if (emptyContainer) emptyContainer.style.display = 'none';
    if (contentContainer) contentContainer.style.display = 'block';

    renderCartItems(itemsList, calcs.items);
    renderOrderSummary(summaryContainer, calcs);
}

/**
 * Renders the table / cards list of items in the cart.
 */
function renderCartItems(container, items) {
    if (!container) return;

    container.innerHTML = '';

    items.forEach(({ product, quantity, itemTotal }) => {
        const itemCard = document.createElement('div');
        itemCard.className = 'cart-item-card';

        const stockLimit = product.stock || 99;

        itemCard.innerHTML = `
            <div class="cart-item-image-wrapper">
                ${product.image ? `
                    <img src="${window.getProductImagePath ? window.getProductImagePath(product.image) : `../assets/images/${product.image}`}" alt="${escapeHtml(product.name)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-sm);" loading="lazy">
                ` : `
                    <svg viewBox="0 0 100 100" width="100%" height="100%" class="product-image" style="padding: 12px;" aria-hidden="true">
                        <rect width="100" height="100" fill="#f4efe6" rx="6"/>
                        <circle cx="50" cy="45" r="26" fill="none" stroke="#c5a880" stroke-width="2"/>
                        <text x="50" y="49" font-family="'Outfit', sans-serif" font-weight="700" font-size="9" fill="#121212" text-anchor="middle">${escapeHtml(product.category.toUpperCase())}</text>
                        <line x1="30" y1="72" x2="70" y2="72" stroke="#121212" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                `}
            </div>

            <div class="cart-item-info">
                <span class="cart-item-category">${escapeHtml(product.category)} • ${escapeHtml(product.brand)}</span>
                <h3 class="cart-item-title">
                    <a href="product.html?id=${product.id}">${escapeHtml(product.name)}</a>
                </h3>
                <div class="cart-item-price-unit">
                    ₹${product.price.toLocaleString('en-IN')} each
                    ${product.originalPrice ? `<span class="old-price" style="margin-left: 6px;">₹${product.originalPrice.toLocaleString('en-IN')}</span>` : ''}
                </div>
            </div>

            <div class="cart-item-qty-cell">
                <div class="quantity-control">
                    <button type="button" class="qty-btn qty-minus" aria-label="Decrease quantity for ${escapeHtml(product.name)}">-</button>
                    <input type="number" class="qty-val qty-input" value="${quantity}" min="1" max="${stockLimit}" aria-label="Quantity for ${escapeHtml(product.name)}">
                    <button type="button" class="qty-btn qty-plus" aria-label="Increase quantity for ${escapeHtml(product.name)}">+</button>
                </div>
            </div>

            <div class="cart-item-total-cell">
                <span class="cart-item-total-val">₹${itemTotal.toLocaleString('en-IN')}</span>
                <button type="button" class="btn-remove-item" aria-label="Remove ${escapeHtml(product.name)} from cart">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    <span>Remove</span>
                </button>
            </div>
        `;

        // Event Listeners
        const minusBtn = itemCard.querySelector('.qty-minus');
        const plusBtn = itemCard.querySelector('.qty-plus');
        const qtyInput = itemCard.querySelector('.qty-input');
        const removeBtn = itemCard.querySelector('.btn-remove-item');

        minusBtn.addEventListener('click', () => {
            if (quantity > 1) {
                window.AuraCart.updateCartQuantity(product.id, quantity - 1);
            }
        });

        plusBtn.addEventListener('click', () => {
            if (quantity < stockLimit) {
                window.AuraCart.updateCartQuantity(product.id, quantity + 1);
            } else {
                showToast(`Maximum available stock is ${stockLimit}`);
            }
        });

        qtyInput.addEventListener('change', () => {
            let val = parseInt(qtyInput.value, 10);
            if (isNaN(val) || val < 1) val = 1;
            if (val > stockLimit) val = stockLimit;
            window.AuraCart.updateCartQuantity(product.id, val);
        });

        removeBtn.addEventListener('click', () => {
            window.AuraCart.removeFromCart(product.id);
            showToast(`Removed "${product.name}" from your cart.`);
        });

        container.appendChild(itemCard);
    });
}

/**
 * Renders Order Summary sidebar (subtotal, shipping, savings, final total, CTAs).
 */
function renderOrderSummary(container, calcs) {
    if (!container) return;

    const remainingForFreeShipping = calcs.freeShippingThreshold - calcs.subtotal;

    container.innerHTML = `
        <div class="summary-card">
            <h2 class="summary-title">Order Summary</h2>

            <!-- Free Shipping Progress Tip -->
            ${remainingForFreeShipping > 0 ? `
                <div class="shipping-tip-box">
                    <span>Add <strong>₹${remainingForFreeShipping.toLocaleString('en-IN')}</strong> more to get <strong>FREE Shipping</strong>!</span>
                    <div class="shipping-progress-bar">
                        <div class="shipping-progress-fill" style="width: ${Math.min(100, (calcs.subtotal / calcs.freeShippingThreshold) * 100)}%;"></div>
                    </div>
                </div>
            ` : `
                <div class="shipping-tip-box success">
                    <span>🎉 You've unlocked <strong>FREE Standard Shipping</strong>!</span>
                </div>
            `}

            <div class="summary-row">
                <span>Subtotal (${calcs.itemCount} items)</span>
                <span class="summary-val">₹${calcs.subtotal.toLocaleString('en-IN')}</span>
            </div>

            ${calcs.totalSavings > 0 ? `
                <div class="summary-row discount-row" style="color: #16a34a;">
                    <span>Total Discount Savings</span>
                    <span class="summary-val">- ₹${calcs.totalSavings.toLocaleString('en-IN')}</span>
                </div>
            ` : ''}

            <div class="summary-row">
                <span>Shipping Fee</span>
                <span class="summary-val">${calcs.shipping === 0 ? '<strong style="color: #16a34a;">FREE</strong>' : '₹' + calcs.shipping}</span>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-row total-row">
                <span>Estimated Total</span>
                <span class="summary-total-val">₹${calcs.finalTotal.toLocaleString('en-IN')}</span>
            </div>

            <a href="checkout.html" class="btn btn-primary btn-lg btn-full" style="margin-top: var(--spacing-md);">PROCEED TO CHECKOUT</a>

            <div style="display: flex; gap: var(--spacing-xs); margin-top: var(--spacing-sm);">
                <a href="products.html" class="btn btn-outline btn-full" style="font-size: 0.85rem;">CONTINUE SHOPPING</a>
                <button type="button" id="clear-cart-btn" class="btn btn-danger-outline btn-full" style="font-size: 0.85rem;">CLEAR CART</button>
            </div>
        </div>
    `;

    // Clear Cart listener
    const clearBtn = container.querySelector('#clear-cart-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to clear your entire shopping cart?")) {
                window.AuraCart.clearCart();
                showToast("Your cart has been cleared.");
            }
        });
    }
}

function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-notification show';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
