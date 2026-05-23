import { auth } from './auth'
import { headers } from 'next/headers'
import type { AdminRole } from './auth'

export type { AdminRole as UserRole }

const STAFF_ROLES: AdminRole[] = ['doutor', 'admin', 'superadmin']
const ADMIN_ROLES: AdminRole[] = ['admin', 'superadmin']

export async function getRole(): Promise<AdminRole | false> {
  const session = await auth.api.getSession({ headers: await headers() })
  const role = (session?.user as any)?.role as AdminRole | undefined
  return role ?? false
}

export async function requireStaff(): Promise<AdminRole> {
  const role = await getRole()
  if (!role || !STAFF_ROLES.includes(role)) {
    throw new Error('Não autorizado')
  }
  return role
}

export async function requireAdmin(): Promise<AdminRole> {
  const role = await getRole()
  if (!role || !ADMIN_ROLES.includes(role)) {
    throw new Error('Não autorizado')
  }
  return role
}
