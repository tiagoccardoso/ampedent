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

const statusMap: Record<string, { label: string; cls: string }> = {
  completed: { label: 'Concluído', cls: 'badge badge-success' },
  canceled: { label: 'Cancelado', cls: 'badge badge-error' },
  pending: { label: 'Pendente', cls: 'badge badge-pending' },
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

  useEffect(() => { document.title = 'Agendamentos | Admin | DentalSys' }, [])

  if (status === 'unauthenticated') { router.push('/admin'); return null }

  return (
    <section className='space-y-6'>
      <div className='page-header'>
        <h1 className='page-title'>Agendamentos</h1>
        <p className='page-subtitle'>Gerencie os agendamentos da clínica</p>
      </div>

      {error && (
        <div className='flex items-center gap-2 rounded-lg border border-[#ffdad6] bg-[#fff0ee] px-4 py-3 text-sm text-[#ba1a1a]'>
          <span>⚠</span> {error}
        </div>
      )}

      <div className='section-card'>
        <div className='section-card-header'>
          <div className='flex items-center gap-3'>
            <div className='relative flex-1'>
              {isLoading && <span className='absolute left-3 top-1/2 -translate-y-1/2'><Spinner /></span>}
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className='max-w-xs pl-3'
                placeholder='Buscar por nome ou e-mail'
                type='search'
                aria-label='Buscar agendamentos'
              />
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <label htmlFor='status-filter' className='text-xs text-[#64748b]'>Status:</label>
            <select
              id='status-filter'
              onChange={e => setFilter(e.target.value)}
              className='max-w-[140px] mb-0 text-sm'>
              <option value='all'>Todos</option>
              <option value='pending'>Pendente</option>
              <option value='completed'>Concluído</option>
              <option value='canceled'>Cancelado</option>
            </select>
          </div>
        </div>

        <div className='overflow-auto min-h-[300px]'>
          <table className='admin-table'>
            <thead>
              <tr>
                <th className='hidden lg:table-cell'>ID</th>
                <th>Nome</th>
                <th className='hidden md:table-cell'>E-mail</th>
                <th className='hidden sm:table-cell'>Telefone</th>
                <th>Status</th>
                <th className='hidden md:table-cell text-right'>Horário</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && !isLoading && (
                <tr><td colSpan={7} className='text-center py-10 text-[#64748b] text-sm'>Nenhum agendamento encontrado.</td></tr>
              )}
              {bookings.map(b => {
                const s = statusMap[b.status] ?? statusMap.pending
                return (
                  <tr key={b._id.toString()}>
                    <td className='hidden lg:table-cell font-mono text-xs text-[#64748b]'>{b._id.toString().slice(0, 8)}…</td>
                    <td className='font-medium text-[#0f172a] capitalize'>{b.firstName} {b.lastName}</td>
                    <td className='hidden md:table-cell text-[#64748b]'>{b.email}</td>
                    <td className='hidden sm:table-cell text-[#64748b]'>{b.phone}</td>
                    <td><span className={s.cls}>{s.label}</span></td>
                    <td className='hidden md:table-cell text-right text-[#64748b] text-xs'>
                      {formatTime(b.time.toString())} – {incrementTimeByOneHour(b.time.toString())}<br />
                      {formatDate(b.date.toString())}
                    </td>
                    <td>
                      <Link href={`/admin/bookings/${b._id.toString()}`} className='btn text-xs px-3 py-1.5'>
                        Detalhes
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {bookings.length > 0 && pages && (
          <Pagination page={page} setPage={setPage} pages={pages} />
        )}
      </div>
    </section>
  )
}
export default Bookings
