import { isSuperAdmin } from './isSuperAdmin'

export type UserRole = 'paciente' | 'doutor' | 'admin' | 'superadmin'

// Staff roles (not patients)
const STAFF_ROLES: UserRole[] = ['doutor', 'admin', 'superadmin']
const ADMIN_ROLES: UserRole[] = ['admin', 'superadmin']

export async function getRole(): Promise<UserRole | false> {
  return isSuperAdmin() as Promise<UserRole | false>
}

export async function requireStaff() {
  const role = await getRole()
  if (!role || !STAFF_ROLES.includes(role)) {
    throw new Error('Não autorizado')
  }
  return role
}

export async function requireAdmin() {
  const role = await getRole()
  if (!role || !ADMIN_ROLES.includes(role)) {
    throw new Error('Não autorizado')
  }
  return role
}
