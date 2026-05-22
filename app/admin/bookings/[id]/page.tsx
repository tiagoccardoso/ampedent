'use client'

import {
  formatDate,
  formatTime,
  incrementTimeByOneHour,
} from '@/lib/dateAndTimeUtils'
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
          setIsLoading(false)
        }
      } catch (err: any) {
        setError(err.message)
        setIsLoading(false)
      }
    }
    fetchBooking()
  }, [params.id])

  async function completeBooking() {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/booking?_id=${params.id}`, {
        method: 'PUT',
      })
      if (res.ok) {
        router.push('/admin/bookings')
      }
      setIsLoading(false)
    } catch (err: any) {
      setError(err.message)

      setIsLoading(false)
    }
  }

  async function cancelBooking() {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/booking/cancel?_id=${params.id}`, {
        method: 'PUT',
      })
      if (res.ok) {
        router.push('/admin/bookings')
      }
      setIsLoading(false)
    } catch (err: any) {
      setError(err.message)

      setIsLoading(false)
    }
  }

  if (status === 'unauthenticated') {
    router.push('/admin')
  }

  const statusLabel = (s: string) => {
    if (s === 'completed') return 'Concluído'
    if (s === 'canceled') return 'Cancelado'
    return 'Pendente'
  }

  const statusClass = (s: string) => {
    if (s === 'completed')
      return 'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-green-100 text-green-700'
    if (s === 'canceled')
      return 'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-red-100 text-red-700'
    return 'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-yellow-100 text-yellow-700'
  }

  return (
    <section>
      <Link
        href='/admin/bookings'
        className='inline-flex items-center gap-1.5 p-2 px-3 border rounded hover:border-gray-500 text-sm text-gray-600 hover:text-gray-900 transition-colors'>
        ← Voltar
      </Link>
      {isLoading && (
        <div className='flex justify-center py-12'>
          <Spinner />
        </div>
      )}
      {error && (
        <div className='mt-4 rounded-md bg-red-50 border border-red-200 p-4'>
          <p className='text-red-700 text-sm'>{error}</p>
        </div>
      )}
      {booking && (
        <section className='max-w-3xl w-full mx-auto p-4'>
          <div className='mb-6 mt-4'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6'>
              <div>
                <h1 className='text-xl font-bold text-gray-900 sm:text-2xl'>
                  Agendamento
                </h1>
                <p className='text-xs text-gray-400 font-mono mt-0.5 break-all'>
                  {booking._id.toString()}
                </p>
              </div>
              <span className={statusClass(booking.status)}>
                {statusLabel(booking.status)}
              </span>
            </div>
            <div className='rounded-lg border border-gray-200 overflow-hidden mb-6'>
              <div className='grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100'>
                <div className='p-4'>
                  <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1'>Nome</p>
                  <p className='text-gray-900 font-medium capitalize'>{booking.firstName} {booking.lastName}</p>
                </div>
                <div className='p-4'>
                  <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1'>Email</p>
                  <p className='text-gray-900 break-all'>{booking.email}</p>
                </div>
              </div>
              <div className='border-t border-gray-100 grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100'>
                <div className='p-4'>
                  <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1'>Telefone</p>
                  <p className='text-gray-900'>{booking.phone}</p>
                </div>
                <div className='p-4'>
                  <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1'>Data e Horário</p>
                  <p className='text-gray-900'>{formatDate(booking.date.toString())}</p>
                  <p className='text-sm text-gray-600'>{formatTime(booking.time)} – {incrementTimeByOneHour(booking.time)}</p>
                </div>
              </div>
              {booking.message && (
                <div className='border-t border-gray-100 p-4'>
                  <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1'>Mensagem</p>
                  <p className='text-gray-700 text-sm whitespace-pre-wrap'>{booking.message}</p>
                </div>
              )}
            </div>

              {booking.status === 'pending' && (
                <div className='flex flex-col sm:flex-row gap-3'>
                  <button
                    onClick={cancelBooking}
                    disabled={isLoading}
                    type='button'
                    className='flex-1 sm:flex-none rounded px-5 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors'>
                    Cancelar consulta
                  </button>
                  <button
                    onClick={completeBooking}
                    disabled={isLoading}
                    type='button'
                    className='flex-1 sm:flex-none rounded px-5 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors'>
                    Marcar como concluído
                  </button>
                </div>
              )}
          </div>
        </section>
      )}
    </section>
  )
}

export default IndividualBooking
