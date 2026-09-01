/**
 * AURA E-Commerce — Checkout Page Controller (Module 7)
 * Manages checkout authentication access control, empty cart protection,
 * multi-step progress indication, customer & shipping address validation,
 * delivery method selection, demo payment processing, order creation,
 * localStorage persistence ("aura_orders"), and order confirmation.
 */

document.addEventListener('DOMContentLoaded', () => {
    initCheckoutPage();
});

let isSubmittingOrder = false;

function initCheckoutPage() {
    // 1. Authentication Access Guard Check
    if (!window.AuraAuth || !window.AuraAuth.isLoggedIn()) {
        renderAuthRequiredView();
        return;
    }

    // 2. Empty Cart Protection Check
    const cart = window.AuraCart ? window.AuraCart.getCart() : [];
    if (!cart || cart.length === 0) {
        renderEmptyCartView();
        return;
    }

    // 3. Render Normal Checkout Interface
    renderCheckoutView();
}

/**
 * Renders the Authentication Required state
 */
function renderAuthRequiredView() {
    const main = document.querySelector('main');
    if (!main) return;
    main.innerHTML = `
        <div class="container section" style="min-height: 65vh; display: flex; align-items: center; justify-content: center;">
            <div class="empty-state-container" style="max-width: 520px; margin: 0 auto; text-align: center;">
                <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 64px; height: 64px; margin-bottom: var(--spacing-md); color: var(--color-secondary);">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                <h2 style="margin: 0 0 var(--spacing-xs); font-family: var(--font-headings); font-weight: 700; font-size: 1.8rem; color: var(--color-primary);">AUTHENTICATION REQUIRED</h2>
                <p style="margin: 0 0 var(--spacing-lg); color: var(--color-text-muted); font-size: 1rem; line-height: 1.5;">
                    Please sign in to your AURA account to continue with checkout and complete your order.
                </p>
                <a href="login.html?redirect=checkout.html" class="btn btn-primary btn-lg btn-full">LOGIN TO CONTINUE</a>
            </div>
        </div>
    `;
}

/**
 * Renders the Empty Cart Protection state
 */
function renderEmptyCartView() {
    const main = document.querySelector('main');
    if (!main) return;
    main.innerHTML = `
        <div class="container section" style="min-height: 65vh; display: flex; align-items: center; justify-content: center;">
            <div class="empty-state-container" style="max-width: 520px; margin: 0 auto; text-align: center;">
                <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 64px; height: 64px; margin-bottom: var(--spacing-md); color: var(--color-text-muted);">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                <h2 style="margin: 0 0 var(--spacing-xs); font-family: var(--font-headings); font-weight: 700; font-size: 1.8rem; color: var(--color-primary);">YOUR CART IS EMPTY</h2>
                <p style="margin: 0 0 var(--spacing-lg); color: var(--color-text-muted); font-size: 1rem; line-height: 1.5;">
                    You must add at least one product to your cart before proceeding to checkout.
                </p>
                <a href="products.html" class="btn btn-primary btn-lg btn-full">CONTINUE SHOPPING</a>
            </div>
        </div>
    `;
}

/**
 * Renders the main Checkout Interface
 */
