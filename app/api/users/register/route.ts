import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { createUser } from '@/lib/auth'
import { toSafeAuthError } from '@/lib/authApiErrors'
import { validateRegisterInput } from '@/lib/userValidation'

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const currentRole = await isSuperAdmin()
    if (currentRole !== 'superadmin') return Response.json({ message: 'Permissão insuficiente para cadastrar usuários.' }, { status: 403 })

    const validated = validateRegisterInput(payload)
    if (!validated.ok) return Response.json({ message: validated.message }, { status: validated.status })

    const user = await createUser(validated.data.email, validated.data.name, validated.data.password, 'admin')
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
