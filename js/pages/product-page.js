/**
 * AURA E-Commerce — Product Details Page Controller (Module 4)
 * Handles URL parameter parsing, invalid product fallback UI, dynamic breadcrumb,
 * image gallery thumbnail switching, color/size variant selection, quantity counters,
 * temporary CTA toast feedback, and related product recommendations.
 */

document.addEventListener('DOMContentLoaded', () => {
    initProductDetailsPage();
});

function initProductDetailsPage() {
    const detailsContainer = document.getElementById('product-details-container');
    const invalidContainer = document.getElementById('invalid-product-container');

    if (!window.productsData || !Array.isArray(window.productsData)) {
        showInvalidState(detailsContainer, invalidContainer, "Product catalog data not available.");
        return;
    }

    // 1. Read Product ID from URL parameters
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');

    if (!idParam) {
        showInvalidState(detailsContainer, invalidContainer, "No product ID was provided.");
        return;
    }

    const productId = Number(idParam);
    if (isNaN(productId) || productId <= 0) {
        showInvalidState(detailsContainer, invalidContainer, "The product ID format is invalid.");
        return;
    }

    // 2. Locate matching product in dataset
    const product = window.productsData.find(p => p.id === productId);

    if (!product) {
        showInvalidState(detailsContainer, invalidContainer, "We could not find the product you are looking for.");
        return;
    }

    // 3. Valid Product found -> Render details page
    if (invalidContainer) invalidContainer.style.display = 'none';
    if (detailsContainer) detailsContainer.style.display = 'block';

    renderBreadcrumbs(product);
    renderGallery(product);
    renderProductInfo(product);
    renderVariants(product);
    initQuantityControls(product);
    initActionButtons(product);
    renderAdditionalInfo(product);
    renderRelatedProducts(product);
}

/**
 * Handles invalid or missing product IDs gracefully.
 */
function showInvalidState(detailsContainer, invalidContainer, message) {
    if (detailsContainer) detailsContainer.style.display = 'none';
    if (invalidContainer) {
        invalidContainer.style.display = 'block';
        const msgElement = invalidContainer.querySelector('.invalid-message');
        if (msgElement && message) {
            msgElement.textContent = message;
        }
    }
}

/**
 * Generates dynamic breadcrumb navigation.
 */
function renderBreadcrumbs(product) {
    const breadcrumbContainer = document.getElementById('product-breadcrumb');
    if (!breadcrumbContainer) return;

    breadcrumbContainer.innerHTML = `
        <a href="../index.html" style="color: var(--color-text-muted);">Home</a>
        <span style="margin-inline: 4px;">/</span>
        <a href="products.html" style="color: var(--color-text-muted);">Shop</a>
        <span style="margin-inline: 4px;">/</span>
        <a href="products.html?category=${encodeURIComponent(product.category)}" style="color: var(--color-text-muted);">${escapeHtml(product.category)}</a>
        <span style="margin-inline: 4px;">/</span>
        <span style="color: var(--color-primary); font-weight: 500;">${escapeHtml(product.name)}</span>
    `;
}

/**
 * Renders gallery main frame and thumbnail switcher.
 */
