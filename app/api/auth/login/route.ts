import { signInWithPassword } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return Response.json({ message: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    await signInWithPassword(email, password)
    return Response.json({ message: 'Login realizado com sucesso' })
  } catch (error: any) {
    return Response.json(
      { message: error.message ?? 'Não foi possível entrar' },
      { status: 401 },
    )
  }
}
