/* ============================================
   FIXED ASSETS MODULE JAVASCRIPT
   ============================================ */

// Global variables
let assetPortalOpen = false;
let allDetailedAssets = [];
let currentAsOfDate = null;
let summaryFromDate = null;
let summaryToDate = null;

const ASSET_TYPES = [
  'Computers & Accessories',
  'Furniture And Fixtures',
  'Fittings',
  'Office Equipment',
  'Motor Vehicle',
  'Software'
];

// ============================================
// INITIALIZATION
// ============================================

function initAssetModule() {
  const today = new Date().toISOString().split('T')[0];
  const dateField = document.getElementById('dateOfPurchase');
  if (dateField) dateField.value = today;

  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    const modal = document.getElementById('messageModal');
    if (modal && event.target === modal) {
      closeAssetModal();
    }
  });
}

function initAssetRegisterModule() {
  const today = new Date().toISOString().split('T')[0];
  
  // Set initial date values
  const detailedToDate = document.getElementById('detailedToDate');
  const summaryFromDateEl = document.getElementById('summaryFromDate');
  const summaryToDateEl = document.getElementById('summaryToDate');
  
  if (detailedToDate) detailedToDate.value = today;
  if (summaryFromDateEl) summaryFromDateEl.value = today;
  if (summaryToDateEl) summaryToDateEl.value = today;
  
  currentAsOfDate = today;
  summaryFromDate = today;
  summaryToDate = today;
  
  loadDetailedRegister();

  window.addEventListener('click', function(event) {
    if (assetPortalOpen) {
      const portal = document.getElementById('assetActionPortal');
      if (portal && !portal.contains(event.target) && !event.target.classList.contains('action-btn')) {
        closeAssetActionDropdown();
      }
    }
  });
}

// ============================================
// ASSET CODE GENERATION
// ============================================

function handleAssetTypeChange() {
  const assetType = document.getElementById('assetType').value;
  const codeField = document.getElementById('assetCode');
  const depreciationInfo = document.getElementById('depreciationInfo');
  
  if (assetType) {
    // Show depreciation info
    depreciationInfo.style.display = 'block';
    calculateDepreciationInfo(assetType);
    
    if (assetType === 'Fittings' || assetType === 'Software') {
      codeField.value = 'N/A';
      codeField.readOnly = true;
    } else {
      codeField.value = 'Generating...';
      codeField.readOnly = true;
      generateAssetCode(assetType);
    }
  } else {
    depreciationInfo.style.display = 'none';
    codeField.value = '';
    codeField.readOnly = false;
  }
}

function calculateDepreciationInfo(assetType) {
  const cost = parseFloat(document.getElementById('assetCost').value) || 0;
  const purchaseDate = document.getElementById('dateOfPurchase').value;
  
  if (!cost || cost <= 0 || !purchaseDate) {
    // Show placeholder
    document.getElementById('lifeSpanDisplay').textContent = '—';
    document.getElementById('rateDisplay').textContent = '—';
    document.getElementById('monthlyDepDisplay').textContent = '—';
    document.getElementById('annualChargeDisplay').textContent = '—';
    document.getElementById('endOfLifeDisplay').textContent = '—';
   
