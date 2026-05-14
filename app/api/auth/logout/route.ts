import { clearAuthCookies } from '@/lib/supabaseAuth'

export async function POST() {
  await clearAuthCookies()
  return Response.json({ message: 'Logout realizado com sucesso' })
}
