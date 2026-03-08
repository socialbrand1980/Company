import { NextRequest, NextResponse } from 'next/server'

// Google Sheet ID from your Work With Us form
const SPREADSHEET_ID = '1QUWb2DLCjosHoaoYNiyZbh_YqrKA0QcjE31HRTcCCvk'

// Google Apps Script Webhook URL for updates
const APPS_SCRIPT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwCxbm5mXSBFKiPg8yAOpERNBQMsnaHvDPHX9BoTheB4S7LpxLa0qJypJ7TxwCnmQNT/exec'

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

    // Fetch data from Google Sheets via published CSV endpoint
    // This works without API credentials for public sheets
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`

    const response = await fetch(csvUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Sheets')
    }

    const text = await response.text()
    
    // Parse the JSON response (Google wraps it in a function call)
    const jsonText = text.substring(47).slice(0, -2)
    const json = JSON.parse(jsonText)

    // Convert to array of objects
    const cols = json.table.cols.map((col: any) => col.label || '')
    const rows = json.table.rows || []

    const leads = rows.map((row: any) => {
      const lead: any = {}
      cols.forEach((col: string, index: number) => {
        const cell = row.c[index]
        const key = col.toLowerCase().replace(/\s+/g, '')
        lead[key] = cell?.v || cell?.f || ''
      })
      return lead
    })

    return NextResponse.json({
      success: true,
      leads,
      count: leads.length
    })

  } catch (error) {
    console.error('Google Sheets Fetch Error:', error)

    // Return error with more details in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: false,
        leads: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Make sure the Google Sheet is shared publicly or configure Google Sheets API credentials'
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

    // Send update to Google Apps Script Webhook
    const webhookResponse = await fetch(APPS_SCRIPT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update',
        email,
        updates,
      }),
    })

    if (!webhookResponse.ok) {
      throw new Error('Failed to update Google Sheet')
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