function renderGallery(product) {
    const mainFrame = document.getElementById('gallery-main-frame');
    const thumbnailsRow = document.getElementById('gallery-thumbnails-row');

    if (!mainFrame) return;

    // Define 3 gallery color themes for thumbnail switching simulation
    const galleryThemes = [
        { accent: '#c5a880', bg: '#f4efe6', label: 'Primary View' },
        { accent: '#121212', bg: '#e8e6df', label: 'Angle View' },
        { accent: '#4a5568', bg: '#f0ede6', label: 'Detail View' }
    ];

    let currentThemeIndex = 0;

    const updateMainImage = (theme) => {
        if (product.image) {
            const imageSrc = window.getProductImagePath ? window.getProductImagePath(product.image) : `../assets/images/${product.image}`;
            mainFrame.innerHTML = `
                ${product.badge ? `<span class="badge ${getBadgeClass(product.badge)}" style="position: absolute; top: 16px; left: 16px; z-index: 2;">${escapeHtml(product.badge)}</span>` : ''}
                <img src="${imageSrc}" alt="${escapeHtml(product.name)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-md);" loading="lazy">
            `;
            return;
        }
        mainFrame.innerHTML = `
            ${product.badge ? `<span class="badge ${getBadgeClass(product.badge)}" style="position: absolute; top: 16px; left: 16px; z-index: 2;">${escapeHtml(product.badge)}</span>` : ''}
            <svg viewBox="0 0 100 100" width="100%" height="100%" class="product-image" style="padding: 36px;" aria-label="${escapeHtml(product.name)} ${theme.label}">
                <rect width="100" height="100" fill="${theme.bg}" rx="8"/>
                <circle cx="50" cy="45" r="28" fill="none" stroke="${theme.accent}" stroke-width="2.5"/>
                <text x="50" y="49" font-family="'Outfit', sans-serif" font-weight="700" font-size="9" fill="#121212" text-anchor="middle" letter-spacing="1">${escapeHtml(product.category.toUpperCase())}</text>
                <line x1="28" y1="72" x2="72" y2="72" stroke="#121212" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
        `;
    };

    // Initial Main Image
    updateMainImage(galleryThemes[0]);

    // Render Thumbnails
    if (thumbnailsRow) {
        thumbnailsRow.innerHTML = '';
        galleryThemes.forEach((theme, index) => {
            const btn = document.createElement('button');
            btn.className = `thumb-btn ${index === 0 ? 'active' : ''}`;
            btn.setAttribute('aria-label', `View ${theme.label}`);
            btn.innerHTML = `
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <rect width="100" height="100" fill="${theme.bg}" rx="4"/>
                    <circle cx="50" cy="50" r="24" fill="none" stroke="${theme.accent}" stroke-width="3"/>
                </svg>
            `;

            btn.addEventListener('click', () => {
                thumbnailsRow.querySelectorAll('.thumb-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateMainImage(theme);
            });

            thumbnailsRow.appendChild(btn);
        });
    }
}

/**
 * Renders product title, ratings, pricing, discount calculations, and description.
 */
function renderProductInfo(product) {
    document.title = `${product.name} | AURA`;

    const categoryElem = document.getElementById('product-category-text');
    const titleElem = document.getElementById('product-title-text');
    const ratingElem = document.getElementById('product-rating-box');
    const priceElem = document.getElementById('product-price-box');
    const descElem = document.getElementById('product-description-text');

    if (categoryElem) categoryElem.textContent = `${product.category} • ${product.brand}`;
    if (titleElem) titleElem.textContent = product.name;

    if (ratingElem) {
        ratingElem.setAttribute('aria-label', `Rating ${product.rating} out of 5 stars based on ${product.reviews} reviews`);
        ratingElem.innerHTML = `
            <span style="color: #f59e0b; font-size: 1.1rem; letter-spacing: 2px;">★★★★★</span>
            <span style="font-weight: 600; color: var(--color-primary); margin-left: 6px;">${product.rating.toFixed(1)}</span>
            <span style="color: var(--color-text-muted); font-size: 0.9rem; margin-left: 4px;">(${product.reviews} customer reviews)</span>
        `;
    }

    if (priceElem) {
        const discountPercent = product.originalPrice
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0;

        priceElem.innerHTML = `
            <div style="display: flex; align-items: baseline; gap: var(--spacing-sm); flex-wrap: wrap;">
                <span style="font-size: 1.85rem; font-weight: 700; color: var(--color-primary);">₹${product.price.toLocaleString('en-IN')}</span>
                ${product.originalPrice ? `<span class="old-price" style="font-size: 1.2rem;">₹${product.originalPrice.toLocaleString('en-IN')}</span>` : ''}
                ${discountPercent > 0 ? `<span class="badge badge-sale" style="font-size: 0.85rem;">SAVE ${discountPercent}%</span>` : ''}
            </div>
        `;
    }

    if (descElem) descElem.textContent = product.description;
}

/**
 * Renders color and size variant chips if defined in product data.
 */
function renderVariants(product) {
    const variantsContainer = document.getElementById('product-variants-container');
    if (!variantsContainer) return;

    variantsContainer.innerHTML = '';

    // Render Color Options if present
    if (product.colors && product.colors.length > 0) {
        const colorSection = document.createElement('div');
        colorSection.className = 'variant-section';
        colorSection.innerHTML = `<span class="variant-label">Select Color</span>`;

        const group = document.createElement('div');
        group.className = 'color-options-group';
        group.setAttribute('role', 'radiogroup');
        group.setAttribute('aria-label', 'Color variants');

        product.colors.forEach((hex, idx) => {
            const chip = document.createElement('button');
            chip.className = `color-chip ${idx === 0 ? 'active' : ''}`;
            chip.style.backgroundColor = hex;
            chip.setAttribute('aria-label', `Color option ${idx + 1}`);

            chip.addEventListener('click', () => {
                group.querySelectorAll('.color-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            });

            group.appendChild(chip);
        });

        colorSection.appendChild(group);
        variantsContainer.appendChild(colorSection);
    }

    // Render Size Options if present
    if (product.sizes && product.sizes.length > 0) {
        const sizeSection = document.createElement('div');
        sizeSection.className = 'variant-section';
        sizeSection.innerHTML = `<span class="variant-label">Select Size</span>`;

        const group = document.createElement('div');
        group.className = 'size-options-group';
        group.setAttribute('role', 'radiogroup');
        group.setAttribute('aria-label', 'Size variants');

        product.sizes.forEach((sz, idx) => {
            const btn = document.createElement('button');
            btn.className = `size-btn ${idx === 0 ? 'active' : ''}`;
            btn.textContent = sz;

            btn.addEventListener('click', () => {
                group.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });

            group.appendChild(btn);
        });

        sizeSection.appendChild(group);
        variantsContainer.appendChild(sizeSection);
    }
}

/**
 * Initializes Quantity Counter UI controls.
 */
function initQuantityControls(product) {
    const qtyInput = document.getElementById('qty-input');
    const minusBtn = document.getElementById('qty-minus-btn');
    const plusBtn = document.getElementById('qty-plus-btn');

    if (!qtyInput) return;

    const maxStock = product.stock || 10;

    if (minusBtn) {
        minusBtn.addEventListener('click', () => {
            let val = parseInt(qtyInput.value, 10) || 1;
            if (val > 1) {
                qtyInput.value = val - 1;
            }
        });
    }

    if (plusBtn) {
        plusBtn.addEventListener('click', () => {
            let val = parseInt(qtyInput.value, 10) || 1;
            if (val < maxStock) {
                qtyInput.value = val + 1;
            } else {
                showToast(`Maximum available stock is ${maxStock}`);
            }
        });
    }

    qtyInput.addEventListener('change', () => {
        let val = parseInt(qtyInput.value, 10);
        if (isNaN(val) || val < 1) qtyInput.value = 1;
        if (val > maxStock) qtyInput.value = maxStock;
    });
}

/**
 * Initializes CTA Buttons (Add to Cart, Buy Now, Wishlist) with Module 4 temporary feedback.
 */
function initActionButtons(product) {
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const buyNowBtn = document.getElementById('buy-now-btn');
    const wishlistBtn = document.getElementById('wishlist-btn');

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const qtyInput = document.getElementById('qty-input');
            const qty = parseInt(qtyInput ? qtyInput.value : '1', 10) || 1;

            if (window.AuraCart && typeof window.AuraCart.addToCart === 'function') {
                const res = window.AuraCart.addToCart(product.id, qty);
                showToast(res.message || `Added ${qty} × "${product.name}" to cart!`);
            } else {
                showToast(`Added ${qty} × "${product.name}" to cart!`);
            }
        });
    }

    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', () => {
            const qtyInput = document.getElementById('qty-input');
            const qty = parseInt(qtyInput ? qtyInput.value : '1', 10) || 1;
            if (window.AuraCart && typeof window.AuraCart.addToCart === 'function') {
                window.AuraCart.addToCart(product.id, qty);
            }
            window.location.href = 'checkout.html';
        });
    }

    if (wishlistBtn) {
        const updateWishlistBtnUI = () => {
            const inWishlist = window.AuraWishlist ? window.AuraWishlist.isInWishlist(product.id) : false;
            if (inWishlist) {
                wishlistBtn.classList.add('active');
                wishlistBtn.innerHTML = `♥ IN WISHLIST`;
            } else {
                wishlistBtn.classList.remove('active');
                wishlistBtn.innerHTML = `♡ ADD TO WISHLIST`;
            }
        };

        updateWishlistBtnUI();

        wishlistBtn.addEventListener('click', () => {
            if (window.AuraWishlist && typeof window.AuraWishlist.toggleWishlist === 'function') {
                const added = window.AuraWishlist.toggleWishlist(product.id);
                updateWishlistBtnUI();
                showToast(added ? `Added "${product.name}" to your wishlist!` : `Removed "${product.name}" from your wishlist.`);
            }
        });
    }
}

