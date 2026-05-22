import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { createUser } from '@/lib/auth'
import { toSafeAuthError } from '@/lib/authApiErrors'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    const role = await isSuperAdmin()
    if (role !== 'superadmin') return Response.json({ message: 'Não autorizado' }, { status: 401 })
    if (!name || !email || !password) return Response.json({ message: 'Nome, email e senha são obrigatórios' }, { status: 400 })
    if (String(password).length < 8) return Response.json({ message: 'A senha deve ter pelo menos 8 caracteres.' }, { status: 400 })

    const user = await createUser(email.toLowerCase().trim(), String(name).trim(), password, 'admin')
    return Response.json({ message: 'Novo usuário criado', name: user?.name, email: user?.email, role: user?.role })
  } catch (error: unknown) {
    const safeError = toSafeAuthError(error)
    if (safeError.status >= 500) console.error('[users/register] erro no cadastro:', error)
    return Response.json({ message: safeError.message }, { status: safeError.status })
  }
}
