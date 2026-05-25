import { allTimes } from '@/data/times'
import { dataApiRequest } from '@/lib/dataApi'
import { sql } from '@/lib/neon'
import { BookingRow } from '@/lib/types'
import { unstable_noStore as noStore } from 'next/cache'

function generateSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number,
): string[] {
  // startTime / endTime chegam do PostgreSQL como 'HH:MM:SS'
  // retorna slots no formato 'HH:MM:00.000Z' compatível com a tabela bookings
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const startMin = sh * 60 + sm
  const endMin = eh * 60 + em
  const slots: string[] = []
  for (let m = startMin; m + durationMinutes <= endMin; m += durationMinutes) {
    const h = Math.floor(m / 60).toString().padStart(2, '0')
    const min = (m % 60).toString().padStart(2, '0')
    slots.push(`${h}:${min}:00.000Z`)
  }
  return slots
}

export async function GET(req: Request) {
  noStore()
  try {
    const url = new URL(req.url)
    const date = url.searchParams.get('date')
    const professionalId = url.searchParams.get('professional_id')

    if (!date) throw new Error('Data inválida')

    const selectedDate = new Date(date)
    const selectedDay = selectedDate.toISOString().split('T')[0]
    const dayOfWeek = selectedDate.getDay()

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return Response.json({
        availableTimes: [],
        message: 'Nenhum horário disponível aos fins de semana',
      })
    }

    // ── Modo com profissional: cálcula a partir da agenda configurada ──
    if (professionalId) {
      const scheduleRows = await sql`
        SELECT start_time, end_time, slot_duration_minutes
        FROM professional_schedules
        WHERE professional_id = ${professionalId}::uuid
          AND day_of_week = ${dayOfWeek}
          AND is_active = true
      `

      if (scheduleRows.length === 0) {
        return Response.json({
          availableTimes: [],
          message: 'Profissional não atende neste dia',
        })
      }

      const schedule = scheduleRows[0] as {
        start_time: string
        end_time: string
        slot_duration_minutes: number
      }

      const allSlots = generateSlots(
        schedule.start_time,
        schedule.end_time,
        schedule.slot_duration_minutes,
      )

      // Horários já agendados (não cancelados) para este profissional nesta data
      const bookedRows = await sql`
        SELECT time FROM bookings
        WHERE professional_id = ${professionalId}::uuid
          AND date = ${selectedDay}::date
          AND status != 'canceled'
      `
      const bookedTimes = new Set(
        (bookedRows as { time: string }[]).map(r => r.time),
      )

      // Bloqueios cadastrados para este profissional nesta data
      const blockRows = await sql`
        SELECT start_time, end_time
        FROM schedule_blocks
        WHERE professional_id = ${professionalId}::uuid
          AND block_date = ${selectedDay}::date
      `
      const blocks = blockRows as {
        start_time: string | null
        end_time: string | null
      }[]

      const now = new Date()
      const isToday = selectedDay === now.toISOString().split('T')[0]
      const currentUTCMinutes = now.getUTCHours() * 60 + now.getUTCMinutes()

      const available = allSlots.filter(slot => {
        if (bookedTimes.has(slot)) return false

        const [sh, sm] = slot.split(':').map(Number)
        const slotMin = sh * 60 + sm

        for (const block of blocks) {
          if (!block.start_time && !block.end_time) return false // dia inteiro bloqueado
          if (block.start_time && block.end_time) {
            const [bsh, bsm] = block.start_time.split(':').map(Number)
            const [beh, bem] = block.end_time.split(':').map(Number)
            if (slotMin >= bsh * 60 + bsm && slotMin < beh * 60 + bem) return false
          }
        }

        if (isToday && slotMin <= currentUTCMinutes) return false

        return true
      })

      return Response.json({
        availableTimes: available,
        message:
          available.length > 0
            ? 'Horários disponíveis encontrados'
            : 'Nenhum horário disponível para esta data',
      })
    }

    // ── Fallback sem profissional: comportamento original ──
    const { data: bookings } = await dataApiRequest<
      Pick<BookingRow, 'time' | 'status'>[]
    >('bookings', {
      searchParams: {
        select: 'time,status',
        date: `eq.${selectedDay}`,
      },
    })

    const bookedAndNotCanceledTimes = bookings
      .filter(b => b.status !== 'canceled')
      .map(b => b.time)

    const utcTime = new Date().getTime()
    const dstOffset = new Date(utcTime).getTimezoneOffset() / 60
    const cetOffset = dstOffset < 60 ? 60 : 120
    const currentCETTime = new Date(utcTime + cetOffset * 60 * 1000)

    const availableTimes = allTimes.filter(time => {
      const availableTime = new Date(`${selectedDay}T${time}`)
      return (
        availableTime.getTime() > currentCETTime.getTime() &&
        !bookedAndNotCanceledTimes.includes(time)
      )
    })

    return Response.json({
      availableTimes,
      message: 'Horários disponíveis encontrados',
    })
  } catch (error) {
    throw new Error('Não foi possível buscar horários disponíveis: ' + error)
  }
}
