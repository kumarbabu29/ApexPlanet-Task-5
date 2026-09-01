/**
 * AURA E-Commerce — Client-Side Authentication Service (Module 6)
 *
 * DEVELOPER / SECURITY DISCLAIMER:
 * This authentication implementation is for educational/demo purposes only.
 * Credentials stored in browser storage are NOT secure and MUST NOT be used
 * for production authentication.
 *
 * Storage Keys:
 * - "aura_users": Registered user accounts array stored in localStorage.
 * - "aura_current_user": Active session stored in localStorage (if Remember Me) or sessionStorage.
 */

const USERS_STORAGE_KEY = 'aura_users';
const SESSION_STORAGE_KEY = 'aura_current_user';

/**
 * Retrieves registered users list safely.
 */
function getUsers() {
    try {
        const raw = localStorage.getItem(USERS_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("[AURA Auth] Corrupted users storage. Resetting.");
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
        return [];
    }
}

/**
 * Saves registered users list.
 */
function saveUsers(users) {
    try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
        console.error("[AURA Auth] Error saving users to localStorage:", e);
    }
}

/**
 * Retrieves active user session from localStorage or sessionStorage.
 */
function getCurrentUser() {
    try {
        // Check localStorage first (Remember Me), then sessionStorage
        const localRaw = localStorage.getItem(SESSION_STORAGE_KEY);
        if (localRaw) return JSON.parse(localRaw);

        const sessionRaw = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (sessionRaw) return JSON.parse(sessionRaw);

        return null;
    } catch (e) {
        console.error("[AURA Auth] Error reading session:", e);
        return null;
    }
}

/**
 * Saves user session without password data.
 */
function setSession(user, rememberMe = true) {
    const sessionData = {
        id: user.id,
        name: user.name,
        email: user.email
    };

    if (rememberMe) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
        localStorage.removeItem(SESSION_STORAGE_KEY);
    }

    window.dispatchEvent(new CustomEvent('aura-auth-updated', {
        detail: { user: sessionData }
    }));
}

/**
 * Registers a new user account.
 */
function registerUser({ name, email, password }) {
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = password || '';

    if (!cleanName || cleanName.length < 2) {
        return { success: false, message: "Full Name must be at least 2 characters." };
    }
    if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
        return { success: false, message: "Please enter a valid email address." };
    }
    if (!cleanPassword || cleanPassword.length < 8) {
        return { success: false, message: "Password must be at least 8 characters long." };
    }

    const users = getUsers();

    // Case-insensitive email duplicate check
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
        return { success: false, message: "An account with this email already exists." };
    }

    const newUser = {
        id: Date.now(),
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword
    };

    users.push(newUser);
    saveUsers(users);

    // Auto-login newly registered user
    setSession(newUser, true);

    return { success: true, message: "Account created successfully!", user: newUser };
}

/**
 * Authenticates user credentials.
 */
function loginUser(email, password, rememberMe = false) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = password || '';

    if (!cleanEmail || !cleanPassword) {
        return { success: false, message: "Please enter both email and password." };
    }

    const users = getUsers();
    const targetUser = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword);

    if (!targetUser) {
        return { success: false, message: "Invalid email or password." };
    }

    setSession(targetUser, rememberMe);

    return { success: true, message: `Welcome back, ${targetUser.name}!`, user: targetUser };
}

/**
 * Logs out active user session.
 */
function logoutUser() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);

    window.dispatchEvent(new CustomEvent('aura-auth-updated', {
        detail: { user: null }
    }));
}

/**
 * Checks if user is logged in.
 */
function isLoggedIn() {
    return Boolean(getCurrentUser());
}

// Expose global namespace helper
window.AuraAuth = {
    getUsers,
    getCurrentUser,
    registerUser,
    loginUser,
    logoutUser,
    isLoggedIn
};
