/* ============================================
   ACCOUNTS WORKSPACE - API MODULE
   All API calls to Google Apps Script backend
   ============================================ */

const API = (function() {
    // Private variables
    let apiUrl = '';
    
    // Initialize with config
    function init() {
        apiUrl = window.APP_CONFIG ? window.APP_CONFIG.API_URL : '';
        if (!apiUrl || apiUrl.includes('YOUR_DEPLOYMENT_ID')) {
            console.warn('API not configured. Please update config.js with your Google Apps Script URL.');
        }
    }
    
    // Core API call function using JSONP (bypasses CORS)
    function call(action, data = {}) {
        return new Promise((resolve, reject) => {
            if (!apiUrl) {
                reject(new Error('API not configured. Please check config.js'));
                return;
            }
            
            // Generate a unique callback name
            const callbackName = 'api_callback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Build the URL with parameters
            const params = new URLSearchParams();
            params.append('action', action);
            params.append('callback', callbackName);
            
            // Add all data parameters
            for (const [key, value] of Object.entries(data)) {
                if (value !== undefined && value !== null) {
                    if (typeof value === 'object') {
                        params.append(key, JSON.stringify(value));
                    } else {
                        params.append(key, String(value));
                    }
                }
            }
            
            // Set timeout (30 seconds)
            const timeoutId = setTimeout(() => {
                if (window[callbackName]) {
                    delete window[callbackName];
                    reject(new Error('Request timeout'));
                }
            }, 30000);
            
            // Create the callback function
            window[callbackName] = function(response) {
                clearTimeout(timeoutId);
                delete window[callbackName];
                
                // Remove the script tag
                if (script && script.parentNode) {
                    script.parentNode.removeChild(script);
                }
                
                if (response && response.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response);
                }
            };
            
            // Create and add the script tag
            const script = document.createElement('script');
            script.src = apiUrl + '?' + params.toString();
            script.onerror = function() {
                clearTimeout(timeoutId);
                delete window[callbackName];
                if (script.parentNode) script.parentNode.removeChild(script);
                reject(new Error('Network error - failed to load script'));
            };
            
            document.head.appendChild(script);
        });
    }
    
    // ============================================
    // USER API
    // ============================================
    
    function getUserInfo() {
        return call('getUserInfo', {});
    }
    
    // ============================================
    // PAYMENT VOUCHER API
    // ============================================
    
    function processForm(formData) {
        return call('processForm', { formData: JSON.stringify(formData) });
    }
    
    function getNextPVNumber(voucherType) {
        return call('getNextPVNumber', { voucherType: voucherType });
    }
    
    function getPVNumbersByType() {
        return call('getPVNumbersByType', {});
    }
    
    function getVoucherByNumber(pvNumber, voucherType) {
        return call('getVoucherByNumber', { pvNumber: pvNumber, voucherType: voucherType });
    }
    
    function updateVoucher(formData) {
        return call('updateVoucher', { formData: JSON.stringify(formData) });
    }
    
    // ============================================
    // INVENTORY API
    // ============================================
    
    function generateInventoryCategoryCode() {
        return call('generateInventoryCategoryCode', {});
    }
    
    function getInventoryCategories() {
        return call('getInventoryCategories', {});
    }
    
    function getInventoryCategoryDetails(categoryCode) {
        return call('getInventoryCategoryDetails', { categoryCode: categoryCode });
    }
    
    function addNewInventory(formData) {
        return call('addNewInventory', { formData: JSON.stringify(formData) });
    }
    
    function restockInventory(formData) {
        return call('restockInventory', { formData: JSON.stringify(formData) });
    }
    
    function getPurchaseReportData(fromDate, toDate) {
        return call('getPurchaseReportData', { fromDate: fromDate, toDate: toDate });
    }
    
    function getUsageReportData(fromDate, toDate) {
        return call('getUsageReportData', { fromDate: fromDate, toDate: toDate });
    }
    
    function getInventoryListData() {
        return call('getInventoryListData', {});
    }
    
    function removeInventory(inventoryCode) {
        return call('removeInventory', { inventoryCode: inventoryCode });
    }
    
    function recordInventoryUsage(formData) {
        return call('recordInventoryUsage', { formData: JSON.stringify(formData) });
    }
    
    // ============================================
    // FIXED ASSETS API
    // ============================================
    
    function generateAssetCode(assetType) {
        return call('generateAssetCode', { assetType: assetType });
    }
    
    function getAssetLifeSpan(assetType) {
        return call('getAssetLifeSpan', { assetType: assetType });
    }
    
    function getDepreciationRate(assetType) {
        return call('getDepreciationRate', { assetType: assetType });
    }
    
    function addNewAsset(formData) {
        return call('addNewAsset', { formData: JSON.stringify(formData) });
    }
    
    function getDetailedRegister() {
        return call('getDetailedRegister', {});
    }
    
    function getSummaryRegister() {
        return call('getSummaryRegister', {});
    }
    
    function updateAssetStatus(assetName, newStatus) {
        return call('updateAssetStatus', { assetName: assetName, newStatus: newStatus });
    }
    
    // ============================================
    // INVESTMENT API
    // ============================================
    
    function generateInvestmentCode(investmentType) {
        return call('generateInvestmentCode', { investmentType: investmentType });
    }
    
    function addNewInvestment(formData) {
        return call('addNewInvestment', { formData: JSON.stringify(formData) });
    }
    
    function getInvestmentsByDateRange(fromDate, toDate) {
        return call('getInvestmentsByDateRange', { fromDate: fromDate, toDate: toDate });
    }
    
    function getUniqueInvestmentTypes() {
        return call('getUniqueInvestmentTypes', {});
    }
    
    function getUniqueBanks() {
        return call('getUniqueBanks', {});
    }
    
    function getMaturedInvestments(toDate) {
        return call('getMaturedInvestments', { toDate: toDate });
    }
    
    // ============================================
    // UTILITY API
    // ============================================
    
    function debugGetSheetColumns() {
        return call('debugGetSheetColumns', {});
    }
    
    // ============================================
    // PUBLIC API
    // ============================================
    
    return {
        init,
        
        // User
        getUserInfo,
        
        // Payment Voucher
        processForm,
        getNextPVNumber,
        getPVNumbersByType,
        getVoucherByNumber,
        updateVoucher,
        
        // Inventory
        generateInventoryCategoryCode,
        getInventoryCategories,
        getInventoryCategoryDetails,
        addNewInventory,
        restockInventory,
        getPurchaseReportData,
        getUsageReportData,
        getInventoryListData,
        removeInventory,
        recordInventoryUsage,
        
        // Fixed Assets
        generateAssetCode,
        getAssetLifeSpan,
        getDepreciationRate,
        addNewAsset,
        getDetailedRegister,
        getSummaryRegister,
        updateAssetStatus,
        
        // Investment
        generateInvestmentCode,
        addNewInvestment,
        getInvestmentsByDateRange,
        getUniqueInvestmentTypes,
        getUniqueBanks,
        getMaturedInvestments,
        
        // Utility
        debugGetSheetColumns
    };
})();

// Initialize API when script loads
if (window.APP_CONFIG) {
    API.init();
}
