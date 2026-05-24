import { createUser, setSession } from '@/lib/auth'
import { toSafeAuthError } from '@/lib/authApiErrors'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return Response.json({ message: 'Nome, email e senha são obrigatórios' }, { status: 400 })
    }
    if (String(password).length < 8) {
      return Response.json({ message: 'A senha deve ter pelo menos 8 caracteres.' }, { status: 400 })
    }

    const user = await createUser(email.toLowerCase().trim(), String(name).trim(), password, 'admin')

    await setSession({ id: user.id, email: user.email, name: user.name, role: user.role })
    return Response.json({ authenticated: true, message: 'Cadastro realizado com sucesso' })
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
      console.error('[auth/register] db error', {
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
