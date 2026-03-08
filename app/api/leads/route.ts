import { NextRequest, NextResponse } from 'next/server'

// Google Apps Script Webhook URL
const APPS_SCRIPT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwCxbm5mXSBFKiPg8yAOpERNBQMsnaHvDPHX9BoTheB4S7LpxLa0qJypJ7TxwCnmQNT/exec'

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

    // Prepare data for Google Apps Script
    const formData = {
      timestamp: new Date().toISOString(),
      brandName: body.brandName || '',
      website: body.website || '',
      industry: body.industry || '',
      targetMarket: body.targetMarket || '',
      yearFounded: body.yearFounded || '',
      teamSize: body.teamSize || '',
      primaryGoal: body.primaryGoal || '',
      runAds: body.runAds || '',
      channels: Array.isArray(body.channels) ? (body.channels || []).join(', ') : (body.channels || ''),
      budget: body.budget || '',
      targetAudience: body.targetAudience || '',
      competitors: body.competitors || '',
      timeline: body.timeline || '',
      servicesNeeded: Array.isArray(body.servicesNeeded) ? (body.servicesNeeded || []).join(', ') : (body.servicesNeeded || ''),
      fullName: body.fullName || '',
      email: body.email || '',
      phone: body.phone || '',
      role: body.role || '',
      leadStatus: 'New',
      notes: '',
    }

    // Send to Google Apps Script Webhook
    const response = await fetch(APPS_SCRIPT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

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
