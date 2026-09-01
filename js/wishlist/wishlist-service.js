/**
 * AURA E-Commerce — Wishlist Service (Module 6)
 * Central engine for managing saved wishlist items using localStorage key "aura_wishlist".
 * Stores an array of unique product IDs: [1, 7, 15].
 * Dispatches the custom "aura-wishlist-updated" DOM event for real-time reactivity.
 */

const WISHLIST_STORAGE_KEY = 'aura_wishlist';

/**
 * Safely retrieves wishlist IDs array from localStorage.
 * Automatically recovers from corrupted JSON.
 */
function getWishlist() {
    try {
        const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            console.warn("[AURA Wishlist] Corrupted wishlist format. Resetting.");
            saveWishlist([]);
            return [];
        }
        // Deduplicate and filter non-numbers
        const cleanList = [...new Set(parsed.filter(id => typeof id === 'number' && id > 0))];
        if (cleanList.length !== parsed.length) {
            saveWishlist(cleanList);
        }
        return cleanList;
    } catch (e) {
        console.error("[AURA Wishlist] Error reading localStorage:", e);
        saveWishlist([]);
        return [];
    }
}

/**
 * Saves wishlist array to localStorage and dispatches sync event.
 */
function saveWishlist(wishlist) {
    try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
        console.error("[AURA Wishlist] Error saving to localStorage:", e);
    }

    window.dispatchEvent(new CustomEvent('aura-wishlist-updated', {
        detail: { wishlist, count: wishlist.length }
    }));
}

/**
 * Adds a product ID to the wishlist.
 */
function addToWishlist(productId) {
    const id = Number(productId);
    if (isNaN(id) || id <= 0) return false;

    let list = getWishlist();
    if (!list.includes(id)) {
        list.push(id);
        saveWishlist(list);
        return true;
    }
    return false;
}

/**
 * Removes a product ID from the wishlist.
 */
function removeFromWishlist(productId) {
    const id = Number(productId);
    let list = getWishlist();
    const updated = list.filter(item => item !== id);
    if (updated.length !== list.length) {
        saveWishlist(updated);
        return true;
    }
    return false;
}

/**
 * Toggles a product ID in the wishlist (adds if absent, removes if present).
 * Returns true if added, false if removed.
 */
function toggleWishlist(productId) {
    const id = Number(productId);
    if (isInWishlist(id)) {
        removeFromWishlist(id);
        return false;
    } else {
        addToWishlist(id);
        return true;
    }
}

/**
 * Checks if a product ID exists in the wishlist.
 */
function isInWishlist(productId) {
    const id = Number(productId);
    return getWishlist().includes(id);
}

/**
 * Returns total count of unique items in wishlist.
 */
function getWishlistCount() {
    return getWishlist().length;
}

/**
 * Clears the entire wishlist.
 */
function clearWishlist() {
    saveWishlist([]);
}

// Expose global namespace helper
window.AuraWishlist = {
    getWishlist,
    saveWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    getWishlistCount,
    clearWishlist
};
