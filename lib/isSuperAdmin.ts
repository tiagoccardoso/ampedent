import { getCurrentAdminProfile } from './supabaseAuth'

export async function isSuperAdmin() {
  const admin = await getCurrentAdminProfile()
  return admin?.role ?? false
}
