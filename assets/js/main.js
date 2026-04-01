/* ============================================
   ACCOUNTS WORKSPACE - MAIN JAVASCRIPT
   Maintains original Google Apps Script logic approach
   ============================================ */

// Global Variables
let currentOpenSubmenu = null;
let sidebarCollapsed = false;
let currentUser = null;
let currentModule = 'dashboard';

// ============================================
// COMPATIBILITY LAYER - For modules using google.script.run
// ============================================

// Create a wrapper that mimics google.script.run for compatibility
window.google = {
  script: {
    run: (function() {
      // Store the current success and failure handlers
      let currentSuccessHandler = null;
      let currentFailureHandler = null;
      
      // Create the chainable object
      const chainable = {
        withSuccessHandler: function(callback) {
          currentSuccessHandler = callback;
          return chainable;
        },
        withFailureHandler: function(callback) {
          currentFailureHandler = callback;
          return chainable;
        }
      };
      
      // Add dynamic methods for all API actions
      const actions = [
        'getUserInfo',
        'processForm',
        'getNextPVNumber',
        'getPVNumbersByType',
        'getVoucherByNumber',
        'updateVoucher',
        'generateInventoryCategoryCode',
        'getInventoryCategories',
        'addNewInventory',
        'getPurchaseReportData',
        'getUsageReportData',
        'getInventoryListData',
        'recordInventoryUsage',
        'removeInventory',
        'generateAssetCode',
        'addNewAsset',
        'getDetailedRegister',
        'updateAssetStatus',
        'generateInvestmentCode',
        'addNewInvestment',
        'getInvestmentsByDateRange',
        'getMaturedInvestments',
        'getPVFormHTML',
        'getAddInventoryHTML',
        'getInventoryReportHTML',
        'getAddAssetHTML',
        'getAssetRegisterHTML',
        'getInvestmentAddHTML',
        'getInvestmentReportHTML'
      ];
      
      actions.forEach(action => {
        chainable[action] = function(...args) {
          // Map the action to API methods
          const actionMap = {
            // User
            'getUserInfo': () => API.getUserInfo(),
            
            // Payment Voucher
            'processForm': () => API.processForm(args[0]),
            'getNextPVNumber': () => API.getNextPVNumber(args[0]),
            'getPVNumbersByType': () => API.getPVNumbersByType(),
            'getVoucherByNumber': () => API.getVoucherByNumber(args[0], args[1]),
            'updateVoucher': () => API.updateVoucher(args[0]),
            
            // Inventory
            'generateInventoryCategoryCode': () => API.generateInventoryCategoryCode(),
            'getInventoryCategories': () => API.getInventoryCategories(),
            'addNewInventory': () => API.addNewInventory(args[0]),
            'getPurchaseReportData': () => API.getPurchaseReportData(args[0], args[1]),
            'getUsageReportData': () => API.getUsageReportData(args[0], args[1]),
            'getInventoryListData': () => API.getInventoryListData(),
            'recordInventoryUsage': () => API.recordInventoryUsage(args[0]),
            'removeInventory': () => API.removeInventory(args[0]),
            
            // Fixed Assets
            'generateAssetCode': () => API.generateAssetCode(args[0]),
            'addNewAsset': () => API.addNewAsset(args[0]),
            'getDetailedRegister': () => API.getDetailedRegister(),
            'updateAssetStatus': () => API.updateAssetStatus(args[0], args[1]),
            
            // Investment
            'generateInvestmentCode': () => API.generateInvestmentCode(args[0]),
            'addNewInvestment': () => API.addNewInvestment(args[0]),
            'getInvestmentsByDateRange': () => API.getInvestmentsByDateRange(args[0], args[1]),
            'getMaturedInvestments': () => API.getMaturedInvestments(args[0]),
            
            // HTML Module Loaders
            'getPVFormHTML': () => loadModuleFile('paymentVoucher'),
            'getAddInventoryHTML': () => loadModuleFile('inventoryAdd'),
            'getInventoryReportHTML': () => loadModuleFile('inventoryReport'),
            'getAddAssetHTML': () => loadModuleFile('addAsset'),
            'getAssetRegisterHTML': () => loadModuleFile('viewAssetRegister'),
            'getInvestmentAddHTML': () => loadModuleFile('investmentAdd'),
            'getInvestmentReportHTML': () => loadModuleFile('investmentReport')
          };
          
          const apiCall = actionMap[action];
          if (apiCall) {
            apiCall()
              .then(response => {
                if (currentSuccessHandler) {
                  currentSuccessHandler(response);
                }
              })
              .catch(error => {
                if (currentFailureHandler) {
                  currentFailureHandler(error);
                } else {
                  console.error('API call failed:', error);
                }
              });
          } else {
            console.error('Unknown action:', action);
            if (currentFailureHandler) {
              currentFailureHandler(new Error(`Unknown action: ${action}`));
            }
          }
          return chainable;
        };
      });
      
      return chainable;
    })()
  }
};

