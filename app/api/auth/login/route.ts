import { authenticate, setSession } from '@/lib/auth'
import { SupabaseRequestError } from '@/lib/supabaseAdmin'

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
      return Response.json(
        { message: 'Serviço de autenticação indisponível no momento. Tente novamente em instantes.' },
        { status: 503 },
      )
    }

    if (error instanceof Error && error.message.includes('Variável de ambiente')) {
      return Response.json(
        { message: 'Configuração de autenticação incompleta no servidor.' },
        { status: 500 },
      )
    }

    return Response.json({ message: 'Não foi possível entrar. Verifique suas credenciais e tente novamente.' }, { status: 401 })
  }
}
