// =============================================
// index.js - Role Selection, Login & Token Management
// =============================================

const API_BASE = '/api';

// --- Token / Auth Helpers ---

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function getRole() {
    return localStorage.getItem('role');
}

function setRole(role) {
    localStorage.setItem('role', role);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/';
}

function getAuthHeaders() {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? 'Bearer ' + token : ''
    };
}

function isLoggedIn() {
    return !!getToken();
}

function redirectToDashboard() {
    const role = getRole();
    if (role === 'admin') {
        window.location.href = '/admin/dashboard';
    } else if (role === 'doctor') {
        window.location.href = '/doctor/dashboard';
    }
}

// --- Role Selection ---

function initRoleSelector() {
    const roleBtns = document.querySelectorAll('.role-btn');
    const roleInput = document.getElementById('selectedRole');

    if (!roleBtns.length) return;

    roleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            roleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (roleInput) {
                roleInput.value = btn.dataset.role;
            }
            toggleLoginFields(btn.dataset.role);
        });
    });
}

function toggleLoginFields(role) {
    const emailGroup = document.getElementById('emailGroup');
    const usernameGroup = document.getElementById('usernameGroup');

    if (!emailGroup || !usernameGroup) return;

    if (role === 'admin') {
        emailGroup.style.display = 'none';
        usernameGroup.style.display = 'block';
    } else {
        emailGroup.style.display = 'block';
        usernameGroup.style.display = 'none';
    }
}

// --- Login ---

async function handleLogin(event) {
    event.preventDefault();

    const role = document.getElementById('selectedRole')?.value;
    const password = document.getElementById('password')?.value;
    const alertEl = document.getElementById('loginAlert');

    if (!role) {
        showAlert(alertEl, 'Please select a role.', 'error');
        return;
    }

    let endpoint, body;

    if (role === 'admin') {
        const username = document.getElementById('username')?.value;
        endpoint = `${API_BASE}/admin/login`;
        body = { username, password };
    } else {
        const email = document.getElementById('email')?.value;
        endpoint = `${API_BASE}/doctor/login`;
        body = { email, password };
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            const data = await response.json();
            setToken(data.token);
            setRole(role);
            redirectToDashboard();
        } else {
            const errorData = await response.json().catch(() => ({}));
            showAlert(alertEl, errorData.message || 'Invalid credentials.', 'error');
        }
    } catch (error) {
        showAlert(alertEl, 'Network error. Please try again.', 'error');
    }
}

// --- Alert Helper ---

function showAlert(el, message, type) {
    if (!el) return;
    el.textContent = message;
    el.className = 'alert show alert-' + type;
    setTimeout(() => {
        el.classList.remove('show');
    }, 4000);
}

// --- Init ---

document.addEventListener('DOMContentLoaded', () => {
    // If on login page
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        if (isLoggedIn()) {
            redirectToDashboard();
            return;
        }
        initRoleSelector();
        loginForm.addEventListener('submit', handleLogin);
    }
});
