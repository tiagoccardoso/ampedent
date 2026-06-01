import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const agendaRouteAliases: Record<string, string> = {
  '/Agenda': '/agenda',
  '/admin/Agenda': '/admin/agenda',
}

export function proxy(request: NextRequest) {
  const targetPath = agendaRouteAliases[request.nextUrl.pathname]

  if (!targetPath) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = targetPath

  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/Agenda', '/admin/Agenda'],
}
