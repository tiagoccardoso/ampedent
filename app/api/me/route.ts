import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return Response.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const user = session.user as any
  return Response.json({
    message: 'Usuário encontrado',
    user: user.name,
    email: user.email,
    role: user.role,
  })
}
