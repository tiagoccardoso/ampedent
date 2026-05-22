import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { createAuthUser } from '@/lib/supabaseAuth'
import { supabaseRequest } from '@/lib/supabaseAdmin'
import { AdminUserRow } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body
    const role = await isSuperAdmin()

    if (role === 'superadmin') {
      if (!name || !email || !password) {
        return Response.json(
          { message: 'Nome, email e senha são obrigatórios' },
          { status: 400 },
        )
      }

      const VALID_ROLES = ['paciente', 'doutor', 'admin', 'superadmin']
      const newRole = VALID_ROLES.includes(body.role) ? body.role : 'paciente'

      const normalizedEmail = email.toLowerCase()
      const normalizedName = name.toLowerCase()
      const authUser = await createAuthUser({
        email: normalizedEmail,
        password,
        name: normalizedName,
      })

      const { data } = await supabaseRequest<AdminUserRow[]>('admin_users', {
        method: 'POST',
        body: {
          auth_user_id: authUser.id,
          email: normalizedEmail,
          name: normalizedName,
          role: newRole,
        },
        searchParams: {
          select: 'id,auth_user_id,email,name,role',
        },
        headers: {
          Prefer: 'return=representation',
        },
      })

      const user = data[0]

      return Response.json({
        message: 'Novo usuário criado',
        name: user?.name,
        email: user?.email,
        role: user?.role,
      })
    }

    return Response.json({ message: 'Não autorizado' }, { status: 401 })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}
