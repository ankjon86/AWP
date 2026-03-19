// Central API configuration for Google Apps Script backend
const API = {
    BASE_URL: 'https://script.google.com/macros/s/AKfycbwk6o0_nyJtiwUF1c7jQqOgjEqmaSgnoIokuFQ93gaK82r97o109Y3ydpTKyoUesvM5vA/exec',
    
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
        DASHBOARD_STATS: 'dashboard_stats'
    }
};

window.api = {
    async request(action, method = 'GET', data = null) {
        try {
            let url = `${API.BASE_URL}?action=${action}`;
            let options = {
                method: method,
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' }
            };
            
            if (method === 'POST' && data) {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    async savePaymentVoucher(data) {
        return this.request(API.endpoints.PAYMENT_VOUCHER, 'POST', data);
    },
    
    async getPaymentVouchers() {
        return this.request(API.endpoints.PAYMENT_VOUCHER);
    },
    
    async addInventoryItem(data) {
        return this.request(API.endpoints.INVENTORY_ADD, 'POST', data);
    },
    
    async getInventoryItems() {
        return this.request(API.endpoints.INVENTORY_VIEW);
    },
    
    async recordUsedInventory(data) {
        return this.request(API.endpoints.INVENTORY_USED, 'POST', data);
    },
    
    async addFixedAsset(data) {
        return this.request(API.endpoints.ASSET_ADD, 'POST', data);
    },
    
    async getAssetSummary() {
        return this.request(API.endpoints.ASSET_SUMMARY);
    },
    
    async getAssetDetailed() {
        return this.request(API.endpoints.ASSET_DETAILED);
    },
    
    async addInvestment(data) {
        return this.request(API.endpoints.INVESTMENT_ADD, 'POST', data);
    },
    
    async getInvestmentReport() {
        return this.request(API.endpoints.INVESTMENT_REPORT);
    },
    
    async getDashboardStats() {
        try {
            const [vouchers, inventory, assets, investments] = await Promise.all([
                this.getPaymentVouchers().catch(() => []),
                this.getInventoryItems().catch(() => []),
                this.getAssetDetailed().catch(() => []),
                this.getInvestmentReport().catch(() => ({}))
            ]);
            
            return {
                vouchers: Array.isArray(vouchers) ? vouchers.length : 0,
                inventory: Array.isArray(inventory) ? inventory.length : 0,
                assets: Array.isArray(assets) ? assets.length : 0,
                investments: investments.summary?.count || 0
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return { vouchers: 0, inventory: 0, assets: 0, investments: 0 };
        }
    }
};
