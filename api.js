/**
 * ACCOUNTS WORKSPACE - API CLIENT
 * Central API configuration and request handler
 * Version: 1.0.0
 */

const API_CONFIG = {
    // Google Apps Script deployment URL
    BASE_URL: 'https://script.google.com/macros/s/AKfycbwk6o0_nyJtiwUF1c7jQqOgjEqmaSgnoIokuFQ93gaK82r97o109Y3ydpTKyoUesvM5vA/exec',
    
    // Request timeout in milliseconds
    TIMEOUT: 30000,
    
    // API endpoints
    ENDPOINTS: {
        // Payment Voucher
        PAYMENT_VOUCHER_CREATE: 'payment_voucher_create',
        PAYMENT_VOUCHER_GET: 'payment_voucher_get',
        PAYMENT_VOUCHER_GET_ALL: 'payment_voucher_get_all',
        PAYMENT_VOUCHER_UPDATE: 'payment_voucher_update',
        PAYMENT_VOUCHER_DELETE: 'payment_voucher_delete',
        
        // Inventory
        INVENTORY_ADD: 'inventory_add',
        INVENTORY_USED: 'inventory_used',
        INVENTORY_VIEW: 'inventory_view',
        INVENTORY_GET_ITEM: 'inventory_get_item',
        INVENTORY_UPDATE: 'inventory_update',
        INVENTORY_GET_LOW_STOCK: 'inventory_low_stock',
        
        // Fixed Assets
        ASSET_ADD: 'asset_add',
        ASSET_DISPOSE: 'asset_dispose',
        ASSET_SUMMARY: 'asset_summary',
        ASSET_DETAILED: 'asset_detailed',
        ASSET_GET_BY_ID: 'asset_get_by_id',
        ASSET_DEPRECIATE: 'asset_depreciate',
        
        // Investments
        INVESTMENT_ADD: 'investment_add',
        INVESTMENT_REPORT: 'investment_report',
        INVESTMENT_GET_ALL: 'investment_get_all',
        INVESTMENT_GET_BY_ID: 'investment_get_by_id',
        INVESTMENT_UPDATE_STATUS: 'investment_update_status',
        
        // Dashboard & Reports
        DASHBOARD_STATS: 'dashboard_stats',
        REPORT_PAYMENT_VOUCHER: 'report_payment_voucher',
        REPORT_INVENTORY: 'report_inventory',
        REPORT_FIXED_ASSET: 'report_fixed_asset',
        REPORT_INVESTMENT: 'report_investment',
        
        // System
        SYSTEM_HEALTH: 'system_health',
        SYSTEM_SETUP: 'system_setup',
        SYSTEM_CLEAR_CACHE: 'system_clear_cache'
    }
};

/**
 * API Request Handler
 * Manages all HTTP requests to Google Apps Script backend
 */
