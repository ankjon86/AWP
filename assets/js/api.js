// API Service for Google Apps Script Backend
class ApiService {
  constructor() {
    // UPDATE THIS with your Google Apps Script Web App URL
    this.BASE_URL = 'https://script.google.com/macros/s/AKfycbxFMMpImLf5BdTkOihOd4RZ-Kk70smJxse8M7sHFrTElgGKXheyOPyIyY0prvPPgVD8/exec';
    this.cache = new Map();
  }

  // Generic request method (JSONP)
  async request(action, data = {}, options = {}) {
    const showLoading = options.showLoading !== false;
    try {
      if (showLoading && window.Utils && window.Utils.showLoading) {
        window.Utils.showLoading(true);
      }

      return new Promise((resolve, reject) => {
        const callbackName = 'callback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const script = document.createElement('script');
        const url = new URL(this.BASE_URL);
        url.searchParams.append('action', action);
        url.searchParams.append('data', JSON.stringify(data));
        url.searchParams.append('callback', callbackName);
        
        window[callbackName] = (response) => {
          // Cleanup
          if (script.parentNode) document.head.removeChild(script);
          delete window[callbackName];
          
          if (showLoading && window.Utils && window.Utils.showLoading) {
            window.Utils.showLoading(false);
          }
          
          if (response && response.success !== false) {
            const cacheKey = `${action}_${JSON.stringify(data)}`;
            this.cache.set(cacheKey, response);
            resolve(response);
          } else {
            reject(new Error((response && response.error) || 'API request failed'));
          }
        };
        
        script.src = url.toString();
        script.onerror = () => {
          if (script.parentNode) document.head.removeChild(script);
          delete window[callbackName];
          if (showLoading && window.Utils && window.Utils.showLoading) {
            window.Utils.showLoading(false);
          }
          reject(new Error('Network error - failed to connect to server'));
        };
        
        document.head.appendChild(script);
        
        // Timeout after 30 seconds
        setTimeout(() => {
          if (script.parentNode) {
            document.head.removeChild(script);
            delete window[callbackName];
            if (showLoading && window.Utils && window.Utils.showLoading) {
              window.Utils.showLoading(false);
            }
            reject(new Error('Request timeout after 30 seconds'));
          }
        }, 30000);
      });
      
    } catch (error) {
      if (showLoading && window.Utils && window.Utils.showLoading) {
        window.Utils.showLoading(false);
      }
      throw error;
    }
  }

  // ============================================
  // USER API
  // ============================================
  
  async getUserInfo(options = {}) {
    return this.request('getUserInfo', {}, options);
  }

  // ============================================
  // PAYMENT VOUCHER API
  // ============================================
  
  async processForm(formData, options = {}) {
    return this.request('processForm', formData, options);
  }
  
  async getNextPVNumber(voucherType, options = {}) {
    return this.request('getNextPVNumber', { voucherType }, options);
  }
  
  async getPVNumbersByType(options = {}) {
    return this.request('getPVNumbersByType', {}, options);
  }
  
  async getVoucherByNumber(pvNumber, voucherType, options = {}) {
    return this.request('getVoucherByNumber', { pvNumber, voucherType }, options);
  }
  
  async updateVoucher(formData, options = {}) {
    return this.request('updateVoucher', formData, options);
  }

  // ============================================
  // INVENTORY API
  // ============================================
  
  async generateInventoryCategoryCode(options = {}) {
    return this.request('generateInventoryCategoryCode', {}, options);
  }
  
  async getInventoryCategories(options = {}) {
    return this.request('getInventoryCategories', {}, options);
  }
  
  async getInventoryCategoryDetails(categoryCode, options = {}) {
    return this.request('getInventoryCategoryDetails', { categoryCode }, options);
  }
  
  async addNewInventory(formData, options = {}) {
    return this.request('addNewInventory', formData, options);
  }
  
  async restockInventory(formData, options = {}) {
    return this.request('restockInventory', formData, options);
  }
  
  async getPurchaseReportData(fromDate, toDate, options = {}) {
    return this.request('getPurchaseReportData', { fromDate, toDate }, options);
  }
  
  async getUsageReportData(fromDate, toDate, options = {}) {
    return this.request('getUsageReportData', { fromDate, toDate }, options);
  }
  
  async getInventoryListData(options = {}) {
    return this.request('getInventoryListData', {}, options);
  }
  
  async removeInventory(inventoryCode, options = {}) {
    return this.request('removeInventory', { inventoryCode }, options);
  }
  
  async recordInventoryUsage(formData, options = {}) {
    return this.request('recordInventoryUsage', formData, options);
  }

  // ============================================
  // FIXED ASSETS API
  // ============================================
  
  async generateAssetCode(assetType, options = {}) {
    return this.request('generateAssetCode', { assetType }, options);
  }
  
