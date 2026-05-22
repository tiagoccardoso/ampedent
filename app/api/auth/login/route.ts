import { authenticate, setSession } from '@/lib/auth'
import { SupabaseRequestError } from '@/lib/supabaseAdmin'

function getMissingAuthEnvMessage(error: unknown) {
  if (!(error instanceof Error)) return null
  return error.message.includes('Variável de ambiente') ? error.message : null
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return Response.json({ message: 'Email e senha são obrigatórios' }, { status: 400 })
    const user = await authenticate(email.toLowerCase(), password)
    if (!user) return Response.json({ message: 'Credenciais inválidas' }, { status: 401 })
    await setSession({ id: user.id, email: user.email, name: user.name, role: user.role })
    return Response.json({ message: 'Login realizado com sucesso' })
  } catch (error: unknown) {
    if (error instanceof SupabaseRequestError) {
      const isConfigOrPermissionIssue = error.status === 401 || error.status === 403
      return Response.json(
        {
          message: isConfigOrPermissionIssue
            ? 'Configuração de autenticação indisponível no momento. Tente novamente em instantes.'
            : 'Serviço de autenticação indisponível no momento. Tente novamente em instantes.',
        },
        { status: isConfigOrPermissionIssue ? 500 : 503 },
      )
    }

    const missingAuthEnvMessage = getMissingAuthEnvMessage(error)
    if (missingAuthEnvMessage) {
      console.error('[auth/login] configuração de autenticação ausente:', missingAuthEnvMessage)
      return Response.json(
        { message: 'Não foi possível entrar no momento. Tente novamente em instantes.' },
        { status: 500 },
      )
    }

    return Response.json({ message: 'Não foi possível entrar. Verifique suas credenciais e tente novamente.' }, { status: 401 })
  }
}
