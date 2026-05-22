import { allTimes } from '@/data/times'
import { getDb } from '@/lib/db'
import { unstable_noStore as noStore } from 'next/cache'

export async function GET(req: Request) {
  noStore()
  try {
    const url = new URL(req.url)
    const date = url.searchParams.get('date')

    if (!date) throw new Error('Data inválida')

    const selectedDate = new Date(date)
    const dayOfWeek = selectedDate.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      throw new Error('No available times on Saturday or Sunday')
    }

    const selectedDay = selectedDate.toISOString().split('T')[0]
    const sql = getDb()
    const rows = await sql`
      SELECT time, status FROM bookings WHERE date = ${selectedDay}
    ` as { time: string; status: string }[]

    const bookedAndNotCanceledTimes = rows
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
      message: 'Horários disponíveis encontrados',
      availableTimes,
    })
  } catch (error) {
    throw new Error('Não foi possível buscar horários disponíveis: ' + error)
  }
}