function renderCheckoutView() {
    const main = document.querySelector('main');
    if (!main) return;

    const user = window.AuraAuth.getCurrentUser() || { name: '', email: '' };
    const calculations = window.AuraCart.getCartCalculations();

    main.innerHTML = `
        <section class="section" style="padding-top: var(--spacing-lg); background-color: var(--color-background); min-height: 85vh;">
            <div class="container">
                
                <!-- Page Title & Progress Indicator -->
                <div style="margin-bottom: var(--spacing-xl);">
                    <h1 style="font-family: var(--font-headings); font-weight: 700; font-size: 2rem; margin-bottom: var(--spacing-md);">Checkout</h1>
                    
                    <div class="checkout-progress-bar" aria-label="Checkout Progress">
                        <div class="checkout-step active" id="step-1">
                            <span class="step-number">1</span>
                            <span class="step-label">Information</span>
                        </div>
                        <div class="checkout-step-connector"></div>
                        <div class="checkout-step" id="step-2">
                            <span class="step-number">2</span>
                            <span class="step-label">Shipping</span>
                        </div>
                        <div class="checkout-step-connector"></div>
                        <div class="checkout-step" id="step-3">
                            <span class="step-number">3</span>
                            <span class="step-label">Payment</span>
                        </div>
                        <div class="checkout-step-connector"></div>
                        <div class="checkout-step" id="step-4">
                            <span class="step-number">4</span>
                            <span class="step-label">Review</span>
                        </div>
                    </div>
                </div>

                <!-- Main Split Layout -->
                <form id="checkout-form" novalidate aria-label="Checkout Form">
                    <div class="checkout-grid">
                        
                        <!-- Left Column: Checkout Forms -->
                        <div class="checkout-form-column">
                            
                            <!-- 1. Customer Information -->
                            <div class="card checkout-card" id="section-customer">
                                <h2 class="checkout-section-title">
                                    <span class="checkout-section-badge">1</span> Customer Information
                                </h2>
                                <div class="grid-2">
                                    <div class="form-group">
                                        <label for="checkout-name" class="form-label">Full Name *</label>
                                        <input type="text" id="checkout-name" class="form-input" value="${escapeHtml(user.name)}" required placeholder="John Doe">
                                        <div id="name-error" class="form-error"></div>
                                    </div>
                                    <div class="form-group">
                                        <label for="checkout-email" class="form-label">Email Address *</label>
                                        <input type="email" id="checkout-email" class="form-input" value="${escapeHtml(user.email)}" required placeholder="john@example.com">
                                        <div id="email-error" class="form-error"></div>
                                    </div>
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label for="checkout-phone" class="form-label">Mobile Phone Number *</label>
                                    <input type="tel" id="checkout-phone" class="form-input" placeholder="10-digit mobile number (e.g. 9876543210)" maxlength="10" required>
                                    <div id="phone-error" class="form-error"></div>
                                </div>
                            </div>

                            <!-- 2. Shipping Address -->
                            <div class="card checkout-card" id="section-shipping">
                                <h2 class="checkout-section-title">
                                    <span class="checkout-section-badge">2</span> Shipping Address
                                </h2>
                                <div class="form-group">
                                    <label for="checkout-address1" class="form-label">Address Line 1 *</label>
                                    <input type="text" id="checkout-address1" class="form-input" placeholder="House/Flat No., Street Name, Apartment" required>
                                    <div id="address1-error" class="form-error"></div>
                                </div>
                                <div class="form-group">
                                    <label for="checkout-address2" class="form-label">Address Line 2 (Optional)</label>
                                    <input type="text" id="checkout-address2" class="form-input" placeholder="Landmark, Area">
                                </div>
                                <div class="grid-3">
                                    <div class="form-group">
                                        <label for="checkout-city" class="form-label">City *</label>
                                        <input type="text" id="checkout-city" class="form-input" placeholder="City" required>
                                        <div id="city-error" class="form-error"></div>
                                    </div>
                                    <div class="form-group">
                                        <label for="checkout-state" class="form-label">State *</label>
                                        <select id="checkout-state" class="form-input" required>
                                            <option value="">Select State</option>
                                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                                            <option value="Delhi">Delhi</option>
                                            <option value="Gujarat">Gujarat</option>
                                            <option value="Karnataka">Karnataka</option>
                                            <option value="Kerala">Kerala</option>
                                            <option value="Maharashtra" selected>Maharashtra</option>
                                            <option value="Punjab">Punjab</option>
                                            <option value="Tamil Nadu">Tamil Nadu</option>
                                            <option value="Telangana">Telangana</option>
                                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                                            <option value="West Bengal">West Bengal</option>
                                        </select>
                                        <div id="state-error" class="form-error"></div>
                                    </div>
                                    <div class="form-group">
                                        <label for="checkout-pincode" class="form-label">PIN Code *</label>
                                        <input type="text" id="checkout-pincode" class="form-input" placeholder="6-digit PIN" maxlength="6" required>
                                        <div id="pincode-error" class="form-error"></div>
                                    </div>
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label for="checkout-country" class="form-label">Country</label>
                                    <input type="text" id="checkout-country" class="form-input" value="India" readonly disabled style="background-color: #f5f5f5; cursor: not-allowed;">
                                </div>
                            </div>

                            <!-- 3. Delivery Method -->
                            <div class="card checkout-card" id="section-delivery">
                                <h2 class="checkout-section-title">
                                    <span class="checkout-section-badge">3</span> Delivery Method
                                </h2>
                                <div class="delivery-options">
                                    <label class="delivery-option-card">
                                        <input type="radio" name="delivery-method" value="standard" ${calculations.subtotal < window.AuraCart.FREE_SHIPPING_THRESHOLD ? 'checked' : ''}>
                                        <div class="delivery-option-info">
                                            <div style="font-weight: 600; color: var(--color-primary);">Standard Delivery</div>
                                            <div style="font-size: 0.85rem; color: var(--color-text-muted);">Estimated delivery in 4–7 business days</div>
                                        </div>
                                        <div style="font-weight: 700; color: var(--color-primary);">₹${window.AuraCart.SHIPPING_FEE}</div>
                                    </label>
                                    <label class="delivery-option-card ${calculations.subtotal >= window.AuraCart.FREE_SHIPPING_THRESHOLD ? 'recommended' : ''}">
                                        <input type="radio" name="delivery-method" value="free" ${calculations.subtotal >= window.AuraCart.FREE_SHIPPING_THRESHOLD ? 'checked' : ''}>
                                        <div class="delivery-option-info">
                                            <div style="font-weight: 600; color: var(--color-primary);">Free Delivery</div>
                                            <div style="font-size: 0.85rem; color: var(--color-text-muted);">Available for orders ₹${window.AuraCart.FREE_SHIPPING_THRESHOLD.toLocaleString('en-IN')}+ (4–7 days)</div>
                                        </div>
                                        <div style="font-weight: 700; color: var(--color-success);">FREE</div>
                                    </label>
                                </div>
                                <div id="delivery-error" class="form-error"></div>
                            </div>

                            <!-- 4. Payment Method (Demo Only) -->
                            <div class="card checkout-card" id="section-payment">
                                <h2 class="checkout-section-title">
                                    <span class="checkout-section-badge">4</span> Payment Method
                                </h2>
                                
                                <div class="demo-security-notice" style="margin-top: 0; margin-bottom: var(--spacing-md); text-align: left;">
                                    ℹ️ <strong>Demo Notice:</strong> Payment interface is for demonstration purposes. No actual money will be charged.
                                </div>

                                <div class="payment-options">
                                    <!-- Cash on Delivery Option -->
                                    <label class="payment-option-card">
                                        <input type="radio" name="payment-method" value="cod" checked>
                                        <div class="payment-option-details">
                                            <span style="font-weight: 600; color: var(--color-primary);">Cash on Delivery (COD)</span>
                                            <span style="font-size: 0.85rem; color: var(--color-text-muted);">Pay with cash upon delivery at your doorstep.</span>
                                        </div>
                                    </label>

                                    <!-- UPI Option -->
                                    <label class="payment-option-card">
                                        <input type="radio" name="payment-method" value="upi">
                                        <div class="payment-option-details">
                                            <span style="font-weight: 600; color: var(--color-primary);">UPI (Google Pay, PhonePe, Paytm)</span>
                                            <span style="font-size: 0.85rem; color: var(--color-text-muted);">Pay using your Virtual Payment Address (VPA).</span>
                                        </div>
                                    </label>
                                    <div id="upi-fields" class="payment-conditional-fields" style="display: none;">
                                        <div class="form-group" style="margin-bottom: 0;">
                                            <label for="upi-id" class="form-label">UPI ID *</label>
                                            <input type="text" id="upi-id" class="form-input" placeholder="username@upi or mobile@paytm">
                                            <div id="upi-error" class="form-error"></div>
                                        </div>
                                    </div>

                                    <!-- Credit / Debit Card Option -->
                                    <label class="payment-option-card">
                                        <input type="radio" name="payment-method" value="card">
                                        <div class="payment-option-details">
                                            <span style="font-weight: 600; color: var(--color-primary);">Credit / Debit Card</span>
                                            <span style="font-size: 0.85rem; color: var(--color-text-muted);">Simulated card checkout demo.</span>
                                        </div>
                                    </label>
                                    <div id="card-fields" class="payment-conditional-fields" style="display: none;">
                                        <div class="form-group">
                                            <label for="card-number" class="form-label">Card Number *</label>
                                            <input type="text" id="card-number" class="form-input" placeholder="1234 5678 9101 1121" maxlength="19">
                                            <div id="card-number-error" class="form-error"></div>
                                        </div>
                                        <div class="form-group">
                                            <label for="card-name" class="form-label">Cardholder Name *</label>
                                            <input type="text" id="card-name" class="form-input" placeholder="Name on card">
                                            <div id="card-name-error" class="form-error"></div>
                                        </div>
                                        <div class="grid-2">
                                            <div class="form-group" style="margin-bottom: 0;">
                                                <label for="card-expiry" class="form-label">Expiry (MM/YY) *</label>
                                                <input type="text" id="card-expiry" class="form-input" placeholder="MM/YY" maxlength="5">
                                                <div id="card-expiry-error" class="form-error"></div>
                                            </div>
                                            <div class="form-group" style="margin-bottom: 0;">
                                                <label for="card-cvv" class="form-label">CVV *</label>
                                                <input type="password" id="card-cvv" class="form-input" placeholder="123" maxlength="4">
                                                <div id="card-cvv-error" class="form-error"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="payment-error" class="form-error"></div>
                            </div>
                        </div>

                        <!-- Right Column: Sticky Order Summary & Review -->
                        <div class="checkout-summary-column">
                            <div class="card checkout-summary-card">
                                <h2 style="font-size: 1.25rem; font-family: var(--font-headings); font-weight: 700; margin-bottom: var(--spacing-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--spacing-sm);">
                                    Order Summary (${calculations.itemCount} item${calculations.itemCount === 1 ? '' : 's'})
                                </h2>

                                <!-- Items List -->
                                <div class="checkout-summary-items">
                                    ${calculations.items.map(item => `
                                        <div class="checkout-summary-item">
                                            <div class="checkout-item-image">
                                                <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
                                                    <rect width="100" height="100" fill="#f4efe6" rx="4"/>
                                                    <circle cx="50" cy="45" r="24" fill="none" stroke="#c5a880" stroke-width="2"/>
                                                    <text x="50" y="49" font-family="'Outfit', sans-serif" font-weight="700" font-size="8" fill="#121212" text-anchor="middle" letter-spacing="1">${escapeHtml(item.product.category.toUpperCase())}</text>
                                                </svg>
                                            </div>
                                            <div class="checkout-item-details">
                                                <div class="checkout-item-title">${escapeHtml(item.product.name)}</div>
                                                <div class="checkout-item-qty">Qty: ${item.quantity} × ₹${item.unitPrice.toLocaleString('en-IN')}</div>
                                            </div>
                                            <div class="checkout-item-price">₹${item.itemTotal.toLocaleString('en-IN')}</div>
                                        </div>
                                    `).join('')}
                                </div>

                                <hr style="border: 0; border-top: 1px solid var(--color-border); margin-block: var(--spacing-md);">

                                <!-- Totals Calculation Breakdown -->
                                <div class="checkout-totals">
                                    <div class="totals-row">
                                        <span>Subtotal</span>
                                        <span id="summary-subtotal">₹${calculations.subtotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    ${calculations.totalSavings > 0 ? `
                                        <div class="totals-row discount-row" style="color: var(--color-success);">
                                            <span>Total Savings</span>
                                            <span>-₹${calculations.totalSavings.toLocaleString('en-IN')}</span>
                                        </div>
                                    ` : ''}
                                    <div class="totals-row">
                                        <span>Shipping</span>
                                        <span id="summary-shipping" style="${calculations.shipping === 0 ? 'color: var(--color-success); font-weight: 600;' : ''}">
                                            ${calculations.shipping === 0 ? 'FREE' : `₹${calculations.shipping}`}
                                        </span>
                                    </div>
                                    
                                    <hr style="border: 0; border-top: 1px solid var(--color-border); margin-block: var(--spacing-xs);">

                                    <div class="totals-row total-grand">
                                        <span>Total</span>
                                        <span id="summary-total" style="color: var(--color-primary);">₹${calculations.finalTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <!-- Form Top General Alert -->
                                <div id="form-alert" class="form-alert" style="display: none; margin-top: var(--spacing-md);"></div>

                                <!-- CTA Place Order Button -->
                                <button type="submit" id="place-order-btn" class="btn btn-primary btn-lg btn-full" style="margin-top: var(--spacing-lg);">
                                    PLACE ORDER
                                </button>
                            </div>
                        </div>

                    </div>
                </form>

            </div>
        </section>
    `;

    // Bind interactive payment option toggles & form submit event
    bindCheckoutEvents();
}

