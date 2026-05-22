import { updateUserPassword } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { mapUser } from '@/lib/supabaseMappers'
import { supabaseRequest } from '@/lib/supabaseAdmin'
import { AdminUserRow } from '@/lib/types'

export async function GET() {
  try {
    const role = await isSuperAdmin()
    if (role !== 'superadmin' && role !== 'admin') return Response.json({ message: 'Não autorizado' }, { status: 401 })
    const { data: users } = await supabaseRequest<AdminUserRow[]>('admin_users', { searchParams: { select: 'id,email,name,role', order: 'created_at.asc' } })
    return Response.json({ message: 'Usuário encontrado', users: users.map(mapUser) })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const role = await isSuperAdmin()
    if (role !== 'superadmin') return Response.json({ message: 'Não autorizado' }, { status: 401 })
    const { _id, name, email, password } = await req.json()
    if (!_id) return Response.json({ message: 'Usuário inválido' }, { status: 400 })
    const updates: Record<string, string> = {}
    if (name) updates.name = name.toLowerCase()
    if (email) updates.email = email.toLowerCase()
    if (Object.keys(updates).length) await supabaseRequest('admin_users', { method: 'PATCH', body: updates, searchParams: { id: `eq.${_id}` } })
    if (password) await updateUserPassword(_id, password)
    return Response.json({ message: 'Usuário atualizado' })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const _id = new URL(req.url).searchParams.get('_id')
    const role = await isSuperAdmin()
    if (role !== 'superadmin') return Response.json({ message: 'Não autorizado' }, { status: 401 })
    const { data: users } = await supabaseRequest<AdminUserRow[]>('admin_users', { searchParams: { select: 'id,role', id: `eq.${_id}`, limit: 1 } })
    const user = users[0]
    if (!user) throw new Error('Usuário não encontrado')
    if (user.role === 'superadmin') throw new Error('Cannot delete superadmin')
    await supabaseRequest('admin_users', { method: 'DELETE', searchParams: { id: `eq.${_id}` } })
    return Response.json({ message: 'Usuário excluído' })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}
