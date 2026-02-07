function handleUserAdmin() {
    if (checkAdminStatus()) {
        handleGoBack();
        return;
    }
    const code = prompt("Please enter the Admin Access Code:");

    if (code === null) return; // User cancelled

    if (code === "aDmIn1TwO3" || code === "admin") {
        sessionStorage.setItem('isAdmin', 'true');
        alert("Access Granted! Welcome, Admin.");
        updateAdminUI(true);
    } else {
        alert("Access Denied: Incorrect Code.");
    }
}

function handleGoBack() {
    sessionStorage.removeItem('isAdmin');
    updateAdminUI(false);
}

function checkAdminStatus() {
    return sessionStorage.getItem('isAdmin') === 'true';
}

function updateAdminUI(isAdmin) {
    const adminLinks = document.querySelectorAll('.admin-only');
    adminLinks.forEach(link => {
        link.style.display = isAdmin ? 'flex' : 'none';
    });

    const adminToggleBtn = document.getElementById('sidebar-admin-toggle');
    if (adminToggleBtn) {
        if (isAdmin) {
            adminToggleBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> Go Back';
            adminToggleBtn.onclick = handleGoBack;
            adminToggleBtn.title = 'Exit admin and return to student view';
        } else {
            adminToggleBtn.innerHTML = '<i class="fa-solid fa-users"></i> User Admin';
            adminToggleBtn.onclick = handleUserAdmin;
            adminToggleBtn.title = '';
        }
    }

    const dropdownAdminItems = document.querySelectorAll('.dropdown-item[data-admin-toggle]');
    dropdownAdminItems.forEach(el => {
        if (isAdmin) {
            el.textContent = 'Go Back';
            el.onclick = handleGoBack;
        } else {
            el.textContent = el.dataset.label || 'Support (Admin)';
            el.onclick = handleUserAdmin;
        }
    });
}

// Sidebar collapse styles (inject once)
function injectSidebarStyles() {
    if (document.getElementById('admin-sidebar-styles')) return;
    const style = document.createElement('style');
    style.id = 'admin-sidebar-styles';
    style.textContent = `
        .brand-with-actions { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
        .brand-text { flex: 1; min-width: 0; }
        .sidebar-toggle, .sidebar-open-btn { background: rgba(255,255,255,0.1); border: none; color: #9ca3af; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .sidebar-toggle:hover, .sidebar-open-btn:hover { background: rgba(255,255,255,0.2); color: white; }
        .sidebar-open-btn { position: fixed; left: 12px; top: 12px; z-index: 1001; display: none; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
        .sidebar-open-btn.show { display: flex; }
        @media (max-width: 768px) {
            .sidebar-open-btn.sidebar-open { display: none !important; }
        }
        .sidebar { transition: width 0.25s ease, min-width 0.25s ease, transform 0.25s ease; }
        .sidebar.sidebar--collapsed { width: 0 !important; min-width: 0 !important; padding: 0 !important; overflow: hidden !important; }
        .sidebar.sidebar--collapsed .brand-with-actions, .sidebar.sidebar--collapsed .menu-item, .sidebar.sidebar--collapsed .menu-category { opacity: 0; pointer-events: none; }
        @media (max-width: 768px) {
            .sidebar { position: fixed; left: 0; top: 0; bottom: 0; z-index: 1000; box-shadow: 4px 0 20px rgba(0,0,0,0.15); }
            .sidebar.sidebar--collapsed { transform: translateX(-100%); width: 260px !important; min-width: 260px !important; }
            .sidebar.sidebar--collapsed .brand-with-actions, .sidebar.sidebar--collapsed .menu-item, .sidebar.sidebar--collapsed .menu-category { opacity: 1; pointer-events: auto; }
            .sidebar-open-btn { display: flex; }
            .sidebar-open-btn.show { display: flex; }
            .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 999; }
            .sidebar-overlay.show { display: block; }
        }
    `;
    document.head.appendChild(style);
}

function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    injectSidebarStyles();

    const brand = sidebar.querySelector('.brand');
    if (brand && !sidebar.querySelector('.brand-icon')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'brand-with-actions';
        const textSpan = document.createElement('div');
        textSpan.className = 'brand-text';
        textSpan.innerHTML = brand.innerHTML;
        const icon = document.createElement('span');
        icon.className = 'brand-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.style.cssText = 'font-size: 1.25rem; margin-right: 6px; color: var(--card-gold, #fbbf24);';
        icon.innerHTML = '<i class="fa-solid fa-graduation-cap"></i>';
        textSpan.insertBefore(icon, textSpan.firstChild);
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'sidebar-toggle';
        toggle.setAttribute('aria-label', 'Close menu');
        toggle.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        toggle.onclick = () => {
            sidebar.classList.add('sidebar--collapsed');
            const openBtn = document.getElementById('sidebar-open-btn');
            const overlay = document.getElementById('sidebar-overlay');
            if (openBtn) {
                openBtn.classList.add('show');
                openBtn.classList.remove('sidebar-open');
            }
            if (overlay) overlay.classList.add('show');
        };
        wrapper.appendChild(textSpan);
        wrapper.appendChild(toggle);
        brand.innerHTML = '';
        brand.appendChild(wrapper);
    }

    let openBtn = document.getElementById('sidebar-open-btn');
    if (!openBtn) {
        openBtn = document.createElement('button');
        openBtn.type = 'button';
        openBtn.id = 'sidebar-open-btn';
        openBtn.className = 'sidebar-open-btn';
        openBtn.setAttribute('aria-label', 'Open menu');
        openBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        openBtn.onclick = () => {
            sidebar.classList.remove('sidebar--collapsed');
            openBtn.classList.remove('show');
            openBtn.classList.add('sidebar-open');
            const overlay = document.getElementById('sidebar-overlay');
            if (overlay) overlay.classList.remove('show');
        };
        document.body.appendChild(openBtn);
    }

    let overlay = document.getElementById('sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'sidebar-overlay';
        overlay.className = 'sidebar-overlay';
        overlay.onclick = () => {
            sidebar.classList.add('sidebar--collapsed');
            openBtn.classList.remove('show');
            openBtn.classList.remove('sidebar-open');
            overlay.classList.remove('show');
        };
        document.body.appendChild(overlay);
    }

    if (window.matchMedia('(max-width: 768px)').matches) {
        sidebar.classList.add('sidebar--collapsed');
        openBtn.classList.add('show');
    }
}

// Global Navigation Initialization
document.addEventListener('DOMContentLoaded', () => {
    const isAdmin = checkAdminStatus();
    updateAdminUI(isAdmin);
    initSidebar();

    // Toggle Menu Dropdown
    const menuBtn = document.getElementById('userAvatarBtn');
    const dropdown = document.getElementById('profileDropdown');

    if (menuBtn && dropdown) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });
    }
});

// Security: Disable F12 and Developer Tools shortcuts
document.addEventListener('keydown', (e) => {
    if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
    ) {
        e.preventDefault();
        console.warn("Developer Tools are disabled on this system.");
    }
});

// Disable right-click for extra security in a kiosk-like environment
document.addEventListener('contextmenu', (e) => e.preventDefault());
