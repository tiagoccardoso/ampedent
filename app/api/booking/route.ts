import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { mapBooking } from '@/lib/supabaseMappers'
import { getDb } from '@/lib/db'
import { BookingRow } from '@/lib/types'

function normalizeBookingDate(date: string | Date) {
  return new Date(date).toISOString().split('T')[0]
}

export async function GET(req: Request) {
  try {
    const role = await isSuperAdmin()
    if (role !== 'superadmin' && role !== 'admin' && role !== 'doutor') {
      throw new Error('Não autorizado')
    }

    const url = new URL(req.url)
    const _id = url.searchParams.get('_id')
    const sql = getDb()

    if (_id) {
      const rows = await sql`SELECT * FROM bookings WHERE id = ${_id} LIMIT 1` as BookingRow[]
      return Response.json({
        message: 'Agendamento encontrado',
        booking: rows[0] ? mapBooking(rows[0]) : null,
      })
    }

    const status = url.searchParams.get('status') ?? 'all'
    const search = url.searchParams.get('search') ?? ''
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = 9
    const offset = pageSize * (page - 1)

    const conditions: string[] = []
    const params: unknown[] = []

    if (status !== 'all') {
      params.push(status)
      conditions.push(`status = $${params.length}`)
    }

    if (search.trim()) {
      const term = `%${search.trim()}%`
      params.push(term, term, term, term)
      const n = params.length
      conditions.push(
        `(first_name ILIKE $${n - 3} OR last_name ILIKE $${n - 2} OR phone ILIKE $${n - 1} OR email ILIKE $${n})`,
      )
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const countParams = [...params]

    params.push(pageSize, offset)
    const dataQ = `SELECT * FROM bookings ${where} ORDER BY status DESC, date ASC, time ASC LIMIT $${params.length - 1} OFFSET $${params.length}`
    const countQ = `SELECT COUNT(*)::int AS count FROM bookings ${where}`

    const [countRows, dataRows] = await Promise.all([
      sql.query(countQ, countParams as string[]),
      sql.query(dataQ, params as string[]),
    ])

    const count = (countRows[0] as { count: number }).count

    return Response.json({
      message: 'Agendamentos encontrados',
      bookings: (dataRows as BookingRow[]).map(mapBooking),
      totalPages: Math.ceil(count / pageSize),
    })
  } catch (error) {
    throw new Error('Could not fetch bookings')
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, message, date, time } = body
    const sql = getDb()

    const rows = await sql`
      INSERT INTO bookings (first_name, last_name, email, phone, message, date, time)
      VALUES (${firstName}, ${lastName}, ${email}, ${phone}, ${message ?? null}, ${normalizeBookingDate(date)}, ${time})
      RETURNING *
    ` as BookingRow[]

    return Response.json({
      message: 'Agendamento criado',
      booking: rows[0] ? mapBooking(rows[0]) : null,
    })
  } catch (error: any) {
    throw new Error(error.message)
  }
}

const VALID_BOOKING_STATUSES = ['pending', 'confirmada', 'em_atendimento', 'completed', 'canceled', 'faltou']

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url)
    const _id = url.searchParams.get('_id')
    const role = await isSuperAdmin()

    if (role !== 'superadmin' && role !== 'admin' && role !== 'doutor') {
      return Response.json({ message: 'Não autorizado' }, { status: 401 })
    }

    if (!_id) return Response.json({ message: '_id obrigatório' }, { status: 400 })

    let newStatus = 'completed'
    try {
      const body = await req.json()
      if (body.status && VALID_BOOKING_STATUSES.includes(body.status)) {
        newStatus = body.status
      }
    } catch {
      // No body — keep default 'completed'
    }

    const sql = getDb()
    const rows = await sql`
      UPDATE bookings SET status = ${newStatus}, updated_at = NOW()
      WHERE id = ${_id} RETURNING *
    ` as BookingRow[]
    return Response.json({
      message: 'Agendamento atualizado',
      booking: rows[0] ? mapBooking(rows[0]) : null,
    })
  } catch (error) {
    return Response.json({ message: 'Erro ao atualizar agendamento' }, { status: 500 })
  }
}
