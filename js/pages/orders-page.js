/**
 * AURA E-Commerce — Orders & Order Tracking Page Controller (Module 8)
 * Manages user authentication guard, order retrieval from localStorage ("aura_orders"),
 * user-specific order filtering, order history cards, detailed order tracking view,
 * progress timeline stages (Order Placed -> Processing -> Shipped -> Delivered),
 * and "Buy Again" quick cart re-addition.
 */

document.addEventListener('DOMContentLoaded', () => {
    initOrdersPage();
});

function initOrdersPage() {
    // 1. Authentication Access Guard
    if (!window.AuraAuth || !window.AuraAuth.isLoggedIn()) {
        renderAuthRequiredView();
        return;
    }

    const currentUser = window.AuraAuth.getCurrentUser();
    const userOrders = getUserOrders(currentUser ? currentUser.id : null);

    // 2. Query Parameter Check (Direct link to specific order e.g. orders.html?id=AURA-20260829-382)
    const params = new URLSearchParams(window.location.search);
    const targetOrderId = params.get('id');

    if (targetOrderId) {
        const selectedOrder = userOrders.find(o => o.id === targetOrderId);
        if (selectedOrder) {
            renderOrderDetailsView(selectedOrder, userOrders);
            return;
        } else {
            setTimeout(() => showToast("Order not found or access denied."), 300);
        }
    }

    // 3. Check for Empty Orders State
    if (!userOrders || userOrders.length === 0) {
        renderEmptyOrdersView();
        return;
    }

    // 4. Render Main Orders History List
    renderOrdersListView(userOrders);
}

/**
 * Retrieves orders from localStorage ("aura_orders") filtered by active user ID
 */
