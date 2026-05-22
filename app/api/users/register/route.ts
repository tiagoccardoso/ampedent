import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { createUser } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    const role = await isSuperAdmin()
    if (role !== 'superadmin') return Response.json({ message: 'Não autorizado' }, { status: 401 })
    if (!name || !email || !password) return Response.json({ message: 'Nome, email e senha são obrigatórios' }, { status: 400 })

    const user = await createUser(email.toLowerCase(), name.toLowerCase(), password, 'admin')
    return Response.json({ message: 'Novo usuário criado', name: user?.name, email: user?.email, role: user?.role })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}