// Helper to load module HTML files
async function loadModuleFile(moduleName) {
  const modules = {
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
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading module file:', error);
    return '<div class="welcome-card"><i class="fas fa-exclamation-circle welcome-icon"></i><h2>Error Loading Module</h2><p>Could not load module. Please try again.</p></div>';
  }
}

// ============================================
// INITIALIZATION
// ============================================

window.onload = function() {
  initializeApp();
};

function initializeApp() {
  loadUserInfo();
  setupEventListeners();
  loadContent('dashboard');
  
  // Check if sidebar should be collapsed based on screen size
  if (window.innerWidth <= 768) {
    sidebarCollapsed = true;
    document.getElementById('sidebar').classList.add('collapsed');
  }
}

function setupEventListeners() {
  // Close user dropdown when clicking outside
  document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenu && !userMenu.contains(event.target)) {
      if (userDropdown) userDropdown.classList.remove('show');
    }
  });
}

// ============================================
// USER INFORMATION
// ============================================

function loadUserInfo() {
  const userNameEl = document.getElementById('userName');
  if (userNameEl) {
    userNameEl.textContent = 'Loading...';
  }
  
  google.script.run
    .withSuccessHandler(function(user) {
      currentUser = user;
      document.getElementById('userName').textContent = user.name || 'User';
    })
    .withFailureHandler(function(error) {
      console.error('Error loading user:', error);
      document.getElementById('userName').textContent = 'Guest';
    })
    .getUserInfo();
}

// ============================================
// UI HELPERS
// ============================================

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.querySelector('.main-content');
  
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('show-mobile');
  } else {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    sidebarCollapsed = sidebar.classList.contains('collapsed');
    
    // Close all submenus when sidebar is collapsed
    if (sidebarCollapsed) {
      document.querySelectorAll('.submenu').forEach(menu => {
        menu.classList.remove('show');
      });
      document.querySelectorAll('.dropdown-icon').forEach(icon => {
        icon.classList.remove('rotated');
      });
      currentOpenSubmenu = null;
    }
  }
}

function toggleUserMenu() {
  const dropdown = document.getElementById('userDropdown');
  dropdown.classList.toggle('show');
}

function toggleSubmenu(submenuId) {
  if (sidebarCollapsed && window.innerWidth > 768) return;
  
  const submenu = document.getElementById(submenuId);
  const icon = document.getElementById(submenuId.replace('Submenu', 'Icon'));
  
  // Close other submenus
  if (currentOpenSubmenu && currentOpenSubmenu !== submenu) {
    currentOpenSubmenu.classList.remove('show');
    const prevIcon = document.getElementById(currentOpenSubmenu.id.replace('Submenu', 'Icon'));
    if (prevIcon) prevIcon.classList.remove('rotated');
  }
  
  submenu.classList.toggle('show');
  if (icon) icon.classList.toggle('rotated');
  currentOpenSubmenu = submenu.classList.contains('show') ? submenu : null;
}

// ============================================
// LOADING MODAL
// ============================================

function showLoadingModal(message = 'Loading...') {
  let modal = document.getElementById('contentLoadingModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'contentLoadingModal';
    modal.className = 'content-loading-modal';
    document.body.appendChild(modal);
  }
  
  modal.innerHTML = `
    <div class="loading-modal-content">
      <div class="loading-spinner"></div>
      <p>${message}</p>
    </div>
  `;
  modal.style.display = 'flex';
}

function hideLoadingModal() {
  const modal = document.getElementById('contentLoadingModal');
  if (modal) modal.style.display = 'none';
}

// ============================================
// MODULE LOADING - Original Approach
// ============================================

