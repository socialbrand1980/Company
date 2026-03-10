import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if user is authenticated
  const session = request.cookies.get('crm_session')?.value

  // List of protected CRM routes
  const protectedRoutes = [
    '/crm',
    '/crm/analytics',
    '/crm/clients',
    '/crm/leads',
    '/crm/pipeline',
  ]
  
  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Check if trying to access login page
  const isLoginPage = request.nextUrl.pathname === '/login'

  // If not authenticated and trying to access protected route
  if (isProtectedRoute && session !== 'authenticated') {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If authenticated and trying to access login page, redirect to CRM
  if (isLoginPage && session === 'authenticated') {
    const crmUrl = new URL('/crm', request.url)
    return NextResponse.redirect(crmUrl)
  }

  return NextResponse.next()
}

// Configure which routes should run the middleware
export const config = {
  matcher: [
    '/crm/:path*',
    '/login',
  ],
}
