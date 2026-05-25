'use client'

import { BookingType } from '@/lib/types'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDebounce } from '@uidotdev/usehooks'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/components/AppProvider'
import { formatDate, formatTime, incrementTimeByOneHour } from '@/lib/dateAndTimeUtils'
import Spinner from '@/app/components/Spinner'
import Pagination from '@/app/components/admin/Pagination'

const statusLabel: Record<string, string> = {
  completed: 'Concluído',
  canceled: 'Cancelado',
  pending: 'Pendente',
}
const statusClass: Record<string, string> = {
  completed: 'badge badge-success',
  canceled: 'badge badge-error',
  pending: 'badge badge-warning',
}

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

  useEffect(() => { setPage(1) }, [debouncedSearchTerm])

  useEffect(() => {
    async function fetchBookings() {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/booking?status=${filter}&page=${page}&search=${search}`)
        if (res.ok) {
          const data = await res.json()
          setBookings(data.bookings)
          setPages(data.totalPages)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
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

  return (
    <section className='space-y-4'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Agendamentos</h1>
        <p className='text-sm text-gray-500 mt-1'>Gerencie e acompanhe as solicitações de consulta.</p>
      </div>

      {/* Search + Filter */}
      <div className='flex flex-col sm:flex-row gap-3 items-start sm:items-center'>
        <div className='relative flex-1 max-w-sm'>
          {isLoading && (
            <div className='absolute left-3 top-1/2 -translate-y-1/2'>
              <Spinner />
            </div>
          )}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Buscar por nome ou e-mail'
            type='search'
            className='pl-4'
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className='w-auto'>
          <option value='all'>Todos os status</option>
          <option value='pending'>Pendente</option>
          <option value='completed'>Concluído</option>
          <option value='canceled'>Cancelado</option>
        </select>
      </div>

      {error && (
        <p className='rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700'>
          {error}
        </p>
      )}

      {/* Table */}
      <div className='admin-card overflow-auto'>
        <table className='admin-table'>
          <thead>
            <tr>
              <th className='w-36'>ID</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Status</th>
              <th className='text-right'>Agendado para</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && !isLoading && (
              <tr>
                <td colSpan={7} className='py-12 text-center text-gray-400'>
                  Nenhum agendamento encontrado.
                </td>
              </tr>
            )}
            {bookings.map(booking => (
              <tr key={booking._id.toString()}>
                <td className='font-mono text-xs text-gray-400 truncate max-w-[8rem]'>
                  {booking._id.toString().slice(-8)}
                </td>
                <td className='font-medium capitalize'>
                  {booking.firstName} {booking.lastName}
                </td>
                <td className='text-gray-500'>{booking.email}</td>
                <td className='text-gray-500'>{booking.phone}</td>
                <td>
                  <span className={statusClass[booking.status] ?? 'badge badge-neutral'}>
                    {statusLabel[booking.status] ?? booking.status}
                  </span>
                </td>
                <td className='text-right whitespace-nowrap text-sm text-gray-600'>
                  {formatTime(booking.time.toString())}–{incrementTimeByOneHour(booking.time.toString())},{' '}
                  {formatDate(booking.date.toString())}
                </td>
                <td>
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

      {bookings.length > 0 && pages && (
        <Pagination page={page} setPage={setPage} pages={pages} />
      )}
    </section>
  )
}

export default Bookings
