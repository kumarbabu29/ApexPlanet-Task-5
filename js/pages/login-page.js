/**
 * AURA E-Commerce — Login Page Controller (Module 6)
 * Handles client-side authentication against localStorage users ("aura_users"),
 * manages session persistence (localStorage vs sessionStorage), and handles password recovery demo alerts.
 */

document.addEventListener('DOMContentLoaded', () => {
    initLoginPage();
});

function initLoginPage() {
    // Show contextual success banner when arriving from registration redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get('registered') === '1') {
        showFormAlert('Account created successfully. Please log in.', 'success');
    }

    const form = document.getElementById('login-form');
    const forgotLink = document.getElementById('forgot-password-link');

    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            showToast("Password recovery is not available in this frontend demo.");
        });
    }

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        clearErrors();

        const emailInput = document.getElementById('email-input');
        const passwordInput = document.getElementById('password-input');
        const rememberInput = document.getElementById('remember-checkbox');

        const email = (emailInput ? emailInput.value : '').trim();
        const password = passwordInput ? passwordInput.value : '';
        const rememberMe = rememberInput ? rememberInput.checked : false;

        let isValid = true;

        if (!email) {
            showError('email-error', 'Please enter your email address.');
            isValid = false;
        }

        if (!password) {
            showError('password-error', 'Please enter your password.');
            isValid = false;
        }

        if (!isValid) return;

        if (!window.AuraAuth) {
            showFormAlert("Authentication service unavailable.", "danger");
            return;
        }

        const res = window.AuraAuth.loginUser(email, password, rememberMe);

        if (!res.success) {
            showFormAlert(res.message, "danger");
        } else {
            showFormAlert(`Welcome back, ${res.user.name}! Redirecting...`, "success");
            showToast(`Welcome back, ${res.user.name}!`);

            const params = new URLSearchParams(window.location.search);
            const redirectUrl = params.get('redirect') || '../index.html';

            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 600);
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