/**
 * Binds payment radio options toggling, live step progress updating, and submit listener
 */
function bindCheckoutEvents() {
    const form = document.getElementById('checkout-form');
    const paymentRadios = document.querySelectorAll('input[name="payment-method"]');
    const deliveryRadios = document.querySelectorAll('input[name="delivery-method"]');
    const upiFields = document.getElementById('upi-fields');
    const cardFields = document.getElementById('card-fields');

    // Toggle Payment Method Fields
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;
            if (upiFields) upiFields.style.display = val === 'upi' ? 'block' : 'none';
            if (cardFields) cardFields.style.display = val === 'card' ? 'block' : 'none';
        });
    });

    // Update Shipping Breakdown dynamically if user toggles delivery method
    deliveryRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            updateTotalsBreakdown();
        });
    });

    // Step Progress updating on focus
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            const card = input.closest('.checkout-card');
            if (!card) return;
            const secId = card.id;
            if (secId === 'section-customer') setStepActive(1);
            else if (secId === 'section-shipping') setStepActive(2);
            else if (secId === 'section-delivery' || secId === 'section-payment') setStepActive(3);
        });
    });

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handlePlaceOrder();
        });
    }
}

/**
 * Recalculates shipping and totals if delivery option changes
 */
function updateTotalsBreakdown() {
    const calculations = window.AuraCart.getCartCalculations();
    const selectedDelivery = document.querySelector('input[name="delivery-method"]:checked')?.value || 'standard';

    let shippingFee = calculations.shipping;
    if (selectedDelivery === 'free' && calculations.subtotal >= window.AuraCart.FREE_SHIPPING_THRESHOLD) {
        shippingFee = 0;
    } else if (selectedDelivery === 'standard') {
        shippingFee = window.AuraCart.SHIPPING_FEE;
    }

    const finalTotal = calculations.subtotal + shippingFee;

    const shippingElem = document.getElementById('summary-shipping');
    const totalElem = document.getElementById('summary-total');

    if (shippingElem) {
        shippingElem.textContent = shippingFee === 0 ? 'FREE' : `₹${shippingFee}`;
        shippingElem.style.color = shippingFee === 0 ? 'var(--color-success)' : 'var(--color-text)';
    }

    if (totalElem) {
        totalElem.textContent = `₹${finalTotal.toLocaleString('en-IN')}`;
    }
}