function getUserOrders(userId) {
    try {
        const raw = localStorage.getItem('aura_orders');
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        if (!userId) return [];

        // Return orders matching current user ID, sorted newest first
        return parsed
            .filter(o => String(o.userId) === String(userId))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (e) {
        console.error('[AURA Orders] Error reading aura_orders from localStorage:', e);
        return [];
    }
}

/**
 * Renders Authentication Required view
 */
function renderAuthRequiredView() {
    const main = document.querySelector('main');
    if (!main) return;
    main.innerHTML = `
        <div class="container section" style="min-height: 65vh; display: flex; align-items: center; justify-content: center;">
            <div class="empty-state-container" style="max-width: 520px; margin: 0 auto; text-align: center;">
                <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 64px; height: 64px; margin-bottom: var(--spacing-md); color: var(--color-secondary);">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                <h2 style="margin: 0 0 var(--spacing-xs); font-family: var(--font-headings); font-weight: 700; font-size: 1.8rem; color: var(--color-primary);">AUTHENTICATION REQUIRED</h2>
                <p style="margin: 0 0 var(--spacing-lg); color: var(--color-text-muted); font-size: 1rem; line-height: 1.5;">
                    Please sign in to your AURA account to view your order history and track shipments.
                </p>
                <a href="login.html?redirect=orders.html" class="btn btn-primary btn-lg btn-full">LOGIN TO CONTINUE</a>
            </div>
        </div>
    `;
}

/**
 * Renders Empty Orders view
 */
function renderEmptyOrdersView() {
    const main = document.querySelector('main');
    if (!main) return;
    main.innerHTML = `
        <div class="container section" style="min-height: 65vh; display: flex; align-items: center; justify-content: center;">
            <div class="empty-state-container" style="max-width: 520px; margin: 0 auto; text-align: center;">
                <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 64px; height: 64px; margin-bottom: var(--spacing-md); color: var(--color-text-muted);">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <h2 style="margin: 0 0 var(--spacing-xs); font-family: var(--font-headings); font-weight: 700; font-size: 1.8rem; color: var(--color-primary);">NO ORDERS FOUND</h2>
                <p style="margin: 0 0 var(--spacing-lg); color: var(--color-text-muted); font-size: 1rem; line-height: 1.5;">
                    You have not placed any orders yet. Explore our curated collections to place your first order.
                </p>
                <a href="products.html" class="btn btn-primary btn-lg btn-full">START SHOPPING</a>
            </div>
        </div>
    `;
}

/**
 * Renders Order History Cards List
 */
function renderOrdersListView(orders) {
    const main = document.querySelector('main');
    if (!main) return;

    main.innerHTML = `
        <section class="section" style="padding-top: var(--spacing-xl); background-color: var(--color-background); min-height: 80vh;">
            <div class="container" style="max-width: 900px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-xl); flex-wrap: wrap; gap: var(--spacing-sm);">
                    <div>
                        <h1 style="font-family: var(--font-headings); font-weight: 700; font-size: 2rem; margin-bottom: 4px;">My Orders</h1>
                        <p style="color: var(--color-text-muted); font-size: 0.95rem;">Manage your order history and track live shipment progress.</p>
                    </div>
                    <div style="font-size: 0.9rem; font-weight: 600; background-color: var(--color-secondary-light); padding: 6px 14px; border-radius: var(--radius-full); color: var(--color-primary);">
                        ${orders.length} Total Order${orders.length === 1 ? '' : 's'}
                    </div>
                </div>

                <div class="orders-list">
                    ${orders.map(order => renderOrderCardHtml(order)).join('')}
                </div>
            </div>
        </section>
    `;

    bindOrdersListEvents(orders);
}

/**
 * Generates HTML for an individual Order Card in the list
 */
function renderOrderCardHtml(order) {
    const formattedDate = formatDate(order.date);
    const statusStage = getOrderStatusStage(order);
    const itemCount = order.items ? order.items.reduce((sum, i) => sum + i.quantity, 0) : 0;

    return `
        <div class="card order-card" id="order-card-${escapeHtml(order.id)}" style="padding: var(--spacing-lg); margin-bottom: var(--spacing-lg);">
            
            <!-- Order Header Bar -->
            <div class="order-card-header">
                <div class="order-header-meta">
                    <div>
                        <span class="meta-label">ORDER PLACED</span>
                        <div class="meta-value">${formattedDate}</div>
                    </div>
                    <div>
                        <span class="meta-label">TOTAL</span>
                        <div class="meta-value" style="color: var(--color-primary);">₹${order.total.toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                        <span class="meta-label">ORDER ID</span>
                        <div class="meta-value" style="font-family: monospace;">${escapeHtml(order.id)}</div>
                    </div>
                </div>
                <div>
                    <span class="badge ${statusStage.badgeClass}">${escapeHtml(statusStage.label)}</span>
                </div>
            </div>

            <!-- Items Preview List -->
            <div class="order-card-items">
                ${(order.items || []).map(item => `
                    <div class="order-item-row">
                        <div class="order-item-thumbnail">
                            ${(() => {
                                const prod = (window.productsData || []).find(p => p.id === item.productId);
                                const img = item.image || (prod ? prod.image : null);
                                if (img) {
                                    return `<img src="${window.getProductImagePath ? window.getProductImagePath(img) : `../assets/images/${img}`}" alt="${escapeHtml(item.name)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-sm);" loading="lazy">`;
                                }
                                return `
                                    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
                                        <rect width="100" height="100" fill="#f4efe6" rx="4"/>
                                        <circle cx="50" cy="45" r="24" fill="none" stroke="#c5a880" stroke-width="2"/>
                                        <text x="50" y="49" font-family="'Outfit', sans-serif" font-weight="700" font-size="8" fill="#121212" text-anchor="middle" letter-spacing="1">${escapeHtml((item.category || 'PRODUCT').toUpperCase())}</text>
                                    </svg>
                                `;
                            })()}
                        </div>
                        <div class="order-item-info">
                            <div class="order-item-name">${escapeHtml(item.name)}</div>
                            <div class="order-item-meta">Qty: ${item.quantity} × ₹${item.price.toLocaleString('en-IN')}</div>
                        </div>
                        <div class="order-item-actions">
                            <button type="button" class="btn btn-outline btn-sm buy-again-btn" data-product-id="${item.productId}">
                                Buy Again
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Order Card Footer CTA -->
            <div class="order-card-footer">
                <span style="font-size: 0.85rem; color: var(--color-text-muted);">
                    ${itemCount} item${itemCount === 1 ? '' : 's'} • Paid via ${escapeHtml(order.payment?.method || 'Card')}
                </span>
                <button type="button" class="btn btn-primary btn-sm track-order-btn" data-order-id="${escapeHtml(order.id)}">
                    TRACK & VIEW DETAILS →
                </button>
            </div>
        </div>
    `;
}

/**
 * Bind event listeners for order card actions
 */
function bindOrdersListEvents(orders) {
    // Track Order button clicks
    document.querySelectorAll('.track-order-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = e.currentTarget.getAttribute('data-order-id');
            const targetOrder = orders.find(o => o.id === orderId);
            if (targetOrder) {
                renderOrderDetailsView(targetOrder, orders);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    // Buy Again button clicks
    document.querySelectorAll('.buy-again-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const prodId = parseInt(e.currentTarget.getAttribute('data-product-id'), 10);
            if (window.AuraCart && !isNaN(prodId)) {
                const res = window.AuraCart.addToCart(prodId, 1);
                showToast(res.message || 'Item added to your cart!');
            }
        });
    });
}

/**
 * Renders Detailed Order & Tracking Timeline View
 */
function renderOrderDetailsView(order, allOrders) {
    const main = document.querySelector('main');
    if (!main) return;

    const formattedDate = formatDate(order.date);
    const statusStage = getOrderStatusStage(order);
    const estDelivery = getEstimatedDeliveryRange(order.date);

    main.innerHTML = `
        <section class="section" style="padding-top: var(--spacing-xl); background-color: var(--color-background); min-height: 85vh;">
            <div class="container" style="max-width: 900px;">
                
                <!-- Back Link Navigation -->
                <div style="margin-bottom: var(--spacing-lg);">
                    <button type="button" id="back-to-orders-btn" class="btn btn-outline btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
                        ← Back to My Orders
                    </button>
                </div>

                <!-- Main Order Detail Header Card -->
                <div class="card" style="padding: var(--spacing-xl); margin-bottom: var(--spacing-xl); border-top: 4px solid var(--color-secondary);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--spacing-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--spacing-md); margin-bottom: var(--spacing-xl);">
                        <div>
                            <span style="font-size: 0.85rem; color: var(--color-text-muted);">ORDER DETAILS & LIVE STATUS</span>
                            <h1 style="font-family: var(--font-headings); font-weight: 700; font-size: 1.8rem; margin: 2px 0 4px; font-family: monospace;">
                                ${escapeHtml(order.id)}
                            </h1>
                            <span style="font-size: 0.9rem; color: var(--color-text-muted);">Placed on ${formattedDate}</span>
                        </div>
                        <div style="text-align: right;">
                            <span class="badge ${statusStage.badgeClass}" style="font-size: 0.95rem; padding: 6px 14px;">${escapeHtml(statusStage.label)}</span>
                            <div style="font-size: 0.85rem; color: var(--color-text-muted); margin-top: 6px;">
                                Est. Delivery: <strong style="color: var(--color-success);">${estDelivery}</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Order Tracking Visual Timeline -->
                    <div class="order-tracking-timeline" aria-label="Order Tracking Timeline">
                        <div class="timeline-step ${statusStage.step >= 1 ? 'completed' : ''}">
                            <div class="timeline-icon">✓</div>
                            <div class="timeline-label">Order Placed</div>
                            <div class="timeline-date">${formattedDate}</div>
                        </div>
                        <div class="timeline-connector ${statusStage.step >= 2 ? 'completed' : ''}"></div>

                        <div class="timeline-step ${statusStage.step >= 2 ? (statusStage.step === 2 ? 'active' : 'completed') : ''}">
                            <div class="timeline-icon">${statusStage.step > 2 ? '✓' : '2'}</div>
                            <div class="timeline-label">Processing</div>
                            <div class="timeline-date">${statusStage.step >= 2 ? 'In Warehouse' : 'Pending'}</div>
                        </div>
                        <div class="timeline-connector ${statusStage.step >= 3 ? 'completed' : ''}"></div>

                        <div class="timeline-step ${statusStage.step >= 3 ? (statusStage.step === 3 ? 'active' : 'completed') : ''}">
                            <div class="timeline-icon">${statusStage.step > 3 ? '✓' : '3'}</div>
                            <div class="timeline-label">Shipped</div>
                            <div class="timeline-date">${statusStage.step >= 3 ? 'In Transit' : 'Pending'}</div>
                        </div>
                        <div class="timeline-connector ${statusStage.step >= 4 ? 'completed' : ''}"></div>

                        <div class="timeline-step ${statusStage.step >= 4 ? 'completed' : ''}">
                            <div class="timeline-icon">${statusStage.step >= 4 ? '✓' : '4'}</div>
                            <div class="timeline-label">Delivered</div>
                            <div class="timeline-date">${statusStage.step >= 4 ? 'Delivered' : estDelivery}</div>
                        </div>
                    </div>

                </div>

                <!-- Split Grid: Shipping/Payment Info vs Items & Breakdown -->
                <div class="grid grid-2" style="grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); align-items: start; margin-bottom: var(--spacing-xl);">
                    
                    <!-- Customer & Shipping Card -->
                    <div class="card" style="padding: var(--spacing-lg);">
                        <h3 style="font-size: 1.15rem; font-family: var(--font-headings); font-weight: 700; margin-bottom: var(--spacing-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--spacing-xs);">
                            Delivery & Customer Info
                        </h3>
                        <div style="font-size: 0.9rem; line-height: 1.6; color: var(--color-text);">
                            <div style="margin-bottom: var(--spacing-xs);">
                                <strong>Recipient:</strong> ${escapeHtml(order.customer?.name || '')}
                            </div>
                            <div style="margin-bottom: var(--spacing-xs);">
                                <strong>Email:</strong> ${escapeHtml(order.customer?.email || '')}
                            </div>
                            <div style="margin-bottom: var(--spacing-xs);">
                                <strong>Phone:</strong> ${escapeHtml(order.customer?.phone || '')}
                            </div>
                            <hr style="border: 0; border-top: 1px solid var(--color-border); margin-block: var(--spacing-xs);">
                            <div style="margin-bottom: var(--spacing-xs);">
                                <strong>Shipping Address:</strong><br>
                                ${escapeHtml(order.shipping?.addressLine1 || '')}<br>
                                ${order.shipping?.addressLine2 ? escapeHtml(order.shipping.addressLine2) + '<br>' : ''}
                                ${escapeHtml(order.shipping?.city || '')}, ${escapeHtml(order.shipping?.state || '')} - ${escapeHtml(order.shipping?.pinCode || '')}<br>
                                ${escapeHtml(order.shipping?.country || 'India')}
                            </div>
                            <hr style="border: 0; border-top: 1px solid var(--color-border); margin-block: var(--spacing-xs);">
                            <div>
                                <strong>Delivery Method:</strong> ${escapeHtml(order.delivery?.method || 'Standard Delivery')} (${order.delivery?.charge === 0 ? 'FREE' : '₹' + order.delivery?.charge})
                            </div>
                        </div>
                    </div>

                    <!-- Payment & Totals Summary Card -->
                    <div class="card" style="padding: var(--spacing-lg);">
                        <h3 style="font-size: 1.15rem; font-family: var(--font-headings); font-weight: 700; margin-bottom: var(--spacing-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--spacing-xs);">
                            Payment Summary
                        </h3>
                        <div style="font-size: 0.9rem; line-height: 1.6;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs);">
                                <span>Payment Method:</span>
                                <strong>${escapeHtml(order.payment?.method || 'Cash on Delivery')}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs);">
                                <span>Subtotal:</span>
                                <span>₹${(order.subtotal || 0).toLocaleString('en-IN')}</span>
                            </div>
                            ${order.discount ? `
                                <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs); color: var(--color-success);">
                                    <span>Discount:</span>
                                    <span>-₹${order.discount.toLocaleString('en-IN')}</span>
                                </div>
                            ` : ''}
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs);">
                                <span>Shipping Fee:</span>
                                <span>${order.shippingFee === 0 ? 'FREE' : '₹' + (order.shippingFee || 0)}</span>
                            </div>
                            <hr style="border: 0; border-top: 1px solid var(--color-border); margin-block: var(--spacing-xs);">
                            <div style="display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 700; color: var(--color-primary);">
                                <span>Total Paid:</span>
                                <span>₹${(order.total || 0).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Products Table Card -->
                <div class="card" style="padding: var(--spacing-lg);">
                    <h3 style="font-size: 1.15rem; font-family: var(--font-headings); font-weight: 700; margin-bottom: var(--spacing-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--spacing-xs);">
                        Ordered Products (${(order.items || []).length})
                    </h3>
                    <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                        ${(order.items || []).map(item => `
                            <div class="order-item-row">
                                <div class="order-item-thumbnail">
                                    ${(() => {
                                        const prod = (window.productsData || []).find(p => p.id === item.productId);
                                        const img = item.image || (prod ? prod.image : null);
                                        if (img) {
                                            return `<img src="${window.getProductImagePath ? window.getProductImagePath(img) : `../assets/images/${img}`}" alt="${escapeHtml(item.name)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-sm);" loading="lazy">`;
                                        }
                                        return `
                                            <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
                                                <rect width="100" height="100" fill="#f4efe6" rx="4"/>
                                                <circle cx="50" cy="45" r="24" fill="none" stroke="#c5a880" stroke-width="2"/>
                                                <text x="50" y="49" font-family="'Outfit', sans-serif" font-weight="700" font-size="8" fill="#121212" text-anchor="middle" letter-spacing="1">${escapeHtml((item.category || 'PRODUCT').toUpperCase())}</text>
                                            </svg>
                                        `;
                                    })()}
                                </div>
                                <div class="order-item-info">
                                    <div class="order-item-name">${escapeHtml(item.name)}</div>
                                    <div class="order-item-meta">₹${item.price.toLocaleString('en-IN')} × ${item.quantity}</div>
                                </div>
                                <div style="font-weight: 700; color: var(--color-primary);">
                                    ₹${((item.itemTotal) || (item.price * item.quantity)).toLocaleString('en-IN')}
                                </div>
                                <div class="order-item-actions" style="margin-left: 12px;">
                                    <button type="button" class="btn btn-primary btn-sm detail-buy-again-btn" data-product-id="${item.productId}">
                                        Buy Again
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

            </div>
        </section>
    `;

    // Bind back button
    const backBtn = document.getElementById('back-to-orders-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            renderOrdersListView(allOrders);
        });
    }

    // Bind Buy Again buttons
    document.querySelectorAll('.detail-buy-again-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const prodId = parseInt(e.currentTarget.getAttribute('data-product-id'), 10);
            if (window.AuraCart && !isNaN(prodId)) {
                const res = window.AuraCart.addToCart(prodId, 1);
                showToast(res.message || 'Item added to your cart!');
            }
        });
    });
}

