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

  async function updateStatus(newStatus: string) {
    try {
      setIsLoading(true)
      setError('')
      const res = await fetch(`/api/booking?_id=${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const data = await res.json()
        setBooking(data.booking)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.message ?? 'Erro ao atualizar status')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'unauthenticated') {
    router.push('/admin')
  }

  const STATUS_LABELS: Record<string, string> = {
    pending: 'Pendente',
    confirmada: 'Confirmada',
    em_atendimento: 'Em atendimento',
    completed: 'Concluído',
    canceled: 'Cancelado',
    faltou: 'Faltou',
  }

  const STATUS_CLASSES: Record<string, string> = {
    pending: 'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-yellow-100 text-yellow-700',
    confirmada: 'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-700',
    em_atendimento: 'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-purple-100 text-purple-700',
    completed: 'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-green-100 text-green-700',
    canceled: 'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-red-100 text-red-700',
    faltou: 'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-orange-100 text-orange-700',
  }

  const statusLabel = (s: string) => STATUS_LABELS[s] ?? s
  const statusClass = (s: string) => STATUS_CLASSES[s] ?? 'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-gray-100 text-gray-600'

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

              {/* Action buttons based on current status */}
              {booking.status !== 'completed' && booking.status !== 'canceled' && booking.status !== 'faltou' && (
                <div className='flex flex-wrap gap-2'>
                  {booking.status === 'pending' && (
                    <button onClick={() => updateStatus('confirmada')} disabled={isLoading}
                      className='rounded px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors'>
                      Confirmar
                    </button>
                  )}
                  {(booking.status === 'pending' || booking.status === 'confirmada') && (
                    <button onClick={() => updateStatus('em_atendimento')} disabled={isLoading}
                      className='rounded px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 transition-colors'>
                      Iniciar atendimento
                    </button>
                  )}
                  {booking.status === 'em_atendimento' && (
                    <button onClick={() => updateStatus('completed')} disabled={isLoading}
                      className='rounded px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 transition-colors'>
                      Concluir
                    </button>
                  )}
                  {(booking.status === 'pending' || booking.status === 'confirmada') && (
                    <button onClick={() => updateStatus('faltou')} disabled={isLoading}
                      className='rounded px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 transition-colors'>
                      Paciente faltou
                    </button>
                  )}
                  <button onClick={() => updateStatus('canceled')} disabled={isLoading}
                    className='rounded px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 transition-colors'>
                    Cancelar
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
