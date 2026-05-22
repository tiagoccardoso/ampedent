import { supabaseRequest } from '@/lib/supabaseAdmin'
import { getCurrentAdminProfile } from '@/lib/supabaseAuth'
import { BookingRow } from '@/lib/types'

export async function GET() {
  try {
    const admin = await getCurrentAdminProfile()
    if (!admin || admin.role !== 'paciente') {
      return Response.json({ message: 'Não autorizado' }, { status: 401 })
    }

    // Find bookings by email
    if (!admin.profile.email) return Response.json({ bookings: [] })

    const { data } = await supabaseRequest<BookingRow[]>('bookings', {
      searchParams: {
        select: '*',
        email: `eq.${admin.profile.email}`,
        order: 'date.desc,time.desc',
        limit: 50,
      },
    })

    return Response.json({
      bookings: data.map(b => ({
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
