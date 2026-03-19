const DOM = {
    menuToggle: document.getElementById('menuToggle'),
    sidebar: document.getElementById('sidebar'),
    contentArea: document.getElementById('contentArea'),
    userMenuBtn: document.getElementById('userMenuBtn'),
    userDropdown: document.getElementById('userDropdown'),
    userNameElement: document.getElementById('userName'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    statVouchers: document.getElementById('statVouchers'),
    statInventory: document.getElementById('statInventory'),
    statAssets: document.getElementById('statAssets'),
    statInvestments: document.getElementById('statInvestments')
};

/**
 * Initialize application on DOM ready
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Accounts Workspace Homepage');
    
    initializeSidebar();
    initializeUserMenu();
    initializeDropdowns();
    setupEventListeners();
    loadDashboardStats();
    setupStatCards();
    
    console.log('✅ Homepage initialization complete');
});

/**
 * Initialize sidebar functionality
 */
function initializeSidebar() {
    if (!DOM.menuToggle || !DOM.sidebar) return;

    DOM.menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        DOM.sidebar.classList.toggle('collapsed');
        DOM.contentArea.classList.toggle('expanded');
        
        // Persist state
        const isCollapsed = DOM.sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    });

    // Restore sidebar state
    const wasCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (wasCollapsed && window.innerWidth > 768) {
        DOM.sidebar.classList.add('collapsed');
        DOM.contentArea.classList.add('expanded');
    }

    // Close sidebar on mobile when clicking a link
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                DOM.sidebar.classList.remove('active');
            }
        });
    });
}

/**
 * Initialize user menu dropdown
 */
function initializeUserMenu() {
    if (!DOM.userMenuBtn || !DOM.userDropdown) return;

    // Toggle dropdown on button click
    DOM.userMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        DOM.userDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!DOM.userMenuBtn.contains(e.target) && 
            !DOM.userDropdown.contains(e.target)) {
            DOM.userDropdown.classList.remove('show');
        }
    });

    // Setup user menu links
    const profileLink = document.getElementById('profileLink');
    const settingsLink = document.getElementById('settingsLink');
    const logoutLink = document.getElementById('logoutLink');

    profileLink?.addEventListener('click', (e) => {
        e.preventDefault();
        showNotification('Profile feature coming soon!', 'info');
    });

    settingsLink?.addEventListener('click', (e) => {
        e.preventDefault();
        showNotification('Settings feature coming soon!', 'info');
    });

    logoutLink?.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });

    // Load and display user name
    loadUserInfo();
}

/**
 * Initialize dropdown menus
 */
function initializeDropdowns() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const dropdown = this.closest('.dropdown');
            if (!dropdown) return;

            // Close other dropdowns
            document.querySelectorAll('.dropdown.active').forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('active');
                    const arrow = d.querySelector('.dropdown-toggle');
                    if (arrow) arrow.setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current dropdown
            dropdown.classList.toggle('active');
            this.setAttribute('aria-expanded', 
                dropdown.classList.contains('active'));
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown.active').forEach(dropdown => {
                dropdown.classList.remove('active');
                const toggle = dropdown.querySelector('.dropdown-toggle');
                if (toggle) toggle.setAttribute('aria-expanded', 'false');
            });
        }
    });
}

/**
 * Setup general event listeners
 */
function setupEventListeners() {
    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > 768) {
            DOM.sidebar?.classList.remove('active');
        }
    }, 250));

    // Handle keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Alt + M: Toggle sidebar
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            DOM.menuToggle?.click();
        }
        // Escape: Close dropdowns
        if (e.key === 'Escape') {
            DOM.userDropdown?.classList.remove('show');
            document.querySelectorAll('.dropdown.active').forEach(d => {
                d.classList.remove('active');
            });
        }
    });
}

/**
 * Load dashboard statistics from API
 */
async function loadDashboardStats() {
    try {
        showLoading();
        const stats = await APIClient.getDashboardStats();
        
        // Update stat cards
        DOM.statVouchers.textContent = formatNumber(stats.vouchers || 0);
        DOM.statInventory.textContent = formatNumber(stats.inventory || 0);
        DOM.statAssets.textContent = formatNumber(stats.assets || 0);
        DOM.statInvestments.textContent = formatNumber(stats.investments || 0);
        
        console.log('✅ Dashboard stats loaded:', stats);
    } catch (error) {
        console.error('❌ Error loading stats:', error);
        showNotification('Failed to load dashboard statistics', 'error');
        
        // Set default values
        DOM.statVouchers.textContent = '0';
        DOM.statInventory.textContent = '0';
        DOM.statAssets.textContent = '0';
        DOM.statInvestments.textContent = '0';
    } finally {
        hideLoading();
    }
}

/**
 * Setup stat card click handlers
 */
function setupStatCards() {
    const statCards = document.querySelectorAll('.stat-card');

    statCards.forEach((card, index) => {
        card.addEventListener('click', function() {
            const stat = this.getAttribute('data-stat');
            navigateToModule(stat);
        });

        // Keyboard navigation
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });

        // Make clickable via keyboard
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
    });
}

/**
 * Navigate to appropriate module based on stat clicked
 */
function navigateToModule(stat) {
    const moduleMap = {
        'vouchers': 'modules/payment-voucher/payment-voucher.html',
        'inventory': 'modules/inventory/viewinventoryreport.html',
        'assets': 'modules/fixed-assets/assetregister.html',
        'investments': 'modules/investments/investmentreport.html'
    };

    const url = moduleMap[stat];
    if (url) {
        window.location.href = url;
    }
}

/**
 * Load and display user information
 */
async function loadUserInfo() {
    try {
        // Try to get user from session/localStorage
        const user = JSON.parse(
            sessionStorage.getItem('user') || 
            localStorage.getItem('user') || 
            'null'
        );

        if (user && user.name) {
            if (DOM.userNameElement) {
                DOM.userNameElement.textContent = user.name.split(' ')[0];
            }
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

/**
 * Handle user logout
 */
async function handleLogout() {
    try {
        showLoading();
        
        // Clear session/storage
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        sessionStorage.clear();
        
        showNotification('Logged out successfully', 'success');
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error logging out', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Show loading overlay
 */
function showLoading() {
    if (DOM.loadingOverlay) {
        DOM.loadingOverlay.classList.add('show');
    }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    if (DOM.loadingOverlay) {
        DOM.loadingOverlay.classList.remove('show');
    }
}

/**
 * Show notification message
 * @param {string} message - Message text
 * @param {string} type - Notification type (success, error, info, warning)
 * @param {number} duration - Display duration in milliseconds
 */
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

/**
 * Format number with thousand separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Debounce function for event handlers
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for event handlers
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit time in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Expose notification to global scope for use in other modules
window.showNotification = showNotification;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