  async getAssetLifeSpan(assetType, options = {}) {
    return this.request('getAssetLifeSpan', { assetType }, options);
  }
  
  async getDepreciationRate(assetType, options = {}) {
    return this.request('getDepreciationRate', { assetType }, options);
  }
  
  async addNewAsset(formData, options = {}) {
    return this.request('addNewAsset', formData, options);
  }
  
  async getDetailedRegister(options = {}) {
    return this.request('getDetailedRegister', {}, options);
  }
  
  async getSummaryRegister(options = {}) {
    return this.request('getSummaryRegister', {}, options);
  }
  
  async updateAssetStatus(assetName, newStatus, options = {}) {
    return this.request('updateAssetStatus', { assetName, newStatus }, options);
  }

  // ============================================
  // INVESTMENT API
  // ============================================
  
  async generateInvestmentCode(investmentType, options = {}) {
    return this.request('generateInvestmentCode', { investmentType }, options);
  }
  
  async addNewInvestment(formData, options = {}) {
    return this.request('addNewInvestment', formData, options);
  }
  
  async getInvestmentsByDateRange(fromDate, toDate, options = {}) {
    return this.request('getInvestmentsByDateRange', { fromDate, toDate }, options);
  }
  
  async getUniqueInvestmentTypes(options = {}) {
    return this.request('getUniqueInvestmentTypes', {}, options);
  }
  
  async getUniqueBanks(options = {}) {
    return this.request('getUniqueBanks', {}, options);
  }
  
  async getMaturedInvestments(toDate, options = {}) {
    return this.request('getMaturedInvestments', { toDate }, options);
  }

  // ============================================
  // UTILITY API
  // ============================================
  
  async debugGetSheetColumns(options = {}) {
    return this.request('debugGetSheetColumns', {}, options);
  }
  
  async testConnection(options = {}) {
    try {
      const response = await this.request('test', {}, options);
      return {
        connected: response && response.success !== false,
        message: response && response.success !== false ? 'Connected to server' : 'Connection failed'
      };
    } catch (error) {
      return {
        connected: false,
        message: 'Connection failed: ' + error.message
      };
    }
  }
  
  // Clear cache for specific action or all
  clearCache(action = null) {
    if (action) {
      const keysToDelete = [];
      for (const key of this.cache.keys()) {
        if (key.startsWith(action)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }
}

// Create global API instance
window.API = new ApiService();

// For backward compatibility with existing modules
window.callGAS = async function(action, data = {}) {
  console.warn('callGAS is deprecated. Use API.[method] instead.');
  
  // Map actions to API methods
  const actionMap = {
    'getUserInfo': () => API.getUserInfo(),
    'processForm': () => API.processForm(data.formData ? JSON.parse(data.formData) : data),
    'getNextPVNumber': () => API.getNextPVNumber(data.voucherType),
    'getPVNumbersByType': () => API.getPVNumbersByType(),
    'getVoucherByNumber': () => API.getVoucherByNumber(data.pvNumber, data.voucherType),
    'updateVoucher': () => API.updateVoucher(data.formData ? JSON.parse(data.formData) : data),
    'generateInventoryCategoryCode': () => API.generateInventoryCategoryCode(),
    'getInventoryCategories': () => API.getInventoryCategories(),
    'addNewInventory': () => API.addNewInventory(data.formData ? JSON.parse(data.formData) : data),
    'getPurchaseReportData': () => API.getPurchaseReportData(data.fromDate, data.toDate),
    'getUsageReportData': () => API.getUsageReportData(data.fromDate, data.toDate),
    'getInventoryListData': () => API.getInventoryListData(),
    'recordInventoryUsage': () => API.recordInventoryUsage(data.formData ? JSON.parse(data.formData) : data),
    'removeInventory': () => API.removeInventory(data.inventoryCode),
    'generateAssetCode': () => API.generateAssetCode(data.assetType),
    'addNewAsset': () => API.addNewAsset(data.formData ? JSON.parse(data.formData) : data),
    'getDetailedRegister': () => API.getDetailedRegister(),
    'updateAssetStatus': () => API.updateAssetStatus(data.assetName, data.newStatus),
    'generateInvestmentCode': () => API.generateInvestmentCode(data.investmentType),
    'addNewInvestment': () => API.addNewInvestment(data.formData ? JSON.parse(data.formData) : data),
    'getInvestmentsByDateRange': () => API.getInvestmentsByDateRange(data.fromDate, data.toDate),
    'getMaturedInvestments': () => API.getMaturedInvestments(data.toDate)
  };
  
  const apiCall = actionMap[action];
  if (apiCall) {
    return apiCall();
  }
  
  throw new Error(`Unknown action: ${action}`);
};
