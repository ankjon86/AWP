// Global state
let currentUser = null;
let currentOpenSubmenu = null;
let sidebarCollapsed = false;

// Module loading function
async function loadModule(moduleName) {
    showLoading();
    
    const modules = {
        'dashboard': 'modules/dashboard.html',
        'paymentVoucher': 'modules/payment-voucher.html',
        'inventoryAdd': 'modules/add-inventory.html',
        'inventoryReport': 'modules/inventory-report.html',
        'addAsset': 'modules/add-asset.html',
        'viewAssetRegister': 'modules/asset-register.html',
        'investmentAdd': 'modules/add-investment.html',
        'investmentReport': 'modules/investment-report.html'
    };
    
    try {
        const response = await fetch(modules[moduleName]);
        const html = await response.text();
        
        document.getElementById('mainContent').innerHTML = `<div class="content-wrapper">${html}</div>`;
        
        // Initialize module after load
        setTimeout(() => {
            if (window[`init${capitalize(moduleName)}`]) {
                window[`init${capitalize(moduleName)}`]();
            }
        }, 100);
        
        hideLoading();
        closeSidebarMobile();
    } catch (error) {
        console.error('Error loading module:', error);
        showError('Could not load module. Please try again.');
        hideLoading();
    }
}

// Helper functions
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('show-mobile');
    } else {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        sidebarCollapsed = sidebar.classList.contains('collapsed');
    }
}

function toggleSubmenu(submenuId) {
    if (sidebarCollapsed && window.innerWidth > 768) return;
    
    const submenu = document.getElementById(submenuId);
    const icon = document.getElementById(submenuId.replace('Submenu', 'Icon'));
    
    if (currentOpenSubmenu && currentOpenSubmenu !== submenu) {
        currentOpenSubmenu.classList.remove('show');
        const prevIcon = document.getElementById(currentOpenSubmenu.id.replace('Submenu', 'Icon'));
        if (prevIcon) prevIcon.classList.remove('rotated');
    }
    
    submenu.classList.toggle('show');
    if (icon) icon.classList.toggle('rotated');
    currentOpenSubmenu = submenu.classList.contains('show') ? submenu : null;
}

function formatCurrency(value) {
    if (!value || isNaN(value)) return '0.00';
    return parseFloat(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function closeSidebarMobile() {
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('show-mobile');
    }
}
