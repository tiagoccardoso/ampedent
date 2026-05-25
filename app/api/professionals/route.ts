import { sql } from '@/lib/neon'
import { unstable_noStore as noStore } from 'next/cache'

export async function GET() {
  noStore()
  try {
    const rows = await sql`
      SELECT id, full_name, specialty
      FROM professionals
      WHERE is_active = true
      ORDER BY full_name
    `
    return Response.json({ professionals: rows })
  } catch {
    return Response.json(
      { error: 'Não foi possível listar profissionais' },
      { status: 500 },
    )
  }
}
