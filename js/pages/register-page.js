/**
 * AURA E-Commerce — Register Page Controller (Module 6)
 * Validates full name, email format, password criteria, confirmation matching,
 * and terms agreement. Registers account into localStorage ("aura_users").
 */

document.addEventListener('DOMContentLoaded', () => {
    initRegisterPage();
});

function initRegisterPage() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Reset previous inline errors
        clearErrors();

        const nameInput = document.getElementById('name-input');
        const emailInput = document.getElementById('email-input');
        const passwordInput = document.getElementById('password-input');
        const confirmInput = document.getElementById('confirm-password-input');
        const termsInput = document.getElementById('terms-checkbox');

        const name = (nameInput ? nameInput.value : '').trim();
        const email = (emailInput ? emailInput.value : '').trim();
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmInput ? confirmInput.value : '';
        const termsAccepted = termsInput ? termsInput.checked : false;

        let isValid = true;

        // Validation Rules
        if (!name || name.length < 2) {
            showError('name-error', 'Full Name must be at least 2 characters.');
            isValid = false;
        }

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            showError('email-error', 'Please enter a valid email address.');
            isValid = false;
        }

        if (!password || password.length < 8) {
            showError('password-error', 'Password must be at least 8 characters long.');
            isValid = false;
        }

        if (password !== confirmPassword) {
            showError('confirm-error', 'Passwords do not match.');
            isValid = false;
        }

        if (!termsAccepted) {
            showError('terms-error', 'You must agree to the Terms of Service to create an account.');
            isValid = false;
        }

        if (!isValid) return;

        if (!window.AuraAuth) {
            showFormAlert("Authentication service unavailable.", "danger");
            return;
        }

        const res = window.AuraAuth.registerUser({ name, email, password });

        if (!res.success) {
            showFormAlert(res.message, "danger");
        } else {
            showFormAlert("Account created successfully! Please log in.", "success");
            showToast(`Account created! Please log in, ${res.user.name}.`);
            // Log the user back out so they must sign in manually (per spec)
            if (window.AuraAuth) window.AuraAuth.logoutUser();
            setTimeout(() => {
                window.location.href = 'login.html?registered=1';
            }, 1200);
        }
    });
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
