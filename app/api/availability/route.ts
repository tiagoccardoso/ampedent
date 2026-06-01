import { sql } from '@/lib/neon'
import { BookingRow } from '@/lib/types'
import { unstable_noStore as noStore } from 'next/cache'

type ProfessionalScheduleRow = {
  professional_id: string
  weekday: number
  start_time: string
  end_time: string
  break_start: string | null
  break_end: string | null
  appointment_duration_minutes: number
  is_active: boolean
}

const TZ = 'America/Sao_Paulo'

function toDateInSaoPaulo(dateText: string) {
  return new Date(`${dateText}T00:00:00-03:00`)
}

function toMinuteOfDay(time: string) {
  const [h, m] = time.slice(0, 5).split(':').map(Number)
  return h * 60 + m
}

function toTime(minutes: number) {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0')
  const m = String(minutes % 60).padStart(2, '0')
  return `${h}:${m}:00`
}

export async function GET(req: Request) {
  noStore()
  const url = new URL(req.url)
  const date = url.searchParams.get('date')
  const professionalId = url.searchParams.get('professionalId')

  if (!date || !professionalId) {
    return Response.json({ message: 'Profissional e data são obrigatórios', availableTimes: [] }, { status: 400 })
  }

  const selectedDate = toDateInSaoPaulo(date)
  const weekday = selectedDate.getUTCDay()

  let schedules: ProfessionalScheduleRow[]
  let bookings: Pick<BookingRow, 'time' | 'status'>[]
  try {
    const scheduleRows = await sql`
      SELECT professional_id, weekday, start_time, end_time, break_start, break_end, appointment_duration_minutes, is_active
      FROM professional_schedules
      WHERE professional_id = ${professionalId}::uuid
        AND weekday = ${weekday}
        AND is_active = true
      LIMIT 1
    `
    schedules = scheduleRows as ProfessionalScheduleRow[]

    const bookingRows = await sql`
      SELECT time, status FROM bookings
      WHERE date = ${date}::date
        AND professional_id = ${professionalId}::uuid
    `
    bookings = bookingRows as Pick<BookingRow, 'time' | 'status'>[]
  } catch (error) {
    console.error('[api/availability]', error instanceof Error ? error.message : error)
    return Response.json({ message: 'Erro ao buscar disponibilidade', availableTimes: [] }, { status: 500 })
  }

  if (!schedules.length) {
    return Response.json({ message: 'Nenhum horário configurado para este dia', availableTimes: [] })
  }

  const schedule = schedules[0]
  const booked = new Set(bookings.filter(b => b.status !== 'canceled').map(b => b.time))

  const start = toMinuteOfDay(schedule.start_time)
  const end = toMinuteOfDay(schedule.end_time)
  const breakStart = schedule.break_start ? toMinuteOfDay(schedule.break_start) : null
  const breakEnd = schedule.break_end ? toMinuteOfDay(schedule.break_end) : null

  const nowInBr = new Date(new Date().toLocaleString('en-US', { timeZone: TZ }))
  const todayBr = nowInBr.toISOString().slice(0, 10)

  const slots: string[] = []
  for (let current = start; current + schedule.appointment_duration_minutes <= end; current += schedule.appointment_duration_minutes) {
    const isInBreak = breakStart !== null && breakEnd !== null && current >= breakStart && current < breakEnd
    if (isInBreak) continue

    const time = toTime(current)
    const isPastToday = date === todayBr && toMinuteOfDay(time) <= (nowInBr.getHours() * 60 + nowInBr.getMinutes())
    if (isPastToday) continue
    if (booked.has(time)) continue
    slots.push(time)
  }

  return Response.json({ message: 'Horários disponíveis encontrados', availableTimes: slots })
}
