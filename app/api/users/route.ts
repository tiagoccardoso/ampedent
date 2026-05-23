import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { mapUser } from '@/lib/supabaseMappers'
import { getDb } from '@/lib/db'
import { AdminRole } from '@/lib/types'
import { hashPassword } from '@better-auth/utils/password'

export async function GET() {
  try {
    const role = await isSuperAdmin()
    if (role !== 'superadmin' && role !== 'admin') {
      return Response.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const sql = getDb()
    const rows = await sql`
      SELECT id, email, name, role FROM users ORDER BY created_at ASC
    `
    return Response.json({
      message: 'Usuários encontrados',
      users: (rows as { id: string; email: string; name: string; role: AdminRole }[]).map(mapUser),
    })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const role = await isSuperAdmin()
    if (role !== 'superadmin') {
      return Response.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { _id, name, email, password } = body

    if (!_id) {
      return Response.json({ message: 'Usuário inválido' }, { status: 400 })
    }

    const sql = getDb()
    const userFields: string[] = []
    const userParams: unknown[] = []

    if (name !== undefined) {
      userParams.push(name.toLowerCase())
      userFields.push(`name = $${userParams.length}`)
    }
    if (email !== undefined) {
      userParams.push(email.toLowerCase())
      userFields.push(`email = $${userParams.length}`)
    }

    if (userFields.length > 0) {
      userParams.push(_id)
      await sql.query(
        `UPDATE users SET ${userFields.join(', ')}, updated_at = NOW() WHERE id = $${userParams.length}`,
        userParams as string[],
      )
    }

    if (password) {
      const pwHash = await hashPassword(password)
      await sql.query(
        `UPDATE account SET password = $1, updated_at = NOW() WHERE user_id = $2 AND provider_id = 'credential'`,
        [pwHash, _id],
      )
    }

    if (!userFields.length && !password) {
      return Response.json({ message: 'Nenhum campo para atualizar' }, { status: 400 })
    }

    return Response.json({ message: 'Usuário atualizado' })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const _id = url.searchParams.get('_id')
    const role = await isSuperAdmin()

    if (role !== 'superadmin') {
      return Response.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!_id) {
      return Response.json({ message: 'ID inválido' }, { status: 400 })
    }

    const sql = getDb()
    const rows = await sql`SELECT id, role FROM users WHERE id = ${_id} LIMIT 1`
    const user = rows[0] as { id: string; role: string } | undefined

    if (!user) throw new Error('Usuário não encontrado')
    if (user.role === 'superadmin') throw new Error('Cannot delete superadmin')

    await sql`DELETE FROM users WHERE id = ${_id}`
    return Response.json({ message: 'Usuário excluído' })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}
