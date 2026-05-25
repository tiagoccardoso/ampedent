import { updateUserPassword } from '@/lib/auth'
import { deleteAdminById, getAdminById, listAdminUsers } from '@/lib/db'
import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { mapUser } from '@/lib/dbMappers'
import { sql } from '@/lib/neon'
import { toSafeAuthError } from '@/lib/authApiErrors'

export async function GET() {
  try {
    const role = await isSuperAdmin()
    if (role !== 'superadmin' && role !== 'admin') return Response.json({ message: 'Não autorizado' }, { status: 401 })
    const users = await listAdminUsers()
    return Response.json({ message: 'Usuário encontrado', users: users.map(mapUser) })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const role = await isSuperAdmin()
    if (role !== 'superadmin') return Response.json({ message: 'Permissão insuficiente para editar usuários.' }, { status: 403 })
    const { _id, name, email, password, role: nextRole } = await req.json()
    if (!_id) return Response.json({ message: 'Usuário inválido' }, { status: 400 })
    if (!name || !email) return Response.json({ message: 'Nome e e-mail são obrigatórios.' }, { status: 400 })
    if (name || email || nextRole) {
      await sql`UPDATE "user" SET name = ${String(name).trim()}, email = ${String(email).toLowerCase().trim()}, role = COALESCE(${nextRole ?? null}, role), updated_at = NOW() WHERE id = ${_id}`
    }
    if (password) await updateUserPassword(_id, password)
    return Response.json({ message: 'Usuário atualizado' })
  } catch (error: any) {
    const safeError = toSafeAuthError(error)
    return Response.json({ message: safeError.message }, { status: safeError.status >= 500 ? 500 : safeError.status })
  }
}

export async function DELETE(req: Request) {
  try {
    const _id = new URL(req.url).searchParams.get('_id')
    const role = await isSuperAdmin()
    if (role !== 'superadmin') return Response.json({ message: 'Não autorizado' }, { status: 401 })
    if (!_id) return Response.json({ message: 'Usuário inválido' }, { status: 400 })
    const user = await getAdminById(_id)
    if (!user) throw new Error('Usuário não encontrado')
    if (user.role === 'superadmin') throw new Error('Cannot delete superadmin')
    await deleteAdminById(_id)
    return Response.json({ message: 'Usuário excluído' })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}
