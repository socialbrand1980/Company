/**
 * Google Apps Script for Work With Us Form
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets
 * 2. Extensions → Apps Script
 * 3. Delete ALL existing code
 * 4. Paste this entire code
 * 5. Save (Ctrl+S)
 * 6. Deploy → New deployment
 * 7. Select type: Web app
 * 8. Execute as: Me
 * 9. Who has access: Anyone
 * 10. Click Deploy
 * 11. Copy Web App URL
 * 12. Update /app/api/crm/leads/route.ts with new URL
 */

const SHEET_NAME = 'Work With Us Leads';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || 'create';
    
    Logger.log('=== POST Request ===');
    Logger.log('Action:', action);
    Logger.log('Email:', data.email);
    Logger.log('Updates:', JSON.stringify(data.updates));
    
    if (action === 'update') {
      return handleUpdate(data);
    } else if (action === 'create') {
      return handleCreate(data);
    } else {
      return createResponse({ error: 'Unknown action: ' + action });
    }
  } catch (error) {
    Logger.log('Error in doPost:', error.toString());
    return createResponse({ error: error.toString() });
  }
}

function handleUpdate(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      Logger.log('Sheet not found: ' + SHEET_NAME);
      return createResponse({ error: 'Sheet not found: ' + SHEET_NAME });
    }
    
    const email = data.email;
    const updates = data.updates;
    
    if (!email) {
      Logger.log('Email missing from request');
      return createResponse({ error: 'Email is required' });
    }
    
    Logger.log('Looking for email: ' + email);
    
    // Get all data
    const allData = sheet.getDataRange().getValues();
    const headers = allData[0];
    const rows = allData.slice(1);
    
    Logger.log('Total rows in sheet: ' + rows.length);
    
    // Find email column index
    const emailIndex = headers.findIndex(h => 
      h.toString().toLowerCase().trim() === 'email'
    );
    
    Logger.log('Email column index: ' + emailIndex);
    
    if (emailIndex === -1) {
      Logger.log('Email column not found in headers');
      return createResponse({ error: 'Email column not found' });
    }
    
    // Find row with matching email
    const rowIndex = rows.findIndex(row => {
      const rowEmail = row[emailIndex] ? row[emailIndex].toString().trim() : '';
      const match = rowEmail === email;
      Logger.log('Comparing: "' + rowEmail + '" === "' + email + '" = ' + match);
      return match;
    });
    
    Logger.log('Found row index: ' + rowIndex);
    
    if (rowIndex === -1) {
      Logger.log('Lead not found with email: ' + email);
      return createResponse({ error: 'Lead not found' });
    }
    
    Logger.log('✓ Found lead at row: ' + (rowIndex + 2));
    
    // Update specific columns
    let updateCount = 0;
    if (updates) {
      Object.keys(updates).forEach(key => {
        // Find column index for this key
        const columnIndex = headers.findIndex(h => {
          const headerKey = h.toString().toLowerCase().trim().replace(/\s+/g, '');
          const searchKey = key.toLowerCase().trim().replace(/\s+/g, '');
          const match = headerKey === searchKey;
          Logger.log('Column search: "' + key + '" -> "' + h + '" = ' + match);
          return match;
        });
        
        Logger.log('Looking for column: ' + key + ' -> Found index: ' + columnIndex);
        
        if (columnIndex !== -1) {
          // Update the cell (row + 2 because 1-indexed and header row)
          const cell = sheet.getRange(rowIndex + 2, columnIndex + 1);
          cell.setValue(updates[key]);
          Logger.log('✓ Updated column ' + (columnIndex + 1) + ' ("' + key + '") to: ' + updates[key]);
          updateCount++;
        } else {
          Logger.log('✗ Column "' + key + '" not found in headers');
        }
      });
    }
    
    Logger.log('✓ Successfully updated ' + updateCount + ' fields for lead: ' + email);
    return createResponse({ 
      success: true, 
      message: 'Lead updated successfully',
      updatedFields: updateCount
    });
  } catch (error) {
    Logger.log('✗ Update error: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    return createResponse({ error: error.toString() });
  }
}

function handleCreate(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      Logger.log('Sheet not found: ' + SHEET_NAME);
      return createResponse({ error: 'Sheet not found' });
    }
    
    // Get headers
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Map data to row based on headers
    const newRow = headers.map(header => {
      const key = header.toString().toLowerCase().replace(/\s+/g, '');
      return data[key] || '';
    });
    
    // Append new row
    sheet.appendRow(newRow);
    
    Logger.log('✓ Created new lead: ' + data.email);
    return createResponse({ success: true, message: 'Lead created successfully' });
  } catch (error) {
    Logger.log('✗ Create error: ' + error.toString());
    return createResponse({ error: error.toString() });
  }
}

function doGet(e) {
  try {
    Logger.log('=== GET Request ===');
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      Logger.log('Sheet not found: ' + SHEET_NAME);
      return createResponse({ error: 'Sheet not found' });
    }
    
    const allData = sheet.getDataRange().getValues();
    const headers = allData[0];
    const rows = allData.slice(1);
    
    Logger.log('Total rows: ' + rows.length);
    
    // Convert to array of objects
    const leads = rows.map(row => {
      const lead = {};
      headers.forEach((header, index) => {
        const key = header.toString().toLowerCase().replace(/\s+/g, '');
        lead[key] = row[index];
      });
      return lead;
    });
    
    Logger.log('✓ Returning ' + leads.length + ' leads');
    return createResponse({ success: true, leads: leads, count: leads.length });
  } catch (error) {
    Logger.log('✗ Get error: ' + error.toString());
    return createResponse({ error: error.toString() });
  }
}

function createResponse(data) {
  // FIXED: Removed setHttpStatusCode (not available in ContentService)
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
