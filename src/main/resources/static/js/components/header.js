// =============================================
// header.js - Role-Specific Navigation Header
// =============================================

function renderHeader(role) {
    const header = document.getElementById('dashboardHeader');
    if (!header) return;

    const titles = { admin: 'Admin Dashboard', doctor: 'Doctor Dashboard', patient: 'Patient Dashboard' };
    const navItems = `<span class="nav-title">${titles[role] || 'Dashboard'}</span>`;

    header.innerHTML = `
        <div class="header-bar">
            <div class="header-left">
                <h1 class="header-logo">Smart Clinic</h1>
                ${navItems}
            </div>
            <div class="header-right">
                <span class="header-role">${role.charAt(0).toUpperCase() + role.slice(1)}</span>
                <button class="btn btn-outline btn-sm" onclick="logout()">Logout</button>
            </div>
        </div>
    `;

    // Inject header styles if not present
    if (!document.getElementById('headerStyles')) {
        const style = document.createElement('style');
        style.id = 'headerStyles';
        style.textContent = `
            .header-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 14px 24px;
                background: var(--white);
                border-bottom: 1px solid var(--gray-200);
                box-shadow: var(--shadow);
            }
            .header-left {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            .header-logo {
                font-size: 18px;
                font-weight: 700;
                color: var(--primary);
            }
            .nav-title {
                font-size: 14px;
                color: var(--gray-500);
                padding-left: 20px;
                border-left: 1px solid var(--gray-200);
            }
            .header-right {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .header-role {
                font-size: 13px;
                color: var(--gray-500);
                background: var(--gray-100);
                padding: 4px 12px;
                border-radius: 20px;
            }
            .btn-sm {
                padding: 6px 14px;
                font-size: 13px;
            }
        `;
        document.head.appendChild(style);
    }
}
