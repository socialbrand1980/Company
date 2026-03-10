/**
 * Google Apps Script for Work With Us Form
 * Deploy as Web App with:
 * - Execute as: Me
 * - Who has access: Anyone
 */

const SHEET_NAME = 'Work With Us Leads';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || 'create';
    
    Logger.log('Action:', action);
    Logger.log('Data:', data);
    
    if (action === 'update') {
      return handleUpdate(data);
    } else if (action === 'create') {
      return handleCreate(data);
    } else {
      return createResponse({ error: 'Unknown action' }, 400);
    }
  } catch (error) {
    Logger.log('Error:', error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function handleCreate(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return createResponse({ error: 'Sheet not found' }, 404);
    }
    
    // Get headers
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Map data to row based on headers
    const newRow = headers.map(header => {
      const key = header.toLowerCase().replace(/\s+/g, '');
      return data[key] || '';
    });
    
    // Append new row
    sheet.appendRow(newRow);
    
    Logger.log('Created new lead:', data.email);
    return createResponse({ success: true, message: 'Lead created successfully' });
  } catch (error) {
    Logger.log('Create error:', error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function handleUpdate(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return createResponse({ error: 'Sheet not found' }, 404);
    }
    
    const email = data.email;
    const updates = data.updates;
    
    if (!email) {
      return createResponse({ error: 'Email is required for update' }, 400);
    }
    
    // Get all data
    const allData = sheet.getDataRange().getValues();
    const headers = allData[0];
    const rows = allData.slice(1);
    
    // Find email column index
    const emailIndex = headers.findIndex(h => 
      h.toString().toLowerCase().replace(/\s+/g, '') === 'email'
    );
    
    if (emailIndex === -1) {
      return createResponse({ error: 'Email column not found' }, 404);
    }
    
    // Find row with matching email
    const rowIndex = rows.findIndex(row => row[emailIndex] === email);
    
    if (rowIndex === -1) {
      return createResponse({ error: 'Lead not found' }, 404);
    }
    
    Logger.log('Found lead at row:', rowIndex + 2); // +2 because 1-indexed and header row
    
    // Update specific columns
    if (updates) {
      Object.keys(updates).forEach(key => {
        // Find column index for this key
        const columnIndex = headers.findIndex(h => 
          h.toString().toLowerCase().replace(/\s+/g, '') === key.toLowerCase().replace(/\s+/g, '')
        );
        
        if (columnIndex !== -1) {
          // Update the cell (row + 2 because data starts at row 2)
          sheet.getRange(rowIndex + 2, columnIndex + 1).setValue(updates[key]);
          Logger.log(`Updated ${key} to: ${updates[key]}`);
        } else {
          Logger.log(`Column ${key} not found`);
        }
      });
    }
    
    Logger.log('Updated lead:', email);
    return createResponse({ success: true, message: 'Lead updated successfully' });
  } catch (error) {
    Logger.log('Update error:', error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return createResponse({ error: 'Sheet not found' }, 404);
    }
    
    const allData = sheet.getDataRange().getValues();
    const headers = allData[0];
    const rows = allData.slice(1);
    
    // Convert to array of objects
    const leads = rows.map(row => {
      const lead = {};
      headers.forEach((header, index) => {
        const key = header.toString().toLowerCase().replace(/\s+/g, '');
        lead[key] = row[index];
      });
      return lead;
    });
    
    return createResponse({ success: true, leads: leads });
  } catch (error) {
    Logger.log('Get error:', error.toString());
    return createResponse({ error: error.toString() }, 500);
  }
}

function createResponse(data, statusCode = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHttpStatusCode(statusCode);
}
