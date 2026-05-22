import { getCurrentUser } from './auth'

export async function isSuperAdmin() {
  const user = await getCurrentUser()
  return user?.role ?? false
}
