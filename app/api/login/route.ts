import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('🔐 Login attempt:', email)

    // Simple validation (in production, use database)
    const validEmail = 'jhordi@socialbrand1980.com'
    const validPassword = '546jho'

    if (email === validEmail && password === validPassword) {
      // Create response with session cookie
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          email,
          name: 'Jhordi'
        }
      })

      // Set httpOnly cookie (expires in 24 hours)
      response.cookies.set('crm_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })

      console.log('✅ Login successful:', email)
      return response
    } else {
      console.log('❌ Invalid credentials:', email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  // Logout - clear session cookie
  const response = NextResponse.json({ 
    success: true, 
    message: 'Logged out successfully' 
  })
  
  response.cookies.set('crm_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })

  console.log('👋 User logged out')
  return response
}

export async function GET(request: NextRequest) {
  // Check if user is authenticated
  const session = request.cookies.get('crm_session')?.value

  if (session === 'authenticated') {
    return NextResponse.json({ 
      authenticated: true,
      user: {
        email: 'jhordi@socialbrand1980.com',
        name: 'Jhordi'
      }
    })
  } else {
    return NextResponse.json({ authenticated: false })
  }
}