/**
 * Computes status timeline stage based on order date elapsed time or order status field
 */
function getOrderStatusStage(order) {
    if (!order.date) {
        return { step: 1, label: 'Order Placed', badgeClass: 'badge-hot' };
    }

    const orderTime = new Date(order.date).getTime();
    const now = Date.now();
    const hoursElapsed = (now - orderTime) / (1000 * 60 * 60);

    if (order.status === 'Delivered' || hoursElapsed >= 72) {
        return { step: 4, label: 'Delivered', badgeClass: 'badge-sale' };
    } else if (order.status === 'Shipped' || hoursElapsed >= 24) {
        return { step: 3, label: 'Shipped', badgeClass: 'badge-hot' };
    } else if (order.status === 'Processing' || hoursElapsed >= 1) {
        return { step: 2, label: 'Processing', badgeClass: 'badge-new' };
    } else {
        return { step: 1, label: 'Order Placed', badgeClass: 'badge-outline' };
    }
}

/**
 * Computes an estimated delivery date string (e.g. 4-7 days from order date)
 */
function getEstimatedDeliveryRange(orderDateStr) {
    if (!orderDateStr) return '4–7 business days';
    const date = new Date(orderDateStr);
    const minDate = new Date(date);
    minDate.setDate(minDate.getDate() + 4);
    const maxDate = new Date(date);
    maxDate.setDate(maxDate.getDate() + 7);

    return `${minDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – ${maxDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (e) {
        return dateStr;
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
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
