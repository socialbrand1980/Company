import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    // Get password from environment variable
    const correctPassword = process.env.CRM_PASSWORD || 'admin123'

    // Simple password check
    if (password === correctPassword) {
      // Create response with cookie
      const response = NextResponse.json({
        success: true,
        message: 'Login successful'
      })

      // Set session cookie (expires in 24 hours)
      response.cookies.set('crm_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })

      return response
    } else {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Check if user is authenticated
  const session = request.cookies.get('crm_session')?.value

  if (session === 'authenticated') {
    return NextResponse.json({ authenticated: true })
  } else {
    return NextResponse.json({ authenticated: false })
  }
}

export async function DELETE() {
  // Logout - clear session cookie
  const response = NextResponse.json({ success: true })
  
  response.cookies.set('crm_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })

  return response
}
