import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'better-auth.session_token'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtectedAdmin = pathname.startsWith('/admin') && pathname !== '/admin'
  if (!isProtectedAdmin) return NextResponse.next()

  const hasSession = !!request.cookies.get(SESSION_COOKIE)
  if (!hasSession) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path+'],
}
