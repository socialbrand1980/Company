import { NextRequest, NextResponse } from 'next/server'
import { CRM_SESSION_COOKIE_NAME, verifyCrmSessionToken } from '@/lib/crm-auth'

// Google Sheet ID from your Work With Us form
const SPREADSHEET_ID = '13ruAstGIxEl9y-9BQ1eWJsfTkYiwPAYK5obLug2q7N0'

// Google Apps Script Webhook URL for updates
const APPS_SCRIPT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxEuYl1NDgZ3mOiJTottCRmObpL46ViavdErxfU_mMGoDtPOwIws5U3BXbEbsJw0sjQ/exec'

export async function GET(request: NextRequest) {
  try {
    const session = await verifyCrmSessionToken(
      request.cookies.get(CRM_SESSION_COOKIE_NAME)?.value
    )

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Note: For production, consider adding authentication
    // Currently accessible everywhere for demo purposes
    
    // Method 1: Try Google Sheets API with credentials if available
    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      try {
        const { google } = await import('googleapis')
        
        const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          },
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        })

        const sheets = google.sheets({ version: 'v4', auth })

        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Work With Us Leads!A2:U1000',
        })

        const rows = response.data.values || []

        console.log('=== METHOD 1: GOOGLE SHEETS API ===')
        console.log('Rows count:', rows.length)
        if (rows.length > 0) {
          console.log('First row (full):', rows[0])
          console.log('First row length:', rows[0].length)
          rows[0].forEach((value: string, index: number) => {
            console.log(`Index ${index} (Column ${String.fromCharCode(65 + index)}): "${value}"`)
          })
        }

        const leads = rows.map(row => ({
          timestamp: row[0] || '',
          brandname: row[1] || '',
          website: row[2] || '',
          industry: row[3] || '',
          targetmarket: row[4] || '',
          yearfounded: row[5] || '',
          teamsize: row[6] || '',
          primarygoal: row[7] || '',
          runads: row[8] || '',
          channels: row[9] || '',
          budget: row[10] || '',
          targetaudience: row[11] || '',
          competitors: row[12] || '',
          timeline: row[13] || '',
          servicesneeded: row[14] || '',
          fullname: row[15] || '',
          email: row[16] || '',
          phone: row[17] || '',
          role: row[18] || '',
          leadstatus: row[19] || 'New',
          notes: row[20] || '',
        }))

        console.log('First lead budget:', leads[0]?.budget)

        return NextResponse.json({
          success: true,
          leads,
          count: leads.length
        })
      } catch (apiError) {
        console.error('Google Sheets API error:', apiError)
        // Continue to fallback method
      }
    }

    // Method 2: Try gviz endpoint (public sheet)
    try {
      const sheetName = 'Work With Us Leads'
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`

      const response = await fetch(csvUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()
      
      // Parse the JSON response (Google wraps it in a function call)
      const jsonText = text.substring(text.indexOf('{')).slice(0, -2)
      const json = JSON.parse(jsonText)

      const cols = json.table.cols.map((col: any) => col.label || col.id || '')
      const rows = json.table.rows || []

      console.log('=== GVIZ COLUMNS ===')
      console.log('Column labels:', cols)
      console.log('First row data:', rows[0])
      if (rows[0]) {
        console.log('First row cells:', rows[0].c)
        cols.forEach((col: string, index: number) => {
          const cell = rows[0].c[index]
          console.log(`Column ${index} (${col}):`, cell?.v || cell?.f || 'EMPTY')
        })
      }

      const leads = rows.map((row: any) => {
        const lead: any = {}
        cols.forEach((col: string, index: number) => {
          const cell = row.c[index]
          const key = col.toLowerCase().replace(/\s+/g, '')
          lead[key] = cell?.v || cell?.f || ''
          if (key === 'budget') {
            console.log('Budget field:', key, 'value:', lead[key], 'cell:', cell)
          }
        })
        return lead
      })

      return NextResponse.json({
        success: true,
        leads,
        count: leads.length
      })
    } catch (gvizError) {
      console.error('gviz error:', gvizError)
    }

    // Method 3: Return empty with helpful message
    return NextResponse.json({
      success: true,
      leads: [],
      count: 0,
      message: 'No data found. Make sure the Google Sheet is shared publicly ("Anyone with link can view") or configure Google Sheets API credentials in environment variables.'
    })

  } catch (error) {
    console.error('Google Sheets Fetch Error:', error)

    return NextResponse.json(
      { 
        error: 'Failed to fetch leads',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await verifyCrmSessionToken(
      request.cookies.get(CRM_SESSION_COOKIE_NAME)?.value
    )

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('📝 PATCH request received')
    
    const body = await request.json()
    console.log('📝 Request body:', body)
    
    const { email, updates, action = 'update' } = body

    if (!email && action !== 'create') {
      console.error('❌ Email is required')
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    console.log('📤 Sending update to Apps Script...')
    console.log('Email:', email)
    console.log('Updates:', updates)

    // Send update to Google Apps Script Webhook
    const webhookResponse = await fetch(APPS_SCRIPT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: action,
        email,
        updates,
      }),
    })

    console.log('📥 Apps Script response status:', webhookResponse.status)
    
    // Read response as text first to see raw response
    const responseText = await webhookResponse.text()
    console.log('📥 Apps Script raw response:', responseText)
    
    // Then parse as JSON
    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      console.error('❌ Failed to parse Apps Script response as JSON')
      console.error('Response was:', responseText)
      return NextResponse.json(
        { error: 'Invalid response from Apps Script', response: responseText },
        { status: 500 }
      )
    }
    
    console.log('📥 Apps Script parsed response:', result)

    if (!webhookResponse.ok || (result && result.error)) {
      console.error('❌ Apps Script error:', result)
      throw new Error(result.error || 'Failed to update Google Sheet')
    }

    console.log('✅ Lead updated successfully')
    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully'
    })

  } catch (error) {
    console.error('❌ Google Sheets Update Error:', error)
    return NextResponse.json(
      { error: 'Failed to update lead', message: (error as Error).message },
      { status: 500 }
    )
  }
}
