import { createUser, setSession } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) return Response.json({ message: 'Nome, email e senha são obrigatórios' }, { status: 400 })
    const user = await createUser(email.toLowerCase(), name.toLowerCase(), password, 'admin')
    if (!user) return Response.json({ message: 'Não foi possível cadastrar o usuário' }, { status: 400 })
    await setSession({ id: user.id, email: user.email, name: user.name, role: user.role })
    return Response.json({ authenticated: true, message: 'Cadastro realizado com sucesso' })
  } catch (error: any) {
    return Response.json({ message: error.message ?? 'Não foi possível cadastrar o usuário' }, { status: 400 })
  }
}
