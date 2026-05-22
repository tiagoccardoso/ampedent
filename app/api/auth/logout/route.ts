import { clearAuthCookies } from '@/lib/auth'

export async function POST() {
  await clearAuthCookies()
  return Response.json({ message: 'Logout realizado com sucesso' })
}
