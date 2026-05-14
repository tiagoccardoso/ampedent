import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { mapUser } from '@/lib/supabaseMappers'
import { supabaseRequest } from '@/lib/supabaseAdmin'
import { AdminUserRow } from '@/lib/types'
import bcrypt from 'bcryptjs'

export async function GET(req: Request) {
  try {
    const role = await isSuperAdmin()
    if (role === 'superadmin' || role === 'admin') {
      const { data: users } = await supabaseRequest<AdminUserRow[]>(
        'admin_users',
        {
          searchParams: {
            select: 'id,name,role',
            order: 'created_at.asc',
          },
        },
      )
      return Response.json({
        message: 'Usuário encontrado',
        users: users.map(mapUser),
      })
    } else {
      throw new Error('Unathorized')
    }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function PUT(req: Request) {
  try {
    const role = await isSuperAdmin()
    if (role === 'superadmin') {
      const body = await req.json()
      const { _id, name, password } = body

      const updates: Record<string, string> = {}
      if (name) updates.name = name.toLowerCase()
      if (password && password !== '') {
        updates.password = await bcrypt.hash(password, 10)
      }

      const { data } = await supabaseRequest<AdminUserRow[]>('admin_users', {
        method: 'PATCH',
        body: updates,
        searchParams: {
          id: `eq.${_id}`,
          select: 'id,name,role',
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
      throw new Error('Unathorized')
    }
  } catch (error: any) {
    throw new Error(error.message)
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
            select: 'id,role',
            id: `eq.${_id}`,
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

      await supabaseRequest<null>('admin_users', {
        method: 'DELETE',
        searchParams: {
          id: `eq.${_id}`,
        },
      })

      return Response.json({ message: 'Usuário excluído' })
    } else {
      throw new Error('Unathorized')
    }
  } catch (error) {
    throw error
  }
}
