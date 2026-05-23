import { getRole } from './authHelpers'

export async function isSuperAdmin() {
  return getRole()
}
