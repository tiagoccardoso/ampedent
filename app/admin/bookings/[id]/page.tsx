'use client'

import { formatDate, formatTime, incrementTimeByOneHour } from '@/lib/dateAndTimeUtils'
import { BookingType } from '@/lib/types'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/components/AppProvider'
import Spinner from '@/app/components/Spinner'

function IndividualBooking({ params }: { params: { id: string } }) {
  const [booking, setBooking] = useState<BookingType>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { status } = useAuth()

  useEffect(() => {
    async function fetchBooking() {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/booking?_id=${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setBooking(data.booking)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBooking()
  }, [params.id])

  async function completeBooking() {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/booking?_id=${params.id}`, { method: 'PUT' })
      if (res.ok) router.push('/admin/bookings')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function cancelBooking() {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/booking/cancel?_id=${params.id}`, { method: 'PUT' })
      if (res.ok) router.push('/admin/bookings')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'unauthenticated') router.push('/admin')

  return (
    <section className='space-y-5'>
      <div className='flex items-center gap-3'>
        <Link href='/admin/bookings' className='btn text-sm'>
          ← Voltar
        </Link>
        <h1 className='page-title text-lg'>Detalhes do agendamento</h1>
      </div>

      {isLoading && <Spinner />}
      {error && <div className='alert alert-error'><span>{error}</span></div>}

      {booking && (
        <div className='card p-6 max-w-2xl'>
          <p className='text-xs text-slate-400 mb-4 font-mono'>{booking._id.toString()}</p>

          <div className='grid md:grid-cols-2 gap-4'>
            <div className='field'>
              <label>Nome</label>
              <input disabled type='text' value={booking.firstName} />
            </div>
            <div className='field'>
              <label>Sobrenome</label>
              <input disabled type='text' value={booking.lastName} />
            </div>
            <div className='field'>
              <label>E-mail</label>
              <input disabled type='email' value={booking.email} />
            </div>
            <div className='field'>
              <label>Telefone</label>
              <input disabled type='text' value={booking.phone} />
            </div>
            <div className='field'>
              <label>Data</label>
              <input disabled type='text' value={formatDate(booking.date.toString())} />
            </div>
            <div className='field'>
              <label>Horário</label>
              <input
                disabled
                type='text'
                value={`${formatTime(booking.time)} – ${incrementTimeByOneHour(booking.time)}`}
              />
            </div>
            <div className='field md:col-span-2'>
              <label>Mensagem</label>
              <textarea disabled value={booking.message} rows={5} />
            </div>
          </div>

          {booking.status === 'pending' && (
            <div className='flex flex-wrap gap-3 mt-6 pt-5 border-t border-slate-100'>
              <button onClick={cancelBooking} disabled={isLoading} type='button' className='btn btn-danger'>
                Cancelar consulta
              </button>
              <button onClick={completeBooking} disabled={isLoading} type='button'
                className='btn btn-primary'>
                Marcar como concluído
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
export default IndividualBooking
