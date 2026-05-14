import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { mapBooking } from '@/lib/supabaseMappers'
import { supabaseRequest } from '@/lib/supabaseAdmin'
import { BookingRow } from '@/lib/types'

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url)
    const _id = url.searchParams.get('_id')

    const role = await isSuperAdmin()
    if (role === 'superadmin' || role === 'admin') {
      if (_id) {
        const { data } = await supabaseRequest<BookingRow[]>('bookings', {
          method: 'PATCH',
          body: { status: 'canceled' },
          searchParams: {
            id: `eq.${_id}`,
            select: '*',
          },
          headers: {
            Prefer: 'return=representation',
          },
        })

        return Response.json({
          message: 'Booking updated',
          booking: data[0] ? mapBooking(data[0]) : null,
        })
      }
    } else {
      throw new Error('Unauthorized')
    }
  } catch (error) {
    throw new Error('Could not update bookings')
  }
}
