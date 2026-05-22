import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { mapBooking } from '@/lib/supabaseMappers'
import { getDb } from '@/lib/db'
import { BookingRow } from '@/lib/types'

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url)
    const _id = url.searchParams.get('_id')

    const role = await isSuperAdmin()
    if (role !== 'superadmin' && role !== 'admin') {
      throw new Error('Não autorizado')
    }

    if (_id) {
      const sql = getDb()
      const rows = await sql`
        UPDATE bookings SET status = 'canceled', updated_at = NOW()
        WHERE id = ${_id} RETURNING *
      ` as BookingRow[]

      return Response.json({
        message: 'Agendamento atualizado',
        booking: rows[0] ? mapBooking(rows[0]) : null,
      })
    }
  } catch (error) {
    throw new Error('Could not update bookings')
  }
}
