// Global layout functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Layout loaded');
    
    // Initialize components
    initSidebar();
    initUserMenu();
    initDropdowns();
    initActiveLinks();
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
});

// Sidebar functionality
function initSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const contentArea = document.getElementById('contentArea');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            contentArea.classList.toggle('expanded');
            
            // Store preference
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
        });
    }
    
    // Restore sidebar state
    const wasCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (wasCollapsed && window.innerWidth > 768) {
        sidebar?.classList.add('collapsed');
        contentArea?.classList.add('expanded');
    }
}

// User menu functionality
function initUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }
    
    // User menu actions
    document.getElementById('profileLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.showNotification('Profile feature coming soon!', 'info');
    });
    
    document.getElementById('settingsLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.showNotification('Settings feature coming soon!', 'info');
    });
    
    document.getElementById('logoutLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });
}

// Dropdown menu functionality
function initDropdowns() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const dropdown = this.closest('.dropdown');
            
            // Close other dropdowns
            document.querySelectorAll('.dropdown.active').forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('active');
                }
            });
            
            // Toggle current dropdown
            dropdown.classList.toggle('active');
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown.active').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
}

// Set active link based on current page
function initActiveLinks() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.menu-btn, .dropdown-content a');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href)) {
            link.classList.add('active');
            
            // If in dropdown, activate parent dropdown
            const parentDropdown = link.closest('.dropdown');
            if (parentDropdown) {
                parentDropdown.classList.add('active');
            }
        }
    });
}

// Handle window resize
function handleResize() {
    const sidebar = document.getElementById('sidebar');
    const contentArea = document.getElementById('contentArea');
    
    if (window.innerWidth <= 768) {
        sidebar?.classList.remove('collapsed');
        contentArea?.classList.remove('expanded');
    } else {
        const wasCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (wasCollapsed) {
            sidebar?.classList.add('collapsed');
            contentArea?.classList.add('expanded');
        }
    }
}

// FIXED: Logout handler - Use relative path that works from any page
function handleLogout() {
    window.showLoading();
    
    // Clear user session
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    setTimeout(() => {
        window.hideLoading();
        // Navigate back to homepage using relative path from current location
        // This will work from both root and nested module pages
        window.location.href = '../homepage.html';
        window.showNotification('Logged out successfully', 'success');
    }, 1000);
}

// Global functions
window.toggleSidebar = function() {
    document.getElementById('menuToggle')?.click();
};

window.showLoading = function() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('show');
    }
};

window.hideLoading = function() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
};

window.showNotification = function(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
};
