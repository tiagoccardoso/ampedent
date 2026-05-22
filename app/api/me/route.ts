import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return Response.json({ message: 'Não autorizado' }, { status: 401 })
  }

  return Response.json({
    message: 'Usuário encontrado',
    user: user.name,
    email: user.email,
    role: user.role,
  })
}
