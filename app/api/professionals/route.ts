import { sql } from '@/lib/neon'

export async function GET() {
  try {
    const rows = await sql`SELECT id, full_name, specialty FROM professionals WHERE is_active = true ORDER BY full_name ASC`
    return Response.json({ professionals: rows })
  } catch (error) {
    console.error('[api/professionals]', error instanceof Error ? error.message : error)
    return Response.json({ professionals: [] }, { status: 500 })
  }
}
