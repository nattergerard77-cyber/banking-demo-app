import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PATHS = [
  '/', '/dashboard', '/comptes', '/virements', '/beneficiaires',
  '/cartes', '/epargne', '/assurances', '/messagerie',
  '/notifications', '/operations', '/parametres', '/profil',
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get('banking_demo_session')
  const isAuthenticated = session?.value === 'authenticated'

  const isPublicApi = pathname.startsWith('/api/auth')
  const isLoginPage = pathname === '/login'
  const isProtected = PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))

  if (isLoginPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  if (isPublicApi) {
    return NextResponse.next()
  }

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
