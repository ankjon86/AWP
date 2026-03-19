// Homepage specific functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Homepage loaded');
    
    // Load dashboard statistics
    loadDashboardStats();
    
    // Add click handlers for stat cards
    setupStatCards();
});

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        // Show loading
        window.showLoading();
        
        // Fetch statistics from API
        const stats = await window.api.getDashboardStats();
        
        // Update stat values
        document.getElementById('statVouchers').textContent = stats.vouchers || 0;
        document.getElementById('statInventory').textContent = stats.inventory || 0;
        document.getElementById('statAssets').textContent = stats.assets || 0;
        document.getElementById('statInvestments').textContent = stats.investments || 0;
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Use default values if API fails
        document.getElementById('statVouchers').textContent = '0';
        document.getElementById('statInventory').textContent = '0';
        document.getElementById('statAssets').textContent = '0';
        document.getElementById('statInvestments').textContent = '0';
    } finally {
        window.hideLoading();
    }
}

// Setup stat card click handlers
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
