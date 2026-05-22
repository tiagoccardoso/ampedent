'use client'

import { BookingType } from '@/lib/types'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDebounce } from '@uidotdev/usehooks'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/components/AppProvider'

import {
  formatDate,
  formatTime,
  incrementTimeByOneHour,
} from '@/lib/dateAndTimeUtils'
import Spinner from '@/app/components/Spinner'
import Pagination from '@/app/components/admin/Pagination'

function Bookings() {
  const [bookings, setBookings] = useState<BookingType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState<number>()
  const debouncedSearchTerm = useDebounce(search, 400)
  const router = useRouter()
  const { status } = useAuth()

  useEffect(() => {
    setPage(1)
  }, [debouncedSearchTerm])

  useEffect(() => {
    async function fetchBookings() {
      try {
        setIsLoading(true)
        const res = await fetch(
          `/api/booking?status=${filter}&page=${page}&search=${search}`,
        )
        if (res.ok) {
          const data = await res.json()
          setBookings(data.bookings)
          setPages(data.totalPages)
          setIsLoading(false)
        }
      } catch (err: any) {
        setIsLoading(false)
        setError(err.message)
      }
    }
    fetchBookings()
  }, [filter, debouncedSearchTerm, page])

  useEffect(() => {
    document.title = 'Agendamentos | Admin | DentalSys'
  }, [])

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
      return 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700'
    if (s === 'canceled')
      return 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-700'
    return 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-700'
  }

  return (
    <section className='grid gap-4'>
      <div className='flex flex-col sm:flex-row gap-3 items-start sm:items-center'>
        <div className='relative flex-1 max-w-md'>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='w-full'
            placeholder='Buscar por nome ou e-mail'
            type='search'
          />
          {isLoading && (
            <span className='absolute right-3 top-1/2 -translate-y-1/2'>
              <Spinner />
            </span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <label htmlFor='status' className='text-sm text-gray-600 whitespace-nowrap'>
            Filtrar:
          </label>
          <select
            name='status'
            id='status'
            onChange={e => setFilter(e.target.value)}
            className='bg-white text-sm'>
            <option value='all'>Todos</option>
            <option value='pending'>Pendente</option>
            <option value='completed'>Concluído</option>
            <option value='canceled'>Cancelado</option>
          </select>
        </div>
      </div>

      {error && (
        <div className='rounded-md bg-red-50 border border-red-200 p-4'>
          <p className='text-red-700 text-sm'>{error}</p>
        </div>
      )}

      <div className='rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full caption-bottom text-sm'>
            <thead className='bg-gray-50'>
              <tr className='border-b border-gray-200'>
                <th className='h-11 px-4 text-left align-middle font-semibold text-gray-600 whitespace-nowrap hidden lg:table-cell'>
                  ID
                </th>
                <th className='h-11 px-4 text-left align-middle font-semibold text-gray-600'>
                  Paciente
                </th>
                <th className='h-11 px-4 text-left align-middle font-semibold text-gray-600 hidden md:table-cell'>
                  Contato
                </th>
                <th className='h-11 px-4 text-left align-middle font-semibold text-gray-600'>
                  Status
                </th>
                <th className='h-11 px-4 text-left align-middle font-semibold text-gray-600 hidden sm:table-cell'>
                  Data / Horário
                </th>
                <th className='h-11 px-4 align-middle font-semibold text-gray-600 text-right'>
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {!isLoading && bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className='p-8 text-center text-gray-500'>
                    <div className='flex flex-col items-center gap-2'>
                      <svg className='w-10 h-10 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                      </svg>
                      <span className='text-sm'>Nenhum agendamento encontrado</span>
                    </div>
                  </td>
                </tr>
              )}
              {bookings.map(booking => (
                <tr
                  className='transition-colors hover:bg-gray-50'
                  key={booking._id.toString()}>
                  <td className='px-4 py-3 align-middle font-mono text-xs text-gray-400 hidden lg:table-cell'>
                    {booking._id.toString().slice(0, 8)}…
                  </td>
                  <td className='px-4 py-3 align-middle'>
                    <span className='font-medium capitalize text-gray-900'>
                      {booking.firstName} {booking.lastName}
                    </span>
                    <div className='text-xs text-gray-500 sm:hidden mt-0.5'>
                      {formatTime(booking.time.toString())} – {incrementTimeByOneHour(booking.time.toString())}, {formatDate(booking.date.toString())}
                    </div>
                  </td>
                  <td className='px-4 py-3 align-middle hidden md:table-cell'>
                    <div className='text-sm text-gray-700'>{booking.email}</div>
                    <div className='text-xs text-gray-500'>{booking.phone}</div>
                  </td>
                  <td className='px-4 py-3 align-middle'>
                    <span className={statusClass(booking.status)}>
                      {statusLabel(booking.status)}
                    </span>
                  </td>
                  <td className='px-4 py-3 align-middle hidden sm:table-cell'>
                    <div className='text-sm text-gray-700 whitespace-nowrap'>
                      {formatDate(booking.date.toString())}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {formatTime(booking.time.toString())} – {incrementTimeByOneHour(booking.time.toString())}
                    </div>
                  </td>
                  <td className='px-4 py-3 align-middle text-right'>
                    <Link
                      href={`/admin/bookings/${booking._id.toString()}`}
                      className='btn text-xs px-3 py-1.5'>
                      Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {bookings.length > 0 && pages && (
        <Pagination page={page} setPage={setPage} pages={pages} />
      )}
    </section>
  )
}
export default Bookings