function loadContent(module) {
  // Don't reload if already on this module
  if (currentModule === module) return;
  
  showLoadingModal('Loading...');
  currentModule = module;
  
  // Update active menu item
  updateActiveMenuItem(module);

  // Modules that load via server
  const serverModules = {
    'paymentVoucher': { 
      fn: 'getPVFormHTML', 
      initFn: 'initPVModule'
    },
    'inventoryAdd': { 
      fn: 'getAddInventoryHTML', 
      initFn: 'initInventoryModule'
    },
    'inventoryReport': { 
      fn: 'getInventoryReportHTML', 
      initFn: 'initInventoryReportModule'
    },
    'addAsset': { 
      fn: 'getAddAssetHTML', 
      initFn: 'initAssetModule'
    },
    'viewAssetRegister': { 
      fn: 'getAssetRegisterHTML', 
      initFn: 'initAssetRegisterModule'
    },
    'investmentAdd': { 
      fn: 'getInvestmentAddHTML', 
      initFn: 'initInvestmentModule'
    },
    'investmentReport': { 
      fn: 'getInvestmentReportHTML', 
      initFn: 'initInvestmentReportModule'
    }
  };

  // Check if module loads via server
  if (serverModules[module]) {
    const config = serverModules[module];
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.error('Module loading timeout for:', module);
      showErrorContent('Module took too long to load. Please try again.');
      hideLoadingModal();
    }, 10000);

    google.script.run
      .withSuccessHandler(function(htmlContent) {
        clearTimeout(timeoutId);
        
        if (!htmlContent) {
          console.error('No HTML content returned for module:', module);
          showErrorContent('Module returned empty content.');
          hideLoadingModal();
          closeSidebarMobile();
          return;
        }

        document.getElementById('mainContent').innerHTML = '<div class="content-wrapper">' + htmlContent + '</div>';
        
        setTimeout(() => {
          try {
            if (window[config.initFn] && typeof window[config.initFn] === 'function') {
              window[config.initFn]();
            }
          } catch (error) {
            console.error('Error initializing module:', error);
          }
          hideLoadingModal();
        }, 200);
        
        closeSidebarMobile();
      })
      .withFailureHandler(function(error) {
        clearTimeout(timeoutId);
        console.error('Error loading module:', error);
        showErrorContent('Could not load module. Please try again.');
        hideLoadingModal();
        closeSidebarMobile();
      })[config.fn]();
    
    return;
  }

  // Direct content generation for other modules
  const contentMap = {
    'dashboard': generateDashboardContent,
    'disposeAsset': generateDisposeAssetContent
  };

  const content = contentMap[module] 
    ? contentMap[module]() 
    : '<div class="welcome-card"><i class="fas fa-tools welcome-icon"></i><h2>Module Under Construction</h2><p>This feature is coming soon!</p></div>';

  document.getElementById('mainContent').innerHTML = '<div class="content-wrapper">' + content + '</div>';
  hideLoadingModal();
  closeSidebarMobile();
}

function updateActiveMenuItem(moduleName) {
  // Remove active class from all menu items
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Map module names to menu item onclick functions
  const moduleMap = {
    'dashboard': 'dashboard',
    'paymentVoucher': 'paymentVoucher',
    'inventoryAdd': 'inventoryAdd',
    'inventoryReport': 'inventoryReport',
    'addAsset': 'addAsset',
    'viewAssetRegister': 'viewAssetRegister',
    'investmentAdd': 'investmentAdd',
    'investmentReport': 'investmentReport'
  };
  
  // Find and activate the corresponding menu item
  const targetModule = moduleMap[moduleName];
  if (targetModule) {
    document.querySelectorAll('.menu-item').forEach(item => {
      const onclickAttr = item.getAttribute('onclick');
      if (onclickAttr && onclickAttr.includes(`'${targetModule}'`)) {
        item.classList.add('active');
      }
    });
  }
}

// ============================================
// CONTENT GENERATORS
// ============================================

