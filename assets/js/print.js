/* ============================================
   UNIFIED PRINT MODULE
   Handles printing for all reports and registers
   ============================================ */

// Global print utility
window.printUtils = {
  // Print any table with title and date info
  printTable: function(tableId, title, dateInfo = '', options = {}) {
    const tableWrapper = document.getElementById(tableId);
    if (!tableWrapper) {
      console.error('Table wrapper not found:', tableId);
      alert('Report data not found. Please refresh and try again.');
      return;
    }

    const originalTable = tableWrapper.querySelector('table');
    if (!originalTable) {
      console.error('Table not found in wrapper:', tableId);
      alert('Table not found. Please refresh and try again.');
      return;
    }

    // Clone the table
    const tableClone = originalTable.cloneNode(true);
    
    // Remove action buttons column if present (last column with Action button)
    const actionColumn = tableClone.querySelector('th:last-child');
    if (actionColumn && actionColumn.textContent.includes('Action')) {
      // Remove last column from header
      const headerRow = tableClone.querySelector('thead tr');
      if (headerRow) {
        headerRow.removeChild(headerRow.lastElementChild);
      }
      // Remove last column from each row in tbody
      tableClone.querySelectorAll('tbody tr').forEach(row => {
        if (row.lastElementChild) {
          row.removeChild(row.lastElementChild);
        }
      });
      // Remove last column from tfoot if exists
      if (tableClone.querySelector('tfoot')) {
        tableClone.querySelectorAll('tfoot tr').forEach(row => {
          if (row.lastElementChild) {
            row.removeChild(row.lastElementChild);
          }
        });
      }
    }

    // Get current date/time
    const now = new Date();
    const printDate = now.toLocaleDateString();
    const printTime = now.toLocaleTimeString();

    // Create print window content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 15mm;
            font-size: 11px;
            line-height: 1.4;
          }
          .report-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #4361ee;
            padding-bottom: 12px;
          }
          .report-header h1 {
            font-size: 18px;
            color: #2d3748;
            margin-bottom: 8px;
            font-weight: 600;
          }
          .report-header p {
            font-size: 10px;
            color: #6c757d;
            margin-top: 4px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th {
            background: #f7fafc;
            padding: 8px 6px;
            border: 1px solid #ddd;
            text-align: center;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          td {
            padding: 6px;
            border: 1px solid #ddd;
            text-align: center;
            font-size: 10px;
          }
          .total-row {
            background: #e8f8f3;
            font-weight: 600;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 9px;
            color: #6c757d;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          @media print {
            body {
              padding: 10mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <h1>${title}</h1>
          <p>${dateInfo}</p>
          <p>Printed on: ${printDate} at ${printTime}</p>
        </div>
        ${tableClone.outerHTML}
        <div class="footer">
          <p>Accounts Workspace - ${options.footer || 'Management System'}</p>
        </div>
      </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    
    // Close after print or after timeout
    setTimeout(() => {
      printWindow.close();
    }, 1000);
  },

  // Print inventory report
  printInventoryReport: function(tabId) {
    let title = '';
    let dateInfo = '';
    let tableId = '';

    if (tabId === 'purchaseReport') {
      title = 'INVENTORY PURCHASE REPORT';
      tableId = 'purchaseReportTable';
      const fromDate = document.getElementById('purchaseFromDate')?.value || '';
      const toDate = document.getElementById('purchaseToDate')?.value || '';
      if (fromDate && toDate) {
        dateInfo = `Period: ${fromDate} to ${toDate}`;
      }
    } else if (tabId === 'usageReport') {
      title = 'INVENTORY USAGE REPORT';
      tableId = 'usageReportTable';
      const fromDate = document.getElementById('usageFromDate')?.value || '';
      const toDate = document.getElementById('usageToDate')?.value || '';
      if (fromDate && toDate) {
        dateInfo = `Period: ${fromDate} to ${toDate}`;
      }
    } else if (tabId === 'inventoryList') {
      title = 'INVENTORY LIST REPORT';
      tableId = 'inventoryListTable';
      const asAtDate = document.getElementById('inventoryToDate')?.value || '';
      if (asAtDate) {
        dateInfo = `As at: ${asAtDate}`;
      }
    }

    this.printTable(tableId, title, dateInfo, { footer: 'Inventory Management System' });
  },

  // Print asset register
  printAssetRegister: function(tabName) {
    if (tabName === 'detailedRegister') {
      const title = 'DETAILED ASSET REGISTER';
      const asAtDate = document.getElementById('detailedToDate')?.value || '';
      const dateInfo = asAtDate ? `As at: ${asAtDate}` : '';
      this.printTable('detailedRegisterTable', title, dateInfo, { footer: 'Fixed Assets Management System' });
    } else if (tabName === 'summaryRegister') {
      const title = 'SUMMARY ASSET REGISTER';
      const fromDate = document.getElementById('summaryFromDate')?.value || '';
      const toDate = document.getElementById('summaryToDate')?.value || '';
      const dateInfo = (fromDate && toDate) ? `Period: ${fromDate} to ${toDate}` : '';
      this.printTable('summaryRegisterTable', title, dateInfo, { footer: 'Fixed Assets Management System' });
    }
  },

  // Print investment report
  printInvestmentReport: function(tabName) {
    let title = '';
    let tableId = '';
    let dateInfo = '';

    if (tabName === 'purchaseReport') {
      title = 'INVESTMENT PURCHASE REPORT';
      tableId = 'purchaseReportTable';
      const fromDate = document.getElementById('purchaseFromDate')?.value || '';
      const toDate = document.getElementById('purchaseToDate')?.value || '';
      if (fromDate && toDate) {
        dateInfo = `Period: ${fromDate} to ${toDate}`;
      }
    } else if (tabName === 'fullReport') {
      title = 'INVESTMENT FULL REPORT';
      tableId = 'fullReportContainer';
      const toDate = document.getElementById('fullReportToDate')?.value || '';
      if (toDate) {
        dateInfo = `As at: ${toDate}`;
      }
    } else if (tabName === 'interestReport') {
      title = 'INVESTMENT INTEREST REPORT';
      tableId = 'interestReportContainer';
      const fromDate = document.getElementById('interestFromDate')?.value || '';
      const toDate = document.getElementById('interestToDate')?.value || '';
      if (fromDate && toDate) {
        dateInfo = `Period: ${fromDate} to ${toDate}`;
      }
    } else if (tabName === 'maturedReport') {
      title = 'MATURED INVESTMENTS REPORT';
      tableId = 'maturedReportTable';
      const toDate = new Date().toISOString().split('T')[0];
      dateInfo = `As at: ${toDate}`;
    }

    if (tableId === 'fullReportContainer' || tableId === 'interestReportContainer') {
      // For container reports, need special handling
      this.printContainerReport(tableId, title, dateInfo);
    } else {
      this.printTable(tableId, title, dateInfo, { footer: 'Investment Management System' });
    }
  },

  // Print container report (for grouped reports)
  printContainerReport: function(containerId, title, dateInfo) {
    const container = document.getElementById(containerId);
    if (!container) {
      alert('Report data not found');
      return;
    }

    const content = container.cloneNode(true);
    
    // Get current date/time
    const now = new Date();
    const printDate = now.toLocaleDateString();
    const printTime = now.toLocaleTimeString();

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 15mm;
            font-size: 11px;
          }
          .report-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #4361ee;
            padding-bottom: 12px;
          }
          .report-header h1 {
            font-size: 18px;
            color: #2d3748;
            margin-bottom: 8px;
          }
          .report-header p {
            font-size: 10px;
            color: #6c757d;
          }
          .grouped-report {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .group-title {
            font-size: 12px;
            font-weight: 700;
            background: #4361ee;
            color: white;
            padding: 6px 12px;
            margin-bottom: 8px;
            border-radius: 4px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          th {
            background: #f7fafc;
            padding: 6px 5px;
            border: 1px solid #ddd;
            font-size: 9px;
            font-weight: 600;
          }
          td {
            padding: 5px;
            border: 1px solid #ddd;
            font-size: 9px;
          }
          .subtotal-row {
            background: #f0f4ff;
            font-weight: 600;
          }
          .grand-total-row {
            background: #e8f8f3;
            font-weight: 700;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 9px;
            color: #6c757d;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          @media print {
            body {
              padding: 10mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <h1>${title}</h1>
          <p>${dateInfo}</p>
          <p>Printed on: ${printDate} at ${printTime}</p>
        </div>
        ${content.innerHTML}
        <div class="footer">
          <p>Accounts Workspace - Investment Management System</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    
    setTimeout(() => {
      printWindow.close();
    }, 1000);
  }
};

// Make printUtils available globally
window.printUtils = printUtils;
