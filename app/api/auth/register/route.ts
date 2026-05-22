import { createUser, signInWithPassword } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return Response.json(
        { message: 'Nome, email e senha são obrigatórios' },
        { status: 400 },
      )
    }

    await createUser({
      email: email.toLowerCase(),
      password,
      name: name.toLowerCase(),
      role: 'paciente',
    })

    await signInWithPassword(email.toLowerCase(), password)

    return Response.json({
      authenticated: true,
      message: 'Cadastro realizado com sucesso',
    })
  } catch (error: any) {
    return Response.json(
      { message: error.message ?? 'Não foi possível cadastrar o usuário' },
      { status: 400 },
    )
  }
}
