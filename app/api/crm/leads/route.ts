import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// Google Apps Script Webhook URL (for write operations)
const APPS_SCRIPT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwCxbm5mXSBFKiPg8yAOpERNBQMsnaHvDPHX9BoTheB4S7LpxLa0qJypJ7TxwCnmQNT/exec'

// Google Sheets API credentials (for read operations)
const SPREADSHEET_ID = '1QUWb2DLCjosHoaoYNiyZbh_YqrKA0QcjE31HRTcCCvk'

export async function GET(request: NextRequest) {
  try {
    // Check if running in development/local
    const host = request.headers.get('host') || ''
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1')
    
    if (!isLocal && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'CRM is only accessible locally' },
        { status: 403 }
      )
    }

    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    // Fetch all leads from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:U',
    })

    const rows = response.data.values || []
    const headers = rows[0] || []
    
    // Convert to array of objects (skip header row)
    const leads = rows.slice(1).map(row => {
      const lead: any = {}
      headers.forEach((header: string, index: number) => {
        lead[header.toLowerCase().replace(/\s+/g, '')] = row[index] || ''
      })
      return lead
    })

    return NextResponse.json({ 
      success: true, 
      leads,
      count: leads.length
    })

  } catch (error) {
    console.error('Google Sheets API Error:', error)
    
    // Return mock data for development if API fails
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true, 
        leads: [],
        count: 0,
        message: 'Google Sheets API not configured'
      })
    }

    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check if running in development/local
    const host = request.headers.get('host') || ''
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1')
    
    if (!isLocal && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'CRM is only accessible locally' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, updates } = body

    if (!email || !updates) {
      return NextResponse.json(
        { error: 'Email and updates are required' },
        { status: 400 }
      )
    }

    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    // Find the row with matching email
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:U',
    })

    const rows = response.data.values || []
    const headers = rows[0] || []
    
    // Find row index by email (column R = index 17)
    const emailIndex = headers.findIndex((h: string) => h.toLowerCase().includes('email'))
    const rowIndex = rows.findIndex((row: string[]) => row[emailIndex] === email)

    if (rowIndex === -1 || rowIndex === 0) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Update specific columns
    const updatesToApply: any = {}
    if (updates.leadStatus !== undefined) {
      const statusIndex = headers.findIndex((h: string) => h.toLowerCase().includes('leadstatus'))
      if (statusIndex !== -1) {
        const cellRange = `Sheet1!${String.fromCharCode(65 + statusIndex)}${rowIndex + 1}`
        updatesToApply[statusIndex] = { range: cellRange, values: [[updates.leadStatus]] }
      }
    }
    
    if (updates.notes !== undefined) {
      const notesIndex = headers.findIndex((h: string) => h.toLowerCase().includes('notes'))
      if (notesIndex !== -1) {
        const cellRange = `Sheet1!${String.fromCharCode(65 + notesIndex)}${rowIndex + 1}`
        updatesToApply[notesIndex] = { range: cellRange, values: [[updates.notes]] }
      }
    }

    // Apply updates
    if (Object.keys(updatesToApply).length > 0) {
      for (const key in updatesToApply) {
        const update = updatesToApply[key]
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: update.range,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: update.values,
          },
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Lead updated successfully' 
    })

  } catch (error) {
    console.error('Google Sheets Update Error:', error)
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    )
  }
}