function generateDashboardContent() {
  const userName = currentUser ? (currentUser.name || currentUser.email || 'User') : 'User';
  return `
    <div class="dashboard-container">
      <div class="welcome-card">
        <i class="fas fa-chart-line welcome-icon"></i>
        <h2>Welcome to Accounts Workspace</h2>
        <p id="dashboardWelcomeMessage">Welcome back, <strong>${userName}</strong>! Select a module from the sidebar to begin managing your accounts.</p>
      </div>
      <div class="module-quick-links">
        <h3><i class="fas fa-rocket"></i> Quick Access</h3>
        <div class="quick-links-grid">
          <div class="quick-link-card" onclick="loadContent('paymentVoucher')">
            <i class="fas fa-file-invoice-dollar"></i>
            <h4>Payment Voucher</h4>
            <p>Create and manage payment vouchers</p>
          </div>
          <div class="quick-link-card" onclick="loadContent('inventoryAdd')">
            <i class="fas fa-boxes"></i>
            <h4>Add Inventory</h4>
            <p>Add new inventory items</p>
          </div>
          <div class="quick-link-card" onclick="loadContent('inventoryReport')">
            <i class="fas fa-chart-bar"></i>
            <h4>Inventory Report</h4>
            <p>View inventory reports</p>
          </div>
          <div class="quick-link-card" onclick="loadContent('addAsset')">
            <i class="fas fa-building"></i>
            <h4>Add Asset</h4>
            <p>Add new fixed assets</p>
          </div>
          <div class="quick-link-card" onclick="loadContent('viewAssetRegister')">
            <i class="fas fa-list"></i>
            <h4>Asset Register</h4>
            <p>View asset register</p>
          </div>
          <div class="quick-link-card" onclick="loadContent('investmentAdd')">
            <i class="fas fa-chart-line"></i>
            <h4>Add Investment</h4>
            <p>Add new investments</p>
          </div>
          <div class="quick-link-card" onclick="loadContent('investmentReport')">
            <i class="fas fa-file-alt"></i>
            <h4>Investment Report</h4>
            <p>View investment reports</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateDisposeAssetContent() {
  return '<div class="welcome-card"><i class="fas fa-trash-alt welcome-icon"></i><h2>Dispose Asset</h2><p>Module under construction</p></div>';
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function showErrorContent(message) {
  document.getElementById('mainContent').innerHTML = '<div class="content-wrapper"><div class="welcome-card"><i class="fas fa-exclamation-circle welcome-icon"></i><h2>Error Loading Form</h2><p>' + message + '</p></div></div>';
}

function closeSidebarMobile() {
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('show-mobile');
  }
}

// ============================================
// MODULE INITIALIZERS (Placeholders)
// ============================================

function initPVModule() {
  console.log('Payment Voucher module loaded');
}

function initInventoryModule() {
  console.log('Inventory module loaded');
}

function initInventoryReportModule() {
  console.log('Inventory Report module loaded');
}

function initAssetModule() {
  console.log('Asset module loaded');
}

function initAssetRegisterModule() {
  console.log('Asset Register module loaded');
}

function initInvestmentModule() {
  console.log('Investment module loaded');
}

function initInvestmentReportModule() {
  console.log('Investment Report module loaded');
}

// ============================================
// USER FUNCTIONS
// ============================================

function showProfile() {
  alert('Profile feature coming soon');
}

function showSettings() {
  alert('Settings feature coming soon');
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    currentUser = null;
    alert('Logged out successfully');
    window.location.reload();
  }
}

// ============================================
// EXPORT FOR MODULES
// ============================================

// Make functions available globally
window.loadContent = loadContent;
window.toggleSidebar = toggleSidebar;
window.toggleUserMenu = toggleUserMenu;
window.toggleSubmenu = toggleSubmenu;
window.showLoadingModal = showLoadingModal;
window.hideLoadingModal = hideLoadingModal;
window.showProfile = showProfile;
window.showSettings = showSettings;
window.logout = logout;
window.initPVModule = initPVModule;
window.initInventoryModule = initInventoryModule;
window.initInventoryReportModule = initInventoryReportModule;
window.initAssetModule = initAssetModule;
window.initAssetRegisterModule = initAssetRegisterModule;
window.initInvestmentModule = initInvestmentModule;
window.initInvestmentReportModule = initInvestmentReportModule;

// Make loadContent available for quick links
window.loadContent = loadContent;

// ============================================
// ADD CSS FOR LOADING MODAL AND DASHBOARD
// ============================================

const homepageLoadingStyle = document.createElement('style');
homepageLoadingStyle.textContent = `
  .content-loading-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 999;
  }

  .loading-modal-content {
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    text-align: center;
    min-width: 150px;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #4361ee;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 15px auto;
  }

  .loading-modal-content p {
    color: #2d3748;
    font-size: 14px;
    font-weight: 500;
    margin: 0;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Dashboard Quick Links */
  .dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .module-quick-links {
    background: white;
    border-radius: 15px;
    padding: 25px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    margin-top: 30px;
  }

  .module-quick-links h3 {
    color: #2d3748;
    font-size: 18px;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .module-quick-links h3 i {
    color: #4361ee;
  }

  .quick-links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .quick-link-card {
    background: #f8fafc;
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid #e2e8f0;
  }

  .quick-link-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    border-color: #4361ee;
    background: white;
  }

  .quick-link-card i {
    font-size: 32px;
    color: #4361ee;
    margin-bottom: 12px;
    display: inline-block;
  }

  .quick-link-card h4 {
    color: #2d3748;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .quick-link-card p {
    color: #6c757d;
    font-size: 13px;
    line-height: 1.4;
    margin: 0;
  }

  @media (max-width: 768px) {
    .quick-links-grid {
      grid-template-columns: 1fr;
      gap: 15px;
    }
    
    .quick-link-card {
      padding: 15px;
    }
    
    .quick-link-card i {
      font-size: 28px;
    }
    
    .module-quick-links {
      padding: 20px;
    }
  }
`;
document.head.appendChild(homepageLoadingStyle);
