import { auth } from '@lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { UserRole } from './src/domain/user/UserRole'

const PROTECTED_ROUTES = ['/dashboard', '/mi-cuenta']
const ADMIN_ROUTES = ['/admin']

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const isAuthenticated = !!session?.user

  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))

  if (isAdminRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (session?.user?.role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
})

export const config = {
  matcher: ['/dashboard/:path*', '/mi-cuenta/:path*', '/admin/:path*'],
}
