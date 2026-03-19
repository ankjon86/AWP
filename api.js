// Central API configuration for Google Apps Script backend
const API = {
    // IMPORTANT: Replace this with your actual deployed URL
    BASE_URL: 'https://script.google.com/macros/s/AKfycbwk6o0_nyJtiwUF1c7jQqOgjEqmaSgnoIokuFQ93gaK82r97o109Y3ydpTKyoUesvMv5A/exec',
    
    endpoints: {
        PAYMENT_VOUCHER: 'payment_voucher',
        INVENTORY_ADD: 'inventory_add',
        INVENTORY_USED: 'inventory_used',
        INVENTORY_VIEW: 'inventory_view',
        ASSET_ADD: 'asset_add',
        ASSET_SUMMARY: 'asset_summary',
        ASSET_DETAILED: 'asset_detailed',
        INVESTMENT_ADD: 'investment_add',
        INVESTMENT_REPORT: 'investment_report',
        DASHBOARD_STATS: 'dashboard_stats',
        TEST: 'test' // Added test endpoint
    }
};

window.api = {
    async request(action, method = 'GET', data = null) {
        // Show loading overlay
        this.showLoading();
        
        try {
            // Add timestamp to prevent caching
            let url = `${API.BASE_URL}?action=${action}&t=${Date.now()}`;
            
            // Add query parameters for GET requests with data
            if (method === 'GET' && data) {
                const params = new URLSearchParams(data);
                url += `&${params.toString()}`;
            }
            
            let options = {
                method: method,
                mode: 'cors',
                headers: { 
                    'Content-Type': 'application/json',
                },
                redirect: 'follow'
            };
            
            if (method === 'POST' && data) {
                options.body = JSON.stringify(data);
            }
            
            console.log(`API Request: ${method} ${action}`, data); // Debug log
            
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseText = await response.text();
            console.log('API Response:', responseText); // Debug log
            
            // Handle empty responses
            if (!responseText || responseText.trim() === '') {
                throw new Error('Empty response from server');
            }
            
            try {
                return JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse JSON:', responseText);
                throw new Error('Invalid JSON response from server');
            }
        } catch (error) {
            console.error('API Error:', error);
            this.showNotification(error.message, 'error');
            throw error;
        } finally {
            this.hideLoading();
        }
    },
    
    // Test connection
    async testConnection() {
        try {
            const result = await this.request(API.endpoints.TEST);
            console.log('Connection test successful:', result);
            this.showNotification('API connected successfully!', 'success');
            return result;
        } catch (error) {
            console.error('Connection test failed:', error);
            this.showNotification('Failed to connect to API', 'error');
            throw error;
        }
    },
    
    // Payment Voucher methods
    async savePaymentVoucher(data) {
        return this.request(API.endpoints.PAYMENT_VOUCHER, 'POST', data);
    },
    
    async getPaymentVouchers(params = {}) {
        return this.request(API.endpoints.PAYMENT_VOUCHER, 'GET', params);
    },
    
    // Inventory methods
    async addInventoryItem(data) {
        return this.request(API.endpoints.INVENTORY_ADD, 'POST', data);
    },
    
    async getInventoryItems(params = {}) {
        return this.request(API.endpoints.INVENTORY_VIEW, 'GET', params);
    },
    
    async recordUsedInventory(data) {
        return this.request(API.endpoints.INVENTORY_USED, 'POST', data);
    },
    
    // Fixed Asset methods
    async addFixedAsset(data) {
        return this.request(API.endpoints.ASSET_ADD, 'POST', data);
    },
    
    async getAssetSummary() {
        return this.request(API.endpoints.ASSET_SUMMARY);
    },
    
    async getAssetDetailed() {
        return this.request(API.endpoints.ASSET_DETAILED);
    },
    
    // Investment methods
    async addInvestment(data) {
        return this.request(API.endpoints.INVESTMENT_ADD, 'POST', data);
    },
    
    async getInvestmentReport() {
        return this.request(API.endpoints.INVESTMENT_REPORT);
    },
    
    // Dashboard methods
    async getDashboardStats() {
        try {
            const response = await this.request(API.endpoints.DASHBOARD_STATS);
            
            // Handle different response structures
            if (response && response.success && response.data) {
                return response.data;
            } else if (response && response.data) {
                return response.data;
            } else {
                return response;
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Return default values on error
            return { 
                vouchers: 0, 
                inventory: 0, 
                assets: 0, 
                investments: 0 
            };
        }
    },
    
    // Utility methods
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.classList.add('show');
    },
    
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.classList.remove('show');
    },
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.setAttribute('role', 'alert');
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
};

// Auto-test connection on page load (optional)
document.addEventListener('DOMContentLoaded', function() {
    // Uncomment to test connection automatically
    // setTimeout(() => window.api.testConnection(), 1000);
});
