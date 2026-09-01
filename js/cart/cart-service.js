/**
 * AURA E-Commerce — Central Cart Service (Module 5)
 * Manages localStorage cart persistence under the key "aura_cart",
 * handles cart state updates, validation, quantity limits, shipping thresholds,
 * price calculations, and dispatches the "aura-cart-updated" custom DOM event.
 */

const CART_STORAGE_KEY = 'aura_cart';
const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_FEE = 100;

/**
 * Safely retrieves cart from localStorage.
 * Handles corrupted JSON or invalid data by resetting to an empty array.
 */
function getCart() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            console.warn("[AURA Cart] Corrupted cart format. Resetting cart.");
            saveCart([]);
            return [];
        }

        // Clean missing or invalid product entries if dataset is loaded
        if (window.productsData && Array.isArray(window.productsData)) {
            const validCart = parsed.filter(item => {
                return item && typeof item.id === 'number' && typeof item.quantity === 'number' && item.quantity > 0 &&
                    window.productsData.some(p => p.id === item.id);
            });
            if (validCart.length !== parsed.length) {
                saveCart(validCart);
                return validCart;
            }
        }

        return parsed;
    } catch (e) {
        console.error("[AURA Cart] Error reading localStorage cart:", e);
        saveCart([]);
        return [];
    }
}

/**
 * Saves cart array to localStorage and dispatches sync event.
 */
function saveCart(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
        console.error("[AURA Cart] Error writing to localStorage:", e);
    }

    // Dispatch custom DOM event for same-tab sync
    window.dispatchEvent(new CustomEvent('aura-cart-updated', {
        detail: { cart, totalItems: getCartItemCount(cart) }
    }));
}

/**
 * Adds a product to the cart or increments existing quantity.
 */
function addToCart(productId, quantity = 1) {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
        return { success: false, message: "Invalid quantity specified." };
    }

    const product = window.productsData ? window.productsData.find(p => p.id === productId) : null;
    if (!product) {
        return { success: false, message: "Product not found in store catalog." };
    }

    const stockLimit = product.stock || 99;
    let cart = getCart();
    let existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        const newQty = existingItem.quantity + qty;
        if (newQty > stockLimit) {
            existingItem.quantity = stockLimit;
            saveCart(cart);
            return {
                success: true,
                message: `Reached maximum stock limit of ${stockLimit} items.`,
                cart
            };
        }
        existingItem.quantity = newQty;
    } else {
        const initialQty = Math.min(qty, stockLimit);
        cart.push({ id: productId, quantity: initialQty });
    }

    saveCart(cart);
    return {
        success: true,
        message: `Added ${qty} × "${product.name}" to your cart.`,
        cart
    };
}

/**
 * Updates quantity of a specific cart item.
 */
function updateCartQuantity(productId, quantity) {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) return removeFromCart(productId);

    const product = window.productsData ? window.productsData.find(p => p.id === productId) : null;
    const stockLimit = product ? (product.stock || 99) : 99;
    const targetQty = Math.min(qty, stockLimit);

    let cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity = targetQty;
        saveCart(cart);
    }
}

/**
 * Removes an item from the cart.
 */
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
}

/**
 * Empties the entire cart.
 */
function clearCart() {
    saveCart([]);
}

/**
 * Calculates total quantity count of products in cart.
 */
function getCartItemCount(cart = getCart()) {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
}

/**
 * Computes detailed pricing, subtotal, savings, shipping, and final total.
 */
function getCartCalculations() {
    const cart = getCart();
    const items = [];
    let subtotal = 0;
    let totalSavings = 0;

    cart.forEach(cartItem => {
        const product = window.productsData ? window.productsData.find(p => p.id === cartItem.id) : null;
        if (product) {
            const itemTotal = product.price * cartItem.quantity;
            subtotal += itemTotal;

            if (product.originalPrice && product.originalPrice > product.price) {
                const savingsPerUnit = product.originalPrice - product.price;
                totalSavings += savingsPerUnit * cartItem.quantity;
            }

            items.push({
                product,
                quantity: cartItem.quantity,
                itemTotal,
                unitPrice: product.price,
                originalPrice: product.originalPrice
            });
        }
    });

    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (subtotal > 0 ? SHIPPING_FEE : 0);
    const finalTotal = subtotal + shipping;

    return {
        items,
        subtotal,
        totalSavings,
        shipping,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        shippingFee: SHIPPING_FEE,
        finalTotal,
        itemCount: getCartItemCount(cart)
    };
}

// Expose global namespace helper for easy access
window.AuraCart = {
    getCart,
    saveCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartItemCount,
    getCartCalculations,
    FREE_SHIPPING_THRESHOLD,
    SHIPPING_FEE
};
