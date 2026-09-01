class AppNavbar extends HTMLElement {
    connectedCallback() {
        this.render();
        this.initMobileMenu();
        this.setActiveLink();
        this.initCartBadge();
        this.initWishlistBadge();
        this.initAuthState();
    }

    render() {
        const isSubPage = window.location.pathname.includes('/pages/');
        const pathPrefix = isSubPage ? '../' : './';
        const pagePrefix = isSubPage ? '' : 'pages/';

        this.innerHTML = `
            <header>
                <nav class="navbar" aria-label="Main Navigation">
                    <div class="container navbar-container">
                        <!-- Logo -->
                        <a href="${pathPrefix}index.html" class="logo" aria-label="AURA Home">
                            AURA<span class="logo-dot">.</span>
                        </a>

                        <!-- Desktop & Mobile Navigation Links -->
                        <ul class="nav-menu" id="nav-menu" role="menubar">
                            <li role="none">
                                <a href="${pathPrefix}index.html" class="nav-link" role="menuitem" data-page="home">Home</a>
                            </li>
                            <li role="none">
                                <a href="${pathPrefix}${pagePrefix}products.html" class="nav-link" role="menuitem" data-page="shop">Shop</a>
                            </li>
                            <li role="none">
                                <a href="${pathPrefix}index.html#categories" class="nav-link" role="menuitem" data-page="categories">Categories</a>
                            </li>
                            <li role="none">
                                <a href="${pathPrefix}index.html#about" class="nav-link" role="menuitem" data-page="about">About</a>
                            </li>
                        </ul>

                        <!-- Action Controls (Search, Wishlist, Cart, Profile) -->
                        <div class="nav-actions">
                            <!-- Search Icon Button -->
                            <button class="btn-icon btn-responsive-hide" aria-label="Search Catalog" id="search-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>

                            <!-- Wishlist Icon Button -->
                            <a href="${pathPrefix}${pagePrefix}wishlist.html" class="btn-icon" aria-label="View Wishlist" id="wishlist-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                <span class="icon-badge">0</span>
                            </a>

                            <!-- Cart Icon Button -->
                            <a href="${pathPrefix}${pagePrefix}cart.html" class="btn-icon" aria-label="View Shopping Cart" id="cart-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                                </svg>
                                <span class="icon-badge">0</span>
                            </a>

                            <!-- Dynamic Account / User Status Control -->
                            <div id="account-nav-container" style="display: inline-flex; align-items: center;">
                                <a href="${pathPrefix}${pagePrefix}login.html" class="btn-icon" aria-label="My Account" id="account-btn">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </a>
                            </div>

                            <!-- Mobile Menu Hamburger Button -->
                            <button class="burger-menu" id="burger-menu" aria-label="Toggle Navigation Menu" aria-expanded="false" aria-controls="nav-menu">
                                <span class="burger-line"></span>
                                <span class="burger-line"></span>
                                <span class="burger-line"></span>
                            </button>
                        </div>
                    </div>
                </nav>
            </header>
            <!-- Background Overlay for Mobile Menu open state -->
            <div class="overlay" id="nav-overlay"></div>
        `;
    }

    initMobileMenu() {
        const burgerMenu = this.querySelector('#burger-menu');
        const navMenu = this.querySelector('#nav-menu');
        const overlay = this.querySelector('#nav-overlay');
        const navLinks = this.querySelectorAll('.nav-link');

        if (!burgerMenu || !navMenu || !overlay) return;

        const toggleMenu = () => {
            const isOpen = navMenu.classList.contains('open');
            if (isOpen) {
                this.closeMenu(burgerMenu, navMenu, overlay);
            } else {
                this.openMenu(burgerMenu, navMenu, overlay);
            }
        };

        burgerMenu.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', () => this.closeMenu(burgerMenu, navMenu, overlay));

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu(burgerMenu, navMenu, overlay);
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('open')) {
                this.closeMenu(burgerMenu, navMenu, overlay);
                burgerMenu.focus();
            }
        });
    }

    openMenu(burger, menu, overlay) {
        burger.classList.add('open');
        menu.classList.add('open');
        overlay.classList.add('active');
        burger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    closeMenu(burger, menu, overlay) {
        burger.classList.remove('open');
        menu.classList.remove('open');
        overlay.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    setActiveLink() {
        const path = window.location.pathname;
        const pageName = path.split('/').pop() || 'index.html';
        const hash = window.location.hash;

        let currentPage = 'home';

        if (pageName.includes('products.html') || pageName.includes('product.html')) {
            currentPage = 'shop';
        } else if (pageName.includes('cart.html')) {
            currentPage = 'cart';
        } else if (pageName.includes('wishlist.html')) {
            currentPage = 'wishlist';
        } else if (pageName.includes('login.html') || pageName.includes('register.html') || pageName.includes('checkout.html') || pageName.includes('orders.html')) {
            currentPage = 'account';
        } else if (hash.includes('#about')) {
            currentPage = 'about';
        } else if (hash.includes('#categories')) {
            currentPage = 'categories';
        }

        const activeLink = this.querySelector(`.nav-link[data-page="${currentPage}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        window.addEventListener('hashchange', () => {
            const currentHash = window.location.hash;
            this.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

            let newActivePage = currentPage;
            if (currentHash.includes('#about')) {
                newActivePage = 'about';
            } else if (currentHash.includes('#categories')) {
                newActivePage = 'categories';
            } else {
                newActivePage = (pageName.includes('products.html') || pageName.includes('product.html')) ? 'shop' : 'home';
            }

            const newActiveLink = this.querySelector(`.nav-link[data-page="${newActivePage}"]`);
            if (newActiveLink) {
                newActiveLink.classList.add('active');
            }
        });
    }

    initCartBadge() {
        const updateBadge = () => {
            const badge = this.querySelector('#cart-btn .icon-badge');
            if (!badge) return;

            let count = 0;
            if (window.AuraCart && typeof window.AuraCart.getCartItemCount === 'function') {
                count = window.AuraCart.getCartItemCount();
            } else {
                try {
                    const raw = localStorage.getItem('aura_cart');
                    const parsed = raw ? JSON.parse(raw) : [];
                    count = Array.isArray(parsed) ? parsed.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
                } catch (e) {
                    count = 0;
                }
            }
            badge.textContent = count;
        };

        updateBadge();

        window.addEventListener('aura-cart-updated', updateBadge);
        window.addEventListener('storage', (e) => {
            if (e.key === 'aura_cart') updateBadge();
        });
    }

    initWishlistBadge() {
        const updateBadge = () => {
            const badge = this.querySelector('#wishlist-btn .icon-badge');
            if (!badge) return;

            let count = 0;
            if (window.AuraWishlist && typeof window.AuraWishlist.getWishlistCount === 'function') {
                count = window.AuraWishlist.getWishlistCount();
            } else {
                try {
                    const raw = localStorage.getItem('aura_wishlist');
                    const parsed = raw ? JSON.parse(raw) : [];
                    count = Array.isArray(parsed) ? parsed.length : 0;
                } catch (e) {
                    count = 0;
                }
            }
            badge.textContent = count;
        };

        updateBadge();

        window.addEventListener('aura-wishlist-updated', updateBadge);
        window.addEventListener('storage', (e) => {
            if (e.key === 'aura_wishlist') updateBadge();
        });
    }

    initAuthState() {
        const container = this.querySelector('#account-nav-container');
        if (!container) return;

        const isSubPage = window.location.pathname.includes('/pages/');
        const pathPrefix = isSubPage ? '../' : './';
        const pagePrefix = isSubPage ? '' : 'pages/';

        const updateAuthUI = () => {
            let user = null;
            if (window.AuraAuth && typeof window.AuraAuth.getCurrentUser === 'function') {
                user = window.AuraAuth.getCurrentUser();
            } else {
                try {
                    const raw = localStorage.getItem('aura_current_user') || sessionStorage.getItem('aura_current_user');
                    if (raw) user = JSON.parse(raw);
                } catch (e) { user = null; }
            }

            if (user && user.name) {
                const firstName = user.name.split(' ')[0];
                container.innerHTML = `
                    <div style="display: inline-flex; align-items: center; gap: 8px;">
                        <a href="${pathPrefix}${pagePrefix}orders.html" class="user-greeting-link" style="font-size: 0.85rem; font-weight: 600; color: var(--color-primary); text-decoration: none; display: inline-flex; align-items: center; gap: 4px;" title="View My Orders & History">
                            <span>Hi, ${escapeHtml(firstName)}</span>
                        </a>
                        <button id="logout-btn" class="btn btn-sm btn-outline" style="padding: 4px 8px; font-size: 0.75rem; text-transform: uppercase;">Logout</button>
                    </div>
                `;
                const logoutBtn = container.querySelector('#logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => {
                        if (window.AuraAuth) window.AuraAuth.logoutUser();
                        showGlobalToast("Logged out successfully.");
                    });
                }
            } else {
                container.innerHTML = `
                    <a href="${pathPrefix}${pagePrefix}login.html" class="btn-icon" aria-label="My Account" id="account-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </a>
                `;
            }
        };

        updateAuthUI();

        window.addEventListener('aura-auth-updated', updateAuthUI);
        window.addEventListener('storage', (e) => {
            if (e.key === 'aura_current_user') updateAuthUI();
        });
    }
}

function showGlobalToast(message) {
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

customElements.define('app-navbar', AppNavbar);
