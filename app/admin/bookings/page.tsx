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
  canceled:  'Cancelado',
  pending:   'Pendente',
}
const statusBadge: Record<string, string> = {
  completed: 'badge-completed',
  canceled:  'badge-canceled',
  pending:   'badge-pending',
}

function Bookings() {
  const [bookings, setBookings] = useState<BookingType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState<number>()
  const debouncedSearch = useDebounce(search, 400)
  const router = useRouter()
  const { status } = useAuth()

  useEffect(() => { setPage(1) }, [debouncedSearch])

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
  }, [filter, debouncedSearch, page])

  useEffect(() => {
    document.title = 'Agendamentos | Admin | DentalSys'
  }, [])

  if (status === 'unauthenticated') router.push('/admin')

  return (
    <section className='space-y-5'>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Agendamentos</h1>
          <p className='page-subtitle'>Consultas via formulário público</p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1 max-w-sm'>
          {isLoading && (
            <span className='absolute right-3 top-1/2 -translate-y-1/2'>
              <Spinner />
            </span>
          )}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Buscar por nome ou e-mail'
            type='search'
            className='pr-10'
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className='w-full sm:w-44'>
          <option value='all'>Todos</option>
          <option value='pending'>Pendente</option>
          <option value='completed'>Concluído</option>
          <option value='canceled'>Cancelado</option>
        </select>
      </div>

      {error && <div className='alert alert-error'><span>{error}</span></div>}

      {/* Table */}
      <div className='card overflow-hidden'>
        <div className='md:min-h-[500px] overflow-x-auto'>
          {bookings.length === 0 && !isLoading ? (
            <div className='px-6 py-12 text-center text-slate-400 text-sm'>
              Nenhum agendamento encontrado.
            </div>
          ) : (
            <table className='data-table'>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  <th>Horário</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking._id.toString()}>
                    <td className='font-medium capitalize'>
                      {booking.firstName} {booking.lastName}
                    </td>
                    <td>{booking.email}</td>
                    <td>{booking.phone}</td>
                    <td>
                      <span className={`badge ${statusBadge[booking.status] ?? 'badge-pending'}`}>
                        {statusLabel[booking.status] ?? booking.status}
                      </span>
                    </td>
                    <td className='whitespace-nowrap text-slate-600'>
                      {formatTime(booking.time.toString())} – {incrementTimeByOneHour(booking.time.toString())},&nbsp;
                      {formatDate(booking.date.toString())}
                    </td>
                    <td>
                      <Link href={`/admin/bookings/${booking._id}`} className='btn text-xs'>
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {bookings.length > 0 && pages && (
        <Pagination page={page} setPage={setPage} pages={pages} />
      )}
    </section>
  )
}
export default Bookings
