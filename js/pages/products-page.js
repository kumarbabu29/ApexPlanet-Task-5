/**
 * AURA E-Commerce — Product Catalog Page Controller (Module 3)
 * Manages dataset filtering, dynamic search, price sliders, rating selections,
 * sorting, responsive filter drawer toggling, and URL query parameter parsing.
 */

document.addEventListener('DOMContentLoaded', () => {
    initCatalogPage();
});

function initCatalogPage() {
    if (!window.productsData || !Array.isArray(window.productsData)) {
        console.error("Products dataset not loaded.");
        return;
    }

    // Determine highest price in dataset for dynamic range slider maximum
    const maxDatasetPrice = Math.max(...window.productsData.map(p => p.price));

    // Catalog State Object
    const catalogState = {
        search: "",
        category: "All",
        maxPrice: maxDatasetPrice,
        minRating: 0,
        sort: "featured"
    };

    // UI Elements
    const searchInput = document.getElementById('search-input');
    const priceSlider = document.getElementById('price-slider');
    const priceOutput = document.getElementById('price-output');
    const categoryInputs = document.querySelectorAll('input[name="filter-category"]');
    const ratingInputs = document.querySelectorAll('input[name="filter-rating"]');
    const sortSelect = document.getElementById('sort-select');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const emptyStateClearBtn = document.getElementById('empty-state-clear-btn');
    const mobileFilterToggle = document.getElementById('mobile-filter-toggle');
    const filterSidebar = document.getElementById('filter-sidebar');
    const productsGrid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');
    const productCountText = document.getElementById('product-count-display');

    // Set initial maximum price on slider
    if (priceSlider && priceOutput) {
        priceSlider.max = maxDatasetPrice;
        priceSlider.value = maxDatasetPrice;
        priceOutput.textContent = `₹${maxDatasetPrice.toLocaleString('en-IN')}`;
    }

    // 1. URL Query Parameter Support (e.g. products.html?category=Shoes or products.html?search=watch)
    parseUrlParameters(catalogState, categoryInputs, searchInput);

    // Initial Render
    renderCatalog(catalogState, productsGrid, emptyState, productCountText);

    // 2. Search Input Listener (Debounced)
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                catalogState.search = e.target.value.trim();
                renderCatalog(catalogState, productsGrid, emptyState, productCountText);
            }, 250);
        });
    }

    // 3. Category Filter Listener
    categoryInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            catalogState.category = e.target.value;
            renderCatalog(catalogState, productsGrid, emptyState, productCountText);
        });
    });

    // 4. Price Slider Listener
    if (priceSlider && priceOutput) {
        priceSlider.addEventListener('input', (e) => {
            const val = Number(e.target.value);
            catalogState.maxPrice = val;
            priceOutput.textContent = `₹${val.toLocaleString('en-IN')}`;
            renderCatalog(catalogState, productsGrid, emptyState, productCountText);
        });
    }

    // 5. Rating Filter Listener
    ratingInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            catalogState.minRating = Number(e.target.value);
            renderCatalog(catalogState, productsGrid, emptyState, productCountText);
        });
    });

    // 6. Sort Selector Listener
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            catalogState.sort = e.target.value;
            renderCatalog(catalogState, productsGrid, emptyState, productCountText);
        });
    }

    // 7. Clear Filters Actions
    const handleClearFilters = () => {
        catalogState.search = "";
        catalogState.category = "All";
        catalogState.maxPrice = maxDatasetPrice;
        catalogState.minRating = 0;
        catalogState.sort = "featured";

        // Reset UI Controls
        if (searchInput) searchInput.value = "";
        if (priceSlider) priceSlider.value = maxDatasetPrice;
        if (priceOutput) priceOutput.textContent = `₹${maxDatasetPrice.toLocaleString('en-IN')}`;
        if (sortSelect) sortSelect.value = "featured";

        categoryInputs.forEach(input => {
            input.checked = (input.value === "All");
        });

        ratingInputs.forEach(input => {
            input.checked = (Number(input.value) === 0);
        });

        renderCatalog(catalogState, productsGrid, emptyState, productCountText);
    };

    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', handleClearFilters);
    if (emptyStateClearBtn) emptyStateClearBtn.addEventListener('click', handleClearFilters);

    // 8. Mobile Filter Toggle Listener
    if (mobileFilterToggle && filterSidebar) {
        mobileFilterToggle.addEventListener('click', () => {
            filterSidebar.classList.toggle('open');
            const isOpen = filterSidebar.classList.contains('open');
            mobileFilterToggle.setAttribute('aria-expanded', isOpen);
            mobileFilterToggle.textContent = isOpen ? 'HIDE FILTERS' : 'FILTERS';
        });
    }
}

/**
 * Parses URL query parameters to seed state.
 */
