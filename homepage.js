document.addEventListener('DOMContentLoaded', function() {
    console.log('Homepage loaded');
    initSidebar();
    initUserMenu();
    initDropdowns();
    loadDashboardStats();
    setupStatCards();
});


function initSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const contentArea = document.getElementById('contentArea');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            contentArea.classList.toggle('expanded');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
    }
    
    const wasCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (wasCollapsed && window.innerWidth > 768) {
        sidebar?.classList.add('collapsed');
        contentArea?.classList.add('expanded');
    }
}

function initUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        document.addEventListener('click', function(e) {
            if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }
    
    document.getElementById('profileLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        showNotification('Profile feature coming soon!', 'info');
    });
    
    document.getElementById('settingsLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        showNotification('Settings feature coming soon!', 'info');
    });
    
    document.getElementById('logoutLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });
}

function initDropdowns() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const dropdown = this.closest('.dropdown');
            
            document.querySelectorAll('.dropdown.active').forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });
            
            dropdown.classList.toggle('active');
        });
    });
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown.active').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
}

async function loadDashboardStats() {
    try {
        showLoading();
        const stats = await window.api.getDashboardStats();
        document.getElementById('statVouchers').textContent = stats.vouchers || 0;
        document.getElementById('statInventory').textContent = stats.inventory || 0;
        document.getElementById('statAssets').textContent = stats.assets || 0;
        document.getElementById('statInvestments').textContent = stats.investments || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
        document.getElementById('statVouchers').textContent = '0';
        document.getElementById('statInventory').textContent = '0';
        document.getElementById('statAssets').textContent = '0';
        document.getElementById('statInvestments').textContent = '0';
    } finally {
        hideLoading();
    }
}

function setupStatCards() {
    const statCards = document.querySelectorAll('.stat-card');
    statCards[0]?.addEventListener('click', () => {
        window.location.href = 'modules/payment-voucher/payment-voucher.html';
    });
    statCards[1]?.addEventListener('click', () => {
        window.location.href = 'modules/inventory/viewinventoryreport.html';
    });
    statCards[2]?.addEventListener('click', () => {
        window.location.href = 'modules/fixed-assets/assetregister.html';
    });
    statCards[3]?.addEventListener('click', () => {
        window.location.href = 'modules/investments/investmentreport.html';
    });
}

function handleLogout() {
    showLoading();
    localStorage.removeItem('user');
    sessionStorage.clear();
    setTimeout(() => {
        hideLoading();
        window.location.href = 'homepage.html';
        showNotification('Logged out successfully', 'success');
    }, 1000);
}

function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('show');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.remove('show');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}
