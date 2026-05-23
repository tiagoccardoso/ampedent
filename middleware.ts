import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin'
  const isPortalRoute = pathname.startsWith('/portal')

  if (!isAdminRoute && !isPortalRoute) {
    return NextResponse.next()
  }

  const session = await auth.api.getSession({ headers: request.headers })

  if (isAdminRoute && !session) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  if (isPortalRoute && (!session || (session.user as any)?.role !== 'paciente')) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path+', '/portal/:path+'],
}