function setStepActive(stepNum) {
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step-${i}`);
        if (!step) continue;
        if (i <= stepNum) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    }
}

/**
 * Handles Form Validation & Order Placement
 */
function handlePlaceOrder() {
    if (isSubmittingOrder) return;
    clearErrors();

    const nameInput = document.getElementById('checkout-name');
    const emailInput = document.getElementById('checkout-email');
    const phoneInput = document.getElementById('checkout-phone');
    const address1Input = document.getElementById('checkout-address1');
    const address2Input = document.getElementById('checkout-address2');
    const cityInput = document.getElementById('checkout-city');
    const stateInput = document.getElementById('checkout-state');
    const pincodeInput = document.getElementById('checkout-pincode');
    const deliveryRadio = document.querySelector('input[name="delivery-method"]:checked');
    const paymentRadio = document.querySelector('input[name="payment-method"]:checked');

    const name = (nameInput ? nameInput.value : '').trim();
    const email = (emailInput ? emailInput.value : '').trim();
    const phone = (phoneInput ? phoneInput.value : '').trim();
    const address1 = (address1Input ? address1Input.value : '').trim();
    const address2 = (address2Input ? address2Input.value : '').trim();
    const city = (cityInput ? cityInput.value : '').trim();
    const state = (stateInput ? stateInput.value : '').trim();
    const pincode = (pincodeInput ? pincodeInput.value : '').trim();
    const deliveryMethod = deliveryRadio ? deliveryRadio.value : '';
    const paymentMethod = paymentRadio ? paymentRadio.value : '';

    let isValid = true;

    // Customer Validation
    if (!name || name.length < 2) {
        showError('name-error', 'Full Name must be at least 2 characters.');
        isValid = false;
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        showError('email-error', 'Please enter a valid email address.');
        isValid = false;
    }

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
        showError('phone-error', 'Please enter a valid 10-digit Indian mobile number.');
        isValid = false;
    }

    // Shipping Address Validation
    if (!address1 || address1.length < 5) {
        showError('address1-error', 'Street address must be at least 5 characters.');
        isValid = false;
    }

    if (!city || city.length < 2) {
        showError('city-error', 'Please enter a valid city name.');
        isValid = false;
    }

    if (!state) {
        showError('state-error', 'Please select your state.');
        isValid = false;
    }

    if (!pincode || !/^\d{6}$/.test(pincode)) {
        showError('pincode-error', 'PIN Code must be exactly 6 digits.');
        isValid = false;
    }

    // Payment Validation
    if (paymentMethod === 'upi') {
        const upiInput = document.getElementById('upi-id');
        const upiId = (upiInput ? upiInput.value : '').trim();
        if (!upiId || !/\S+@\S+/.test(upiId)) {
            showError('upi-error', 'Please enter a valid UPI ID (e.g. name@upi).');
            isValid = false;
        }
    } else if (paymentMethod === 'card') {
        const cardNumber = (document.getElementById('card-number')?.value || '').trim();
        const cardName = (document.getElementById('card-name')?.value || '').trim();
        const cardExpiry = (document.getElementById('card-expiry')?.value || '').trim();
        const cardCvv = (document.getElementById('card-cvv')?.value || '').trim();

        if (!cardNumber || cardNumber.replace(/\s+/g, '').length < 15) {
            showError('card-number-error', 'Please enter a valid card number.');
            isValid = false;
        }
        if (!cardName || cardName.length < 2) {
            showError('card-name-error', 'Cardholder name is required.');
            isValid = false;
        }
        if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
            showError('card-expiry-error', 'Expiry date must be in MM/YY format.');
            isValid = false;
        }
        if (!cardCvv || !/^\d{3,4}$/.test(cardCvv)) {
            showError('card-cvv-error', 'Enter valid 3 or 4 digit CVV.');
            isValid = false;
        }
    }

    if (!isValid) {
        showFormAlert('Please fix the errors above before placing your order.', 'danger');
        return;
    }

    // Lock place order button to prevent duplicate orders
    isSubmittingOrder = true;
    const btn = document.getElementById('place-order-btn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'PROCESSING ORDER...';
    }

    setStepActive(4);

    // Build Order Object
    const currentUser = window.AuraAuth.getCurrentUser();
    const calculations = window.AuraCart.getCartCalculations();

    let shippingCharge = calculations.shipping;
    if (deliveryMethod === 'free' && calculations.subtotal >= window.AuraCart.FREE_SHIPPING_THRESHOLD) {
        shippingCharge = 0;
    } else if (deliveryMethod === 'standard') {
        shippingCharge = window.AuraCart.SHIPPING_FEE;
    }

    const orderId = generateOrderId();
    const orderObj = {
        id: orderId,
        userId: currentUser ? currentUser.id : 'guest',
        date: new Date().toISOString(),
        status: 'Order Placed',
        customer: {
            name,
            email,
            phone
        },
        shipping: {
            addressLine1: address1,
            addressLine2: address2,
            city,
            state,
            pinCode: pincode,
            country: 'India'
        },
        delivery: {
            method: deliveryMethod === 'free' ? 'Free Delivery' : 'Standard Delivery',
            charge: shippingCharge
        },
        payment: {
            method: paymentMethod === 'cod' ? 'Cash on Delivery' : (paymentMethod === 'upi' ? 'UPI Payment' : 'Credit/Debit Card')
            // NO Card numbers, CVV, or sensitive data stored!
        },
        items: calculations.items.map(i => ({
            productId: i.product.id,
            name: i.product.name,
            category: i.product.category,
            price: i.unitPrice,
            quantity: i.quantity,
            itemTotal: i.itemTotal
        })),
        subtotal: calculations.subtotal,
        discount: calculations.totalSavings,
        shippingFee: shippingCharge,
        total: calculations.subtotal + shippingCharge
    };

    // Save Order to localStorage key "aura_orders"
    saveOrderToStorage(orderObj);

    // Clear cart via central AuraCart service
    window.AuraCart.clearCart();

    // Render Order Confirmation Screen after slight delay for realism
    setTimeout(() => {
        renderOrderConfirmationView(orderObj);
    }, 600);
}

/**
 * Appends new order to localStorage "aura_orders" safely
 */
function saveOrderToStorage(order) {
    try {
        const raw = localStorage.getItem('aura_orders');
        let orders = [];
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) orders = parsed;
        }
        orders.unshift(order); // Newest order first
        localStorage.setItem('aura_orders', JSON.stringify(orders));
    } catch (e) {
        console.error('[AURA Orders] Error saving order to localStorage:', e);
    }
}

/**
 * Generates a clean, unique order ID (e.g. AURA-20260829-382)
 */
function generateOrderId() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const rand = Math.floor(100 + Math.random() * 900);
    return `AURA-${yyyy}${mm}${dd}-${rand}`;
}

/**
 * Renders the Order Confirmation screen
 */
function renderOrderConfirmationView(order) {
    const main = document.querySelector('main');
    if (!main) return;

    main.innerHTML = `
        <section class="section" style="padding-top: var(--spacing-xl); background-color: var(--color-background); min-height: 80vh;">
            <div class="container" style="max-width: 680px;">
                <div class="card" style="padding: var(--spacing-xxl); text-align: center; border-top: 4px solid var(--color-secondary);">
                    
                    <div style="width: 72px; height: 72px; background-color: #f0fdf4; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto var(--spacing-md);">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#166534" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>

                    <h1 style="font-family: var(--font-headings); font-weight: 700; font-size: 2rem; color: var(--color-primary); margin-bottom: var(--spacing-xxs);">
                        ORDER PLACED SUCCESSFULLY
                    </h1>
                    <p style="color: var(--color-text-muted); font-size: 1rem; margin-bottom: var(--spacing-xl);">
                        Thank you for shopping with AURA. Your order has been recorded.
                    </p>

                    <div style="background-color: var(--color-secondary-light); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--spacing-lg); margin-bottom: var(--spacing-xl); text-align: left;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs); font-size: 0.95rem;">
                            <span style="color: var(--color-text-muted);">Order Reference ID:</span>
                            <strong style="color: var(--color-primary); font-family: monospace; font-size: 1.05rem;">${escapeHtml(order.id)}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs); font-size: 0.95rem;">
                            <span style="color: var(--color-text-muted);">Total Amount Paid:</span>
                            <strong style="color: var(--color-primary);">₹${order.total.toLocaleString('en-IN')}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs); font-size: 0.95rem;">
                            <span style="color: var(--color-text-muted);">Payment Method:</span>
                            <span>${escapeHtml(order.payment.method)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.95rem;">
                            <span style="color: var(--color-text-muted);">Estimated Delivery:</span>
                            <span style="color: var(--color-success); font-weight: 600;">4–7 business days</span>
                        </div>
                    </div>

                    <div style="display: flex; gap: var(--spacing-md); justify-content: center;">
                        <a href="orders.html" class="btn btn-primary btn-lg">VIEW MY ORDERS</a>
                        <a href="products.html" class="btn btn-outline btn-lg">CONTINUE SHOPPING</a>
                    </div>

                </div>
            </div>
        </section>
    `;
}

function showError(elemId, text) {
    const elem = document.getElementById(elemId);
    if (elem) {
        elem.textContent = text;
        elem.style.display = 'block';
    }
}

function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    const alertBox = document.getElementById('form-alert');
    if (alertBox) {
        alertBox.textContent = '';
        alertBox.style.display = 'none';
        alertBox.className = 'form-alert';
    }
}

function showFormAlert(message, type = 'danger') {
    const alertBox = document.getElementById('form-alert');
    if (alertBox) {
        alertBox.textContent = message;
        alertBox.className = `form-alert alert-${type}`;
        alertBox.style.display = 'block';
    }
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
