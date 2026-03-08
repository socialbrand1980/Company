import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if user is authenticated
  const session = request.cookies.get('crm_session')?.value

  // List of protected CRM routes
  const protectedRoutes = ['/crm/analytics', '/crm/leads']
  
  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Check if trying to access login page
  const isLoginPage = request.nextUrl.pathname === '/crm/login'

  // If not authenticated and trying to access protected route
  if (isProtectedRoute && session !== 'authenticated') {
    const loginUrl = new URL('/crm/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If authenticated and trying to access login page, redirect to analytics
  if (isLoginPage && session === 'authenticated') {
    const analyticsUrl = new URL('/crm/analytics', request.url)
    return NextResponse.redirect(analyticsUrl)
  }

  return NextResponse.next()
}

// Configure which routes should run the middleware
export const config = {
  matcher: [
    '/crm/analytics/:path*',
    '/crm/leads/:path*',
    '/crm/login',
  ],
}
