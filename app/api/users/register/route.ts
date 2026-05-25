import { auth } from '@/lib/auth'
import { getRole } from '@/lib/authHelpers'
import { AdminRole } from '@/lib/types'
import { headers } from 'next/headers'

const ALL_ROLES: AdminRole[] = ['paciente', 'doutor', 'admin', 'superadmin']
const STAFF_CREATABLE: AdminRole[] = ['paciente', 'doutor']

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ message: 'Configuração do banco de dados ausente (DATABASE_URL).' }, { status: 503 })
    }

    const currentRole = await getRole()

    if (!currentRole || (currentRole !== 'admin' && currentRole !== 'superadmin')) {
      return Response.json({ message: 'Não autorizado.' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return Response.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
    }

    const { name, email, password, role: requestedRole, image } = body as Record<string, string>

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !password) {
      return Response.json({ message: 'Nome, e-mail e senha são obrigatórios.' }, { status: 400 })
    }
    if (name.trim().length < 3) {
      return Response.json({ message: 'Nome deve ter pelo menos 3 caracteres.' }, { status: 400 })
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return Response.json({ message: 'E-mail inválido.' }, { status: 400 })
    }
    if (password.length < 6) {
      return Response.json({ message: 'Senha deve ter pelo menos 6 caracteres.' }, { status: 400 })
    }

    const newRole: AdminRole = ALL_ROLES.includes(requestedRole as AdminRole)
      ? (requestedRole as AdminRole)
      : 'paciente'

    // Admin can only create paciente/doutor; superadmin can create any role
    if (currentRole === 'admin' && !STAFF_CREATABLE.includes(newRole)) {
      return Response.json(
        { message: 'Administradores só podem criar usuários com perfil Paciente ou Doutor(a).' },
        { status: 403 },
      )
    }

    const result = await auth.api.signUpEmail({
      body: {
        email: email.toLowerCase().trim(),
        password,
        name: name.trim(),
        role: newRole,
        ...(image?.trim() ? { image: image.trim() } : {}),
      } as any,
      headers: await headers(),
    })

    const user = result.user as any
    return Response.json(
      { message: 'Usuário criado com sucesso.', name: user.name, email: user.email, role: user.role },
      { status: 201 },
    )
  } catch (error: any) {
    const raw: string = error.message ?? ''

    if (raw.includes('User already exists') || raw.includes('already exists')) {
      return Response.json({ message: 'Este e-mail já está cadastrado.' }, { status: 409 })
    }
    if (raw.includes('Failed to create user') || raw.includes('FAILED_TO_CREATE_USER')) {
      return Response.json(
        { message: 'Erro ao salvar o usuário no banco de dados. Verifique se o schema foi migrado corretamente (neon_migration_v2.sql).' },
        { status: 500 },
      )
    }
    if (raw.includes('Password is too short') || raw.includes('PASSWORD_TOO_SHORT')) {
      return Response.json({ message: 'Senha muito curta (mínimo 6 caracteres).' }, { status: 400 })
    }
    if (raw.includes('Invalid email') || raw.includes('INVALID_EMAIL')) {
      return Response.json({ message: 'E-mail inválido.' }, { status: 400 })
    }

    // Don't expose internal error details to the client
    console.error('[/api/users/register] Unexpected error:', raw)
    return Response.json({ message: 'Erro interno ao criar o usuário. Tente novamente.' }, { status: 500 })
  }
}
