class AppFooter extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        const isSubPage = window.location.pathname.includes('/pages/');
        const pathPrefix = isSubPage ? '../' : './';
        const pagePrefix = isSubPage ? '' : 'pages/';

        this.innerHTML = `
            <footer class="footer">
                <div class="container footer-grid">
                    <!-- Column 1: Store info -->
                    <div class="footer-column">
                        <a href="${pathPrefix}index.html" class="logo footer-logo" aria-label="AURA Home">
                            AURA<span class="logo-dot" style="color: var(--color-secondary);">.</span>
                        </a>
                        <p class="footer-desc">
                            Crafting premium aesthetics with high-quality materials. Experience modern living with curated design pieces that enrich your everyday spaces.
                        </p>
                        <div class="social-links">
                            <a href="#" class="social-icon" aria-label="Facebook">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                </svg>
                            </a>
                            <a href="#" class="social-icon" aria-label="Instagram">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            </a>
                            <a href="#" class="social-icon" aria-label="Twitter">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                                </svg>
                            </a>
                            <a href="#" class="social-icon" aria-label="Pinterest">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="12" y1="1" x2="12" y2="23"></line>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <!-- Column 2: Shop navigation -->
                    <div class="footer-column">
                        <h4 class="footer-title">Shop</h4>
                        <div class="footer-links">
                            <a href="${pathPrefix}${pagePrefix}products.html" class="footer-link">All Products</a>
                            <a href="${pathPrefix}${pagePrefix}products.html?filter=new" class="footer-link">New Arrivals</a>
                            <a href="${pathPrefix}${pagePrefix}products.html?filter=best" class="footer-link">Best Sellers</a>
                            <a href="${pathPrefix}${pagePrefix}products.html?filter=sale" class="footer-link">Special Offers</a>
                        </div>
                    </div>

                    <!-- Column 3: Customer Service -->
                    <div class="footer-column">
                        <h4 class="footer-title">Customer Service</h4>
                        <div class="footer-links">
                            <a href="${pathPrefix}index.html#contact" class="footer-link">Contact Us</a>
                            <a href="${pathPrefix}index.html#shipping" class="footer-link">Shipping & Delivery</a>
                            <a href="${pathPrefix}index.html#returns" class="footer-link">Returns & Exchanges</a>
                            <a href="${pathPrefix}index.html#faq" class="footer-link">FAQs</a>
                        </div>
                    </div>

                    <!-- Column 4: Quick Links -->
                    <div class="footer-column">
                        <h4 class="footer-title">Legal & Info</h4>
                        <div class="footer-links">
                            <a href="${pathPrefix}index.html#about" class="footer-link">About Us</a>
                            <a href="#" class="footer-link">Privacy Policy</a>
                            <a href="#" class="footer-link">Terms of Service</a>
                            <a href="#" class="footer-link">Sustainability</a>
                        </div>
                    </div>
                </div>

                <!-- Bottom Section -->
                <div class="container footer-bottom">
                    <div class="footer-copyright">
                        &copy; 2026 AURA. All rights reserved. Designed for portfolios.
                    </div>
                    <div class="footer-payment">
                        <div class="payment-placeholder" aria-label="Visa Card">Visa</div>
                        <div class="payment-placeholder" aria-label="Mastercard">MC</div>
                        <div class="payment-placeholder" aria-label="Amex Card">Amex</div>
                        <div class="payment-placeholder" aria-label="Apple Pay">Apple</div>
                    </div>
                </div>
            </footer>
        `;
    }
}

customElements.define('app-footer', AppFooter);
