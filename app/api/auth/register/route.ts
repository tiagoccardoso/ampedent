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
    console.error('[auth/register] erro no cadastro:', error)
    return Response.json({ message: safeError.message }, { status: safeError.status })
  }
}
