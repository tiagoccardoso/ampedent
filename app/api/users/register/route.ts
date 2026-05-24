import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { createUser } from '@/lib/auth'
import { toSafeAuthError } from '@/lib/authApiErrors'

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json()
    const currentRole = await isSuperAdmin()
    if (currentRole !== 'superadmin') return Response.json({ message: 'Permissão insuficiente para cadastrar usuários.' }, { status: 403 })
    if (!name || !email || !password) return Response.json({ message: 'Nome, email e senha são obrigatórios' }, { status: 400 })
    if (String(password).length < 8) return Response.json({ message: 'A senha deve ter pelo menos 8 caracteres.' }, { status: 400 })

    const targetRole = role === 'superadmin' ? 'superadmin' : 'admin'
    const user = await createUser(email.toLowerCase().trim(), String(name).trim(), password, targetRole)
    return Response.json({ message: 'Novo usuário criado', name: user?.name, email: user?.email, role: user?.role })
  } catch (error: unknown) {
    const safeError = toSafeAuthError(error)
    const dbError = error as { message?: string; code?: string; detail?: string; constraint?: string } | null
    const hasDbLikeSignal = !!(
      dbError?.message ||
      dbError?.code ||
      dbError?.detail ||
      dbError?.constraint
    )
    if (safeError.status >= 500 || (safeError.status >= 400 && safeError.status < 500 && hasDbLikeSignal)) {
      console.error('[users/register] db error', {
        status: safeError.status,
        message: dbError?.message,
        code: dbError?.code,
        detail: dbError?.detail,
        constraint: dbError?.constraint,
      })
    }
    return Response.json({ message: safeError.message }, { status: safeError.status })
  }
}
