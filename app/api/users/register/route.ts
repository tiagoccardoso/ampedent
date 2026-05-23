import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { auth } from '@/lib/auth'
import { AdminRole } from '@/lib/types'
import { headers } from 'next/headers'

const VALID_ROLES: AdminRole[] = ['paciente', 'doutor', 'admin', 'superadmin']

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body
    const role = await isSuperAdmin()

    if (role !== 'superadmin') {
      return Response.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!name || !email || !password) {
      return Response.json(
        { message: 'Nome, email e senha são obrigatórios' },
        { status: 400 },
      )
    }

    const newRole: AdminRole = VALID_ROLES.includes(body.role) ? body.role : 'paciente'

    const result = await auth.api.signUpEmail({
      body: {
        email: email.toLowerCase(),
        password,
        name: name.toLowerCase(),
        role: newRole,
      } as any,
      headers: await headers(),
    })

    const user = result.user as any
    return Response.json({
      message: 'Novo usuário criado',
      name: user.name,
      email: user.email,
      role: user.role,
    })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}
