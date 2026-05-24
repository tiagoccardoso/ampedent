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
    const raw: string = error.message ?? ''
    let message = 'Não foi possível criar o usuário. Tente novamente.'
    if (raw.includes('User already exists') || raw.includes('already exists')) {
      message = 'Este email já está cadastrado.'
    } else if (raw.includes('Failed to create user') || raw.includes('FAILED_TO_CREATE_USER')) {
      message = 'Erro ao criar usuário no banco de dados. Verifique se o schema do banco foi atualizado (neon_migration_v2.sql).'
    } else if (raw.includes('Password is too short') || raw.includes('PASSWORD_TOO_SHORT')) {
      message = 'Senha muito curta (mínimo 6 caracteres).'
    } else if (raw.includes('Invalid email') || raw.includes('INVALID_EMAIL')) {
      message = 'Email inválido.'
    }
    const status = raw.includes('already exists') ? 409 : 500
    return Response.json({ message }, { status })
  }
}
