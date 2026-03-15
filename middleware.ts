import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { CRM_SESSION_COOKIE_NAME, verifyCrmSessionToken } from '@/lib/crm-auth'

export async function middleware(request: NextRequest) {
  // Check if user is authenticated
  const session = await verifyCrmSessionToken(
    request.cookies.get(CRM_SESSION_COOKIE_NAME)?.value
  )
  const pathname = request.nextUrl.pathname

  // List of protected CRM routes
  const protectedRoutes = [
    '/crm',
    '/api/crm',
  ]
  
  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if trying to access login page
  const isLoginPage = pathname === '/login'
  const isApiRoute = pathname.startsWith('/api/crm')

  // If not authenticated and trying to access protected route
  if (isProtectedRoute && !session) {
    if (isApiRoute) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If authenticated and trying to access login page, redirect to CRM
  if (isLoginPage && session) {
    const crmUrl = new URL('/crm', request.url)
    return NextResponse.redirect(crmUrl)
  }

  return NextResponse.next()
}

// Configure which routes should run the middleware
export const config = {
  matcher: [
    '/crm/:path*',
    '/api/crm/:path*',
    '/login',
  ],
}