const APIClient = {
    /**
     * Make a request to the API
     * @param {string} action - API action endpoint
     * @param {string} method - HTTP method (GET, POST)
     * @param {Object} data - Request payload (for POST)
     * @param {Object} params - Query parameters (for GET)
     * @returns {Promise<Object>} API response
     */
    async request(action, method = 'GET', data = null, params = {}) {
        try {
            if (!action) {
                throw new Error('Action parameter is required');
            }

            // Build URL
            let url = `${API_CONFIG.BASE_URL}?action=${encodeURIComponent(action)}`;
            
            // Add query parameters for GET requests
            if (method === 'GET' && Object.keys(params).length > 0) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        url += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
                    }
                });
            }

            // Prepare request options
            const options = {
                method: method,
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };

            // Add request body for POST
            if (method === 'POST' && data) {
                options.body = JSON.stringify(data);
            }

            // Make request with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Handle HTTP errors
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Parse response
            const responseData = await response.json();

            // Check for API-level errors
            if (!responseData.success) {
                throw new Error(responseData.error?.message || 'API request failed');
            }

            return responseData.data || responseData;

        } catch (error) {
            console.error('API Error:', {
                action,
                method,
                message: error.message,
                stack: error.stack
            });
            throw error;
        }
    },

    /**
     * Payment Voucher Methods
     */
    async createPaymentVoucher(voucherData) {
        return this.request(API_CONFIG.ENDPOINTS.PAYMENT_VOUCHER_CREATE, 'POST', voucherData);
    },

    async getPaymentVoucher(id) {
        return this.request(API_CONFIG.ENDPOINTS.PAYMENT_VOUCHER_GET, 'GET', null, { id });
    },

    async getAllPaymentVouchers(params = {}) {
        return this.request(API_CONFIG.ENDPOINTS.PAYMENT_VOUCHER_GET_ALL, 'GET', null, params);
    },

    async updatePaymentVoucher(id, voucherData) {
        return this.request(API_CONFIG.ENDPOINTS.PAYMENT_VOUCHER_UPDATE, 'POST', voucherData, { id });
    },

    async deletePaymentVoucher(id) {
        return this.request(API_CONFIG.ENDPOINTS.PAYMENT_VOUCHER_DELETE, 'POST', null, { id });
    },

    /**
     * Inventory Methods
     */
    async addInventoryItem(itemData) {
        return this.request(API_CONFIG.ENDPOINTS.INVENTORY_ADD, 'POST', itemData);
    },

    async recordUsedInventory(usageData) {
        return this.request(API_CONFIG.ENDPOINTS.INVENTORY_USED, 'POST', usageData);
    },

    async getInventoryItems(params = {}) {
        return this.request(API_CONFIG.ENDPOINTS.INVENTORY_VIEW, 'GET', null, params);
    },

    async getInventoryItem(id) {
        return this.request(API_CONFIG.ENDPOINTS.INVENTORY_GET_ITEM, 'GET', null, { id });
    },

    async updateInventoryItem(id, itemData) {
        return this.request(API_CONFIG.ENDPOINTS.INVENTORY_UPDATE, 'POST', itemData, { id });
    },

    async getLowStockItems(threshold = 10) {
        return this.request(API_CONFIG.ENDPOINTS.INVENTORY_GET_LOW_STOCK, 'GET', null, { threshold });
    },

    /**
     * Fixed Asset Methods
     */
    async addFixedAsset(assetData) {
        return this.request(API_CONFIG.ENDPOINTS.ASSET_ADD, 'POST', assetData);
    },

    async disposeAsset(id, disposalData) {
        return this.request(API_CONFIG.ENDPOINTS.ASSET_DISPOSE, 'POST', disposalData, { id });
    },

    async getAssetSummary(params = {}) {
        return this.request(API_CONFIG.ENDPOINTS.ASSET_SUMMARY, 'GET', null, params);
    },

    async getAssetDetailed(params = {}) {
        return this.request(API_CONFIG.ENDPOINTS.ASSET_DETAILED, 'GET', null, params);
    },

    async getAssetById(id) {
        return this.request(API_CONFIG.ENDPOINTS.ASSET_GET_BY_ID, 'GET', null, { id });
    },

    async depreciateAsset(id, depreciationData) {
        return this.request(API_CONFIG.ENDPOINTS.ASSET_DEPRECIATE, 'POST', depreciationData, { id });
    },

    /**
     * Investment Methods
     */
    async addInvestment(investmentData) {
        return this.request(API_CONFIG.ENDPOINTS.INVESTMENT_ADD, 'POST', investmentData);
    },

    async getInvestmentReport(params = {}) {
        return this.request(API_CONFIG.ENDPOINTS.INVESTMENT_REPORT, 'GET', null, params);
    },

    async getAllInvestments(params = {}) {
        return this.request(API_CONFIG.ENDPOINTS.INVESTMENT_GET_ALL, 'GET', null, params);
    },

    async getInvestmentById(id) {
        return this.request(API_CONFIG.ENDPOINTS.INVESTMENT_GET_BY_ID, 'GET', null, { id });
    },

    async updateInvestmentStatus(id, statusData) {
        return this.request(API_CONFIG.ENDPOINTS.INVESTMENT_UPDATE_STATUS, 'POST', statusData, { id });
    },

    /**
     * Dashboard Methods
     */
    async getDashboardStats() {
        try {
            const stats = await this.request(API_CONFIG.ENDPOINTS.DASHBOARD_STATS, 'GET');
            return {
                vouchers: stats.totalVouchers || 0,
                inventory: stats.totalInventoryItems || 0,
                assets: stats.totalAssets || 0,
                investments: stats.totalInvestments || 0
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return {
                vouchers: 0,
                inventory: 0,
                assets: 0,
                investments: 0
            };
        }
    },

    /**
     * Report Methods
     */
    async generatePaymentVoucherReport(params = {}) {
        return this.request(API_CONFIG.ENDPOINTS.REPORT_PAYMENT_VOUCHER, 'GET', null, params);
    },

    async generateInventoryReport(params = {}) {
        return this.request(API_CONFIG.ENDPOINTS.REPORT_INVENTORY, 'GET', null, params);
    },

    async generateFixedAssetReport(params = {}) {
        return this.request(API_CONFIG.ENDPOINTS.REPORT_FIXED_ASSET, 'GET', null, params);
    },

    async generateInvestmentReport(params = {}) {
        return this.request(API_CONFIG.ENDPOINTS.REPORT_INVESTMENT, 'GET', null, params);
    },

    /**
     * System Methods
     */
    async getSystemHealth() {
        return this.request(API_CONFIG.ENDPOINTS.SYSTEM_HEALTH, 'GET');
    },

    async setupSystem() {
        return this.request(API_CONFIG.ENDPOINTS.SYSTEM_SETUP, 'POST');
    },

    async clearCache() {
        return this.request(API_CONFIG.ENDPOINTS.SYSTEM_CLEAR_CACHE, 'POST');
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, API_CONFIG };
}
