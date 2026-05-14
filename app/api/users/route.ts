import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { mapUser } from '@/lib/supabaseMappers'
import { supabaseRequest } from '@/lib/supabaseAdmin'
import { AdminUserRow } from '@/lib/types'
import { deleteAuthUser, updateAuthUser } from '@/lib/supabaseAuth'

export async function GET() {
  try {
    const role = await isSuperAdmin()
    if (role === 'superadmin' || role === 'admin') {
      const { data: users } = await supabaseRequest<AdminUserRow[]>(
        'admin_users',
        {
          searchParams: {
            select: 'id,auth_user_id,email,name,role',
            order: 'created_at.asc',
          },
        },
      )
      return Response.json({
        message: 'Usuário encontrado',
        users: users.map(mapUser),
      })
    } else {
      return Response.json({ message: 'Não autorizado' }, { status: 401 })
    }
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const role = await isSuperAdmin()
    if (role === 'superadmin') {
      const body = await req.json()
      const { _id, name, email, password } = body

      if (!_id) {
        return Response.json({ message: 'Usuário inválido' }, { status: 400 })
      }

      const normalizedName = name?.toLowerCase()
      const normalizedEmail = email?.toLowerCase()

      await updateAuthUser(_id, {
        email: normalizedEmail,
        password,
        name: normalizedName,
      })

      const updates: Record<string, string> = {}
      if (normalizedName) updates.name = normalizedName
      if (normalizedEmail) updates.email = normalizedEmail

      const { data } = await supabaseRequest<AdminUserRow[]>('admin_users', {
        method: 'PATCH',
        body: updates,
        searchParams: {
          auth_user_id: `eq.${_id}`,
          select: 'id,auth_user_id,email,name,role',
        },
        headers: {
          Prefer: 'return=representation',
        },
      })

      if (!data[0]) {
        throw new Error('Usuário não encontrado')
      }

      return Response.json({ message: 'Usuário atualizado' })
    } else {
      return Response.json({ message: 'Não autorizado' }, { status: 401 })
    }
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const _id = url.searchParams.get('_id')
    const role = await isSuperAdmin()

    if (role === 'superadmin') {
      const { data: users } = await supabaseRequest<AdminUserRow[]>(
        'admin_users',
        {
          searchParams: {
            select: 'id,auth_user_id,role',
            auth_user_id: `eq.${_id}`,
            limit: 1,
          },
        },
      )

      const user = users[0]
      if (!user) {
        throw new Error('Usuário não encontrado')
      }

      if (user.role === 'superadmin') {
        throw new Error('Cannot delete superadmin')
      }

      await deleteAuthUser(_id as string)

      await supabaseRequest<null>('admin_users', {
        method: 'DELETE',
        searchParams: {
          auth_user_id: `eq.${_id}`,
        },
      })

      return Response.json({ message: 'Usuário excluído' })
    } else {
      return Response.json({ message: 'Não autorizado' }, { status: 401 })
    }
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}
