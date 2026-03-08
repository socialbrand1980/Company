import { NextRequest, NextResponse } from 'next/server'

// Google Apps Script Webhook URL
const APPS_SCRIPT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyzUXdKN4dOBHhDoDqAhG41c84F88cpgNJue3Oy9-UVAgqHxxOJIL9L4sbTUc79K2hd/exec'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['brandName', 'industry', 'targetMarket', 'primaryGoal', 'budget', 'timeline', 'fullName', 'email', 'phone', 'role']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Prepare data for Google Apps Script - match exact column names
    const formData = {
      'Timestamp': new Date().toISOString(),
      'Brand Name': body.brandName || '',
      'Website': body.website || '',
      'Industry': body.industry || '',
      'Target Market': body.targetMarket || '',
      'Year Founded': body.yearFounded || '',
      'Team Size': body.teamSize || '',
      'Primary Goal': body.primaryGoal || '',
      'Run Ads': body.runAds || '',
      'Channels': Array.isArray(body.channels) ? (body.channels || []).join(', ') : (body.channels || ''),
      'Budget': body.budget || '',
      'Target Audience': body.targetAudience || '',
      'Competitors': body.competitors || '',
      'Timeline': body.timeline || '',
      'Services Needed': body.servicesNeeded || '',
      'Full Name': body.fullName || '',
      'Email': body.email || '',
      'Phone': body.phone || '',
      'Role': body.role || '',
      'Lead Status': 'New',
      'Notes': '',
    }

    console.log('=== FORM DATA TO GOOGLE SHEETS ===')
    console.log('Primary Goal:', formData['Primary Goal'])
    console.log('Services Needed:', formData['Services Needed'])
    console.log('Full payload:', JSON.stringify(formData, null, 2))

    // Send to Google Apps Script Webhook
    const response = await fetch(APPS_SCRIPT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    console.log('Apps Script response status:', response.status)

    if (!response.ok) {
      throw new Error('Failed to send data to Google Apps Script')
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Lead submitted successfully' 
    })

  } catch (error) {
    console.error('Google Apps Script Error:', error)
    
    // If Apps Script is not responding, still return success for demo purposes
    if (process.env.NODE_ENV === 'development') {
      console.log('Apps Script not responding, returning success for demo')
      return NextResponse.json({ 
        success: true, 
        message: 'Lead submitted successfully (demo mode)' 
      })
    }

    return NextResponse.json(
      { error: 'Failed to submit lead. Please try again.' },
      { status: 500 }
    )
  }
}
