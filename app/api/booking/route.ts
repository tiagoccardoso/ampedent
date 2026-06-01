import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { mapBooking } from '@/lib/dbMappers'
import { dataApiRequest } from '@/lib/dataApi'
import { BookingRow } from '@/lib/types'

function normalizeBookingDate(date: string | Date) {
  return new Date(date).toISOString().split('T')[0]
}

function buildSearchFilter(search: string) {
  const term = search.trim()
  if (!term) return undefined
  return `(first_name.ilike.*${term}*,last_name.ilike.*${term}*,phone.ilike.*${term}*,email.ilike.*${term}*)`
}

export async function GET(req: Request) {
  try {
    const role = await isSuperAdmin()
    if (role !== 'superadmin' && role !== 'admin') throw new Error('Não autorizado')

    const url = new URL(req.url)
    const _id = url.searchParams.get('_id')

    if (_id) {
      const { data } = await dataApiRequest<BookingRow[]>('bookings', {
        searchParams: { select: '*', id: `eq.${_id}`, limit: 1 },
      })
      return Response.json({ message: 'Agendamento encontrado', booking: data[0] ? mapBooking(data[0]) : null })
    }

    const status = url.searchParams.get('status') ?? 'all'
    const search = url.searchParams.get('search') ?? ''
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = 9
    const offset = pageSize * (page - 1)
    const searchFilter = buildSearchFilter(search)
    const searchParams: Record<string, string | number | undefined> = { select: '*', limit: pageSize, offset, order: 'status.desc,date.asc,time.asc' }
    if (status !== 'all') searchParams.status = `eq.${status}`
    if (searchFilter) searchParams.or = searchFilter

    const { data, count } = await dataApiRequest<BookingRow[]>('bookings', { searchParams, headers: { Prefer: 'count=exact' } })

    return Response.json({ message: 'Agendamentos encontrados', bookings: data.map(mapBooking), totalPages: Math.ceil((count ?? 0) / pageSize) })
  } catch (error) {
    console.error('booking.get', error)

    return Response.json(
      { message: 'Não foi possível carregar os agendamentos.', bookings: [], totalPages: 0 },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, message, date, time, professionalId } = body
    if (!professionalId) return Response.json({ message: 'Profissional é obrigatório' }, { status: 400 })

    const { data: conflicts } = await dataApiRequest<BookingRow[]>('bookings', {
      searchParams: { select: 'id', professional_id: `eq.${professionalId}`, date: `eq.${normalizeBookingDate(date)}`, time: `eq.${time}`, status: 'neq.canceled', limit: 1 },
    })

    if (conflicts.length > 0) return Response.json({ message: 'Este horário não está mais disponível.' }, { status: 409 })

    const { data } = await dataApiRequest<BookingRow[]>('bookings', {
      method: 'POST',
      body: { first_name: firstName, last_name: lastName, email, phone, message: message || null, date: normalizeBookingDate(date), time, professional_id: professionalId },
      searchParams: { select: '*' },
      headers: { Prefer: 'return=representation' },
    })

    return Response.json({ message: 'Agendamento criado', booking: data[0] ? mapBooking(data[0]) : null })
  } catch (error) {
    console.error('booking.create', error)

    return Response.json(
      { message: 'Não foi possível concluir o agendamento. Tente novamente ou contate a clínica.' },
      { status: 500 },
    )
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url)
    const _id = url.searchParams.get('_id')
    const role = await isSuperAdmin()
    if (role !== 'superadmin' && role !== 'admin') throw new Error('Não autorizado')

    if (_id) {
      const { data } = await dataApiRequest<BookingRow[]>('bookings', {
        method: 'PATCH',
        body: { status: 'completed' },
        searchParams: { id: `eq.${_id}`, select: '*' },
        headers: { Prefer: 'return=representation' },
      })

      return Response.json({ message: 'Agendamento atualizado', booking: data[0] ? mapBooking(data[0]) : null })
    }
  } catch (error) {
    console.error('booking.update', error)

    return Response.json(
      { message: 'Não foi possível atualizar o agendamento.' },
      { status: 500 },
    )
  }
}
