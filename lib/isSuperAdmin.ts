import { AdminUserRow } from '@/lib/types'
import { getServerSession } from 'next-auth'
import authOptions from './authOptions'
import { supabaseRequest } from './supabaseAdmin'

export async function isSuperAdmin() {
  const session = await getServerSession(authOptions)
  const name = session?.user?.name

  if (!name) {
    return false
  }

  const { data: users } = await supabaseRequest<AdminUserRow[]>('admin_users', {
    searchParams: {
      select: 'role',
      name: `eq.${name}`,
      limit: 1,
    },
  })

  return users[0]?.role ?? false
}