/**
 * Renders availability, shipping, and returns info table.
 */
function renderAdditionalInfo(product) {
    const stockBadge = document.getElementById('product-stock-status');
    if (stockBadge) {
        stockBadge.innerHTML = `
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #22c55e; margin-right: 6px;"></span>
            <strong style="color: var(--color-primary);">In Stock</strong> (${product.stock || 15} units available)
        `;
    }
}

/**
 * Renders 4 related products from the same category.
 */
function renderRelatedProducts(product) {
    const grid = document.getElementById('related-products-grid');
    if (!grid) return;

    // Filter products from same category excluding current product
    let related = window.productsData.filter(p => p.category === product.category && p.id !== product.id);

    // If fewer than 4 match, fill with other products
    if (related.length < 4) {
        const others = window.productsData.filter(p => p.id !== product.id && !related.includes(p));
        related = related.concat(others.slice(0, 4 - related.length));
    } else {
        related = related.slice(0, 4);
    }

    grid.innerHTML = '';
    const fragment = document.createDocumentFragment();

    related.forEach(item => {
        const article = document.createElement('article');
        article.className = 'card product-card';

        article.innerHTML = `
            <div class="product-image-container">
                <svg viewBox="0 0 100 100" width="100%" height="100%" class="product-image" style="padding: 24px;" aria-hidden="true" loading="lazy">
                    <rect width="100" height="100" fill="#f4efe6" rx="4"/>
                    <circle cx="50" cy="45" r="26" fill="none" stroke="#c5a880" stroke-width="2"/>
                    <text x="50" y="49" font-family="'Outfit', sans-serif" font-weight="700" font-size="9" fill="#121212" text-anchor="middle" letter-spacing="1">${escapeHtml(item.category.toUpperCase())}</text>
                    <line x1="30" y1="72" x2="70" y2="72" stroke="#121212" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <div class="product-actions-overlay">
                    <a href="product.html?id=${item.id}" class="btn btn-primary btn-sm btn-full">VIEW PRODUCT</a>
                </div>
            </div>
            <div class="product-details">
                <span class="product-category">${escapeHtml(item.category)}</span>
                <h3 class="product-title">
                    <a href="product.html?id=${item.id}">${escapeHtml(item.name)}</a>
                </h3>
                <div class="product-rating" aria-label="Rating ${item.rating} out of 5 stars">
                    ★★★★★ <span>${item.rating.toFixed(1)}</span>
                </div>
                <div class="product-price-row">
                    <div class="product-price">
                        ${item.originalPrice ? `<span class="old-price">₹${item.originalPrice.toLocaleString('en-IN')}</span>` : ''}
                        ₹${item.price.toLocaleString('en-IN')}
                    </div>
                </div>
            </div>
        `;

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
