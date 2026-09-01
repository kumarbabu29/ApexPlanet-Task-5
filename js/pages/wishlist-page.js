/**
 * AURA E-Commerce — Wishlist Page Controller (Module 6)
 * Renders products saved in localStorage wishlist (aura_wishlist),
 * handles item removal, direct Add to Cart integration, and empty state fallback.
 */

document.addEventListener('DOMContentLoaded', () => {
    initWishlistPage();
});

function initWishlistPage() {
    renderWishlist();

    window.addEventListener('aura-wishlist-updated', () => {
        renderWishlist();
    });
}

function renderWishlist() {
    const emptyContainer = document.getElementById('empty-wishlist-container');
    const contentContainer = document.getElementById('wishlist-content-container');
    const grid = document.getElementById('wishlist-grid');
    const countBadge = document.getElementById('wishlist-count-badge');

    if (!window.AuraWishlist) {
        console.error("[AURA Wishlist] Wishlist service not available.");
        return;
    }

    const ids = window.AuraWishlist.getWishlist();

    if (!ids || ids.length === 0) {
        if (contentContainer) contentContainer.style.display = 'none';
        if (emptyContainer) emptyContainer.style.display = 'block';
        return;
    }

    // Filter valid products from central dataset
    const products = (window.productsData || []).filter(p => ids.includes(p.id));

    // Auto-clean invalid IDs that no longer exist in the product dataset
    const validIds = products.map(p => p.id);
    const hasInvalidIds = validIds.length !== ids.length;
    if (hasInvalidIds) {
        window.AuraWishlist.saveWishlist(validIds);
    }

    if (products.length === 0) {
        if (contentContainer) contentContainer.style.display = 'none';
        if (emptyContainer) emptyContainer.style.display = 'block';
        return;
    }

    if (emptyContainer) emptyContainer.style.display = 'none';
    if (contentContainer) contentContainer.style.display = 'block';
    if (countBadge) countBadge.textContent = `${products.length} item${products.length === 1 ? '' : 's'} saved`;

    if (!grid) return;
    grid.innerHTML = '';
    const fragment = document.createDocumentFragment();

    products.forEach(product => {
        const article = document.createElement('article');
        article.className = 'card product-card';

        article.innerHTML = `
            <div class="product-image-container">
                ${product.badge ? `<span class="badge ${getBadgeClass(product.badge)}">${escapeHtml(product.badge)}</span>` : ''}
                ${product.image ? `
                    <img src="${window.getProductImagePath ? window.getProductImagePath(product.image) : `../assets/images/${product.image}`}" alt="${escapeHtml(product.name)}" class="product-image" style="object-fit: cover; width: 100%; height: 100%;" loading="lazy">
                ` : `
                    <svg viewBox="0 0 100 100" width="100%" height="100%" class="product-image" style="padding: 24px;" aria-hidden="true" loading="lazy">
                        <rect width="100" height="100" fill="#f4efe6" rx="4"/>
                        <circle cx="50" cy="45" r="26" fill="none" stroke="#c5a880" stroke-width="2"/>
                        <text x="50" y="49" font-family="'Outfit', sans-serif" font-weight="700" font-size="9" fill="#121212" text-anchor="middle" letter-spacing="1">${escapeHtml(product.category.toUpperCase())}</text>
                        <line x1="30" y1="72" x2="70" y2="72" stroke="#121212" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                `}
                <div class="product-actions-overlay">
                    <a href="product.html?id=${product.id}" class="btn btn-primary btn-sm btn-full">VIEW PRODUCT</a>
                </div>
            </div>
            <div class="product-details">
                <span class="product-category">${escapeHtml(product.category)} • ${escapeHtml(product.brand)}</span>
                <h3 class="product-title">
                    <a href="product.html?id=${product.id}">${escapeHtml(product.name)}</a>
                </h3>
                <div class="product-rating" aria-label="Rating ${product.rating} out of 5 stars">
                    ★★★★★ <span>${product.rating.toFixed(1)}</span>
                </div>
                <div class="product-price-row">
                    <div class="product-price">
                        ${product.originalPrice ? `<span class="old-price">₹${product.originalPrice.toLocaleString('en-IN')}</span>` : ''}
                        ₹${product.price.toLocaleString('en-IN')}
                    </div>
                </div>
                <div style="display: flex; gap: 8px; margin-top: var(--spacing-sm);">
                    <button type="button" class="btn btn-primary btn-sm btn-full add-to-cart-wishlist-btn">ADD TO CART</button>
                    <button type="button" class="btn btn-danger-outline btn-sm remove-wishlist-btn" aria-label="Remove ${escapeHtml(product.name)} from wishlist">✕</button>
                </div>
            </div>
        `;

        const addToCartBtn = article.querySelector('.add-to-cart-wishlist-btn');
        const removeBtn = article.querySelector('.remove-wishlist-btn');

        addToCartBtn.addEventListener('click', () => {
            if (window.AuraCart) {
                const res = window.AuraCart.addToCart(product.id, 1);
                showToast(res.message || `Added "${product.name}" to cart!`);
            }
        });

        removeBtn.addEventListener('click', () => {
            window.AuraWishlist.removeFromWishlist(product.id);
            showToast(`Removed "${product.name}" from your wishlist.`);
        });

        fragment.appendChild(article);
    });

    grid.appendChild(fragment);
}

function getBadgeClass(badge) {
    switch (badge.toUpperCase()) {
        case 'BEST SELLER':
        case 'HOT':
            return 'badge-hot';
        case 'SALE':
            return 'badge-sale';
        case 'NEW':
            return 'badge-new';
        default:
            return 'badge-outline';
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
