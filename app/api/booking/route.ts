import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { mapBooking } from '@/lib/dbMappers'
import { dataApiRequest } from '@/lib/dataApi'
import { sql } from '@/lib/neon'
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
    if (role === 'superadmin' || role === 'admin') {
      const url = new URL(req.url)
      const _id = url.searchParams.get('_id')

      if (_id) {
        const { data } = await dataApiRequest<BookingRow[]>('bookings', {
          searchParams: { select: '*', id: `eq.${_id}`, limit: 1 },
        })
        return Response.json({
          message: 'Agendamento encontrado',
          booking: data[0] ? mapBooking(data[0]) : null,
        })
      }

      const status = url.searchParams.get('status') ?? 'all'
      const search = url.searchParams.get('search') ?? ''
      const page = Number(url.searchParams.get('page')) || 1
      const pageSize = 9
      const offset = pageSize * (page - 1)
      const searchFilter = buildSearchFilter(search)

      const searchParams: Record<string, string | number | undefined> = {
        select: '*',
        limit: pageSize,
        offset,
        order: 'status.desc,date.asc,time.asc',
      }

      if (status !== 'all') searchParams.status = `eq.${status}`
      if (searchFilter) searchParams.or = searchFilter

      const { data, count } = await dataApiRequest<BookingRow[]>('bookings', {
        searchParams,
        headers: { Prefer: 'count=exact' },
      })

      return Response.json({
        message: 'Agendamentos encontrados',
        bookings: data.map(mapBooking),
        totalPages: Math.ceil((count ?? 0) / pageSize),
      })
    } else {
      throw new Error('Não autorizado')
    }
  } catch {
    throw new Error('Could not fetch bookings')
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, message, date, time, professionalId } =
      body

    const normalizedDate = normalizeBookingDate(date)

    // Validação básica de campos obrigatórios
    if (!firstName || !lastName || !email || !phone || !date || !time) {
      return Response.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 })
    }

    // Verificação de conflito no backend quando há profissional vinculado
    if (professionalId) {
      const conflict = await sql`
        SELECT id FROM bookings
        WHERE professional_id = ${professionalId}::uuid
          AND date = ${normalizedDate}::date
          AND time = ${time}
          AND status != 'canceled'
        LIMIT 1
      `
      if (conflict.length > 0) {
        return Response.json(
          { error: 'Horário já ocupado. Por favor, escolha outro horário.' },
          { status: 409 },
        )
      }
    }

    const { data } = await dataApiRequest<BookingRow[]>('bookings', {
      method: 'POST',
      body: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        message: message || null,
        date: normalizedDate,
        time,
        professional_id: professionalId || null,
      },
      searchParams: { select: '*' },
      headers: { Prefer: 'return=representation' },
    })

    return Response.json({
      message: 'Agendamento criado',
      booking: data[0] ? mapBooking(data[0]) : null,
    })
  } catch (error: any) {
    // Captura violação de constraint única do banco (race condition)
    if (
      error?.status === 409 ||
      String(error?.message).toLowerCase().includes('unique') ||
      String(error?.message).toLowerCase().includes('conflict')
    ) {
      return Response.json(
        { error: 'Horário já ocupado. Por favor, escolha outro horário.' },
        { status: 409 },
      )
    }
    throw new Error(error.message)
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url)
    const _id = url.searchParams.get('_id')
    const role = await isSuperAdmin()

    if (role === 'superadmin' || role === 'admin') {
      if (_id) {
        const { data } = await dataApiRequest<BookingRow[]>('bookings', {
          method: 'PATCH',
          body: { status: 'completed' },
          searchParams: { id: `eq.${_id}`, select: '*' },
          headers: { Prefer: 'return=representation' },
        })
        return Response.json({
          message: 'Agendamento atualizado',
          booking: data[0] ? mapBooking(data[0]) : null,
        })
      }
    } else {
      throw new Error('Não autorizado')
    }
  } catch {
    throw new Error('Could not update bookings')
  }
}
