import { getCurrentUser } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { BookingRow } from '@/lib/types'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'paciente') {
      return Response.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!user.email) return Response.json({ bookings: [] })

    const sql = getDb()
    const rows = await sql`
      SELECT * FROM bookings
      WHERE email = ${user.email}
      ORDER BY date DESC, time DESC
      LIMIT 50
    ` as BookingRow[]

    return Response.json({
      bookings: rows.map(b => ({
        id: b.id,
        date: b.date,
        time: b.time,
        status: b.status,
        firstName: b.first_name,
        lastName: b.last_name,
      })),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return Response.json({ message }, { status: 400 })
  }
}