function parseUrlParameters(state, categoryInputs, searchInput) {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category');
    const searchParam = params.get('search');

    if (categoryParam) {
        const categories = ["All", "Fashion", "Electronics", "Shoes", "Accessories", "Beauty", "Home & Living"];
        const matched = categories.find(c => c.toLowerCase() === categoryParam.toLowerCase());
        if (matched) {
            state.category = matched;
            categoryInputs.forEach(input => {
                input.checked = (input.value.toLowerCase() === matched.toLowerCase());
            });
        }
    }

    if (searchParam) {
        state.search = searchParam;
        if (searchInput) searchInput.value = searchParam;
    }
}

/**
 * Core Filter & Sort Pipeline
 */
function getFilteredAndSortedProducts(state) {
    let filtered = window.productsData.filter(product => {
        // Search Filter (Matches Name, Category, or Brand)
        if (state.search) {
            const query = state.search.toLowerCase();
            const nameMatch = product.name.toLowerCase().includes(query);
            const catMatch = product.category.toLowerCase().includes(query);
            const brandMatch = product.brand ? product.brand.toLowerCase().includes(query) : false;
            if (!nameMatch && !catMatch && !brandMatch) return false;
        }

        // Category Filter
        if (state.category !== "All") {
            if (product.category.toLowerCase() !== state.category.toLowerCase()) return false;
        }

        // Price Filter
        if (product.price > state.maxPrice) return false;

        // Rating Filter
        if (product.rating < state.minRating) return false;

        return true;
    });

    // Sorting Pipeline
    switch (state.sort) {
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'rating-high':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
            filtered.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            break;
        case 'featured':
        default:
            filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
            break;
    }

    return filtered;
}

/**
 * Renders the products grid or empty state container.
 */
function renderCatalog(state, productsGrid, emptyState, productCountText) {
    if (!productsGrid) return;

    const filteredProducts = getFilteredAndSortedProducts(state);

    // Update Product Count Badge
    if (productCountText) {
        productCountText.textContent = `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} found`;
    }

    // Handle Empty Search/Filter State
    if (filteredProducts.length === 0) {
        productsGrid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    // Display Products Grid
    productsGrid.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    // Clear previous items
    productsGrid.innerHTML = '';

    // Render Product Cards
    const fragment = document.createDocumentFragment();

    filteredProducts.forEach(product => {
        const article = document.createElement('article');
        article.className = 'card product-card';

        const discountPercent = product.originalPrice
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0;

        article.innerHTML = `
            <div class="product-image-container">
                ${product.badge
                ? `<span class="badge ${getBadgeClass(product.badge)} product-badge">${product.badge}</span>`
                : (discountPercent > 0 ? `<span class="badge badge-sale product-badge">${discountPercent}% OFF</span>` : '')
            }
                ${renderProductVectorGraphic(product)}
                <div class="product-actions-overlay">
                    <a href="product.html?id=${product.id}" class="btn btn-primary btn-sm btn-full" aria-label="View details for ${escapeHtml(product.name)}">VIEW PRODUCT</a>
                </div>
            </div>
            <div class="product-details">
                <span class="product-category">${escapeHtml(product.category)} • ${escapeHtml(product.brand)}</span>
                <h3 class="product-title">
                    <a href="product.html?id=${product.id}">${escapeHtml(product.name)}</a>
                </h3>
                <div class="product-rating" aria-label="Rating ${product.rating} out of 5 stars">
                    ★★★★★ <span>${product.rating.toFixed(1)} (${product.reviews})</span>
                </div>
                <div class="product-price-row">
                    <div class="product-price">
                        ${product.originalPrice ? `<span class="old-price">₹${product.originalPrice.toLocaleString('en-IN')}</span>` : ''}
                        ₹${product.price.toLocaleString('en-IN')}
                    </div>
                </div>
            </div>
        `;

        fragment.appendChild(article);
    });

    productsGrid.appendChild(fragment);
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

/**
 * Generates responsive, self-contained SVG graphics for product cards.
 */
function renderProductVectorGraphic(product) {
    if (product.image) {
        const imageSrc = window.getProductImagePath ? window.getProductImagePath(product.image) : `../assets/images/${product.image}`;
        return `<img src="${imageSrc}" alt="${escapeHtml(product.name)}" class="product-image" style="object-fit: cover; width: 100%; height: 100%;" loading="lazy">`;
    }
    return `
        <svg viewBox="0 0 100 100" width="100%" height="100%" class="product-image" style="padding: 24px;" aria-hidden="true" loading="lazy">
            <rect width="100" height="100" fill="#f4efe6" rx="4"/>
            <circle cx="50" cy="45" r="26" fill="none" stroke="#c5a880" stroke-width="2"/>
            <text x="50" y="49" font-family="'Outfit', sans-serif" font-weight="700" font-size="9" fill="#121212" text-anchor="middle" letter-spacing="1">${escapeHtml(product.category.toUpperCase())}</text>
            <line x1="30" y1="72" x2="70" y2="72" stroke="#121212" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
