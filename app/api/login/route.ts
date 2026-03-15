import { NextRequest, NextResponse } from 'next/server'
import {
  CRM_SESSION_COOKIE_NAME,
  CRM_SESSION_MAX_AGE,
  createCrmSessionToken,
  getCrmCredentials,
  verifyCrmSessionToken,
} from '@/lib/crm-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('🔐 Login attempt:', email)

    const { email: validEmail, password: validPassword } = getCrmCredentials()

    if (email === validEmail && password === validPassword) {
      const sessionToken = await createCrmSessionToken(email)

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
      response.cookies.set(CRM_SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: CRM_SESSION_MAX_AGE,
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
  
  response.cookies.set(CRM_SESSION_COOKIE_NAME, '', {
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
  const session = await verifyCrmSessionToken(
    request.cookies.get(CRM_SESSION_COOKIE_NAME)?.value
  )

  if (session) {
    return NextResponse.json({ 
      authenticated: true,
      user: {
        email: session.email,
        name: 'Admin'
      }
    })
  } else {
    return NextResponse.json({ authenticated: false })
  }
}
