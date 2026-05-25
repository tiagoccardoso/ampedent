import { getCurrentAdminProfile } from '@/lib/auth'
import { sql } from '@/lib/neon'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  let stats = { total: 0, pending: 0, completed: 0, canceled: 0 }
  let recentBookings: any[] = []

  try {
    const [totals, recent] = await Promise.all([
      sql`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
          COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
          COUNT(*) FILTER (WHERE status = 'canceled')::int AS canceled
        FROM bookings
      `,
      sql`
        SELECT id, first_name, last_name, date, time, status
        FROM bookings
        ORDER BY created_at DESC
        LIMIT 5
      `,
    ])

    if (totals[0]) stats = totals[0] as typeof stats
    recentBookings = recent as any[]
  } catch {
    // DB might not have data yet — fail silently on dashboard
  }

  const statusLabel: Record<string, string> = {
    pending: 'Pendente',
    completed: 'Concluído',
    canceled: 'Cancelado',
  }
  const statusClass: Record<string, string> = {
    pending: 'badge badge-warning',
    completed: 'badge badge-success',
    canceled: 'badge badge-error',
  }

  const cards = [
    { label: 'Total de agendamentos', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/bookings' },
    { label: 'Pendentes', value: stats.pending, color: 'text-yellow-600', bg: 'bg-yellow-50', href: '/admin/bookings' },
    { label: 'Concluídos', value: stats.completed, color: 'text-green-600', bg: 'bg-green-50', href: '/admin/bookings' },
    { label: 'Cancelados', value: stats.canceled, color: 'text-red-500', bg: 'bg-red-50', href: '/admin/bookings' },
  ]

  return (
    <section className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
        <p className='mt-1 text-sm text-gray-500'>
          Bem-vindo, <span className='font-medium text-gray-700'>{admin.profile.name}</span>. Aqui está o resumo da clínica.
        </p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {cards.map(card => (
          <Link key={card.label} href={card.href} className='admin-card group hover:shadow-md transition-shadow'>
            <div className={`inline-flex items-center justify-center h-10 w-10 rounded-lg ${card.bg} mb-3`}>
              <span className={`text-lg font-bold ${card.color}`}>{card.value}</span>
            </div>
            <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
        {[
          { href: '/admin/patients', label: 'Pacientes', desc: 'Gerenciar cadastros' },
          { href: '/admin/agenda', label: 'Agenda', desc: 'Ver consultas do dia' },
          { href: '/admin/procedures', label: 'Procedimentos', desc: 'Catálogo de serviços' },
          { href: '/admin/financial', label: 'Financeiro', desc: 'Receitas e despesas' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className='admin-card hover:border-blue-300 hover:bg-blue-50/50 transition-colors group'>
            <p className='font-semibold text-gray-900 group-hover:text-blue-700 text-sm'>{link.label}</p>
            <p className='text-xs text-gray-500 mt-0.5'>{link.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent bookings */}
      {recentBookings.length > 0 && (
        <div className='admin-card'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-base font-semibold text-gray-900'>Agendamentos recentes</h2>
            <Link href='/admin/bookings' className='text-sm text-blue-600 hover:underline font-medium'>
              Ver todos
            </Link>
          </div>
          <div className='overflow-auto'>
            <table className='admin-table'>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Data</th>
                  <th>Horário</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b: any) => (
                  <tr key={b.id}>
                    <td className='font-medium capitalize'>
                      {b.first_name} {b.last_name}
                    </td>
                    <td>{new Date(b.date).toLocaleDateString('pt-BR')}</td>
                    <td>{String(b.time).slice(0, 5)}</td>
                    <td>
                      <span className={statusClass[b.status] ?? 'badge badge-neutral'}>
                        {statusLabel[b.status] ?? b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {recentBookings.length === 0 && (
        <div className='admin-card flex flex-col items-center justify-center py-12 text-center'>
          <div className='h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3'>
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='text-gray-400'>
              <path d='M8 2v4M16 2v4M3 10h18M21 8H3a2 2 0 00-2 2v10a2 2 0 002 2h18a2 2 0 002-2V10a2 2 0 00-2-2z' />
            </svg>
          </div>
          <p className='text-sm font-medium text-gray-600'>Nenhum agendamento ainda</p>
          <p className='text-xs text-gray-400 mt-1'>Os agendamentos aparecerão aqui quando chegarem.</p>
          <Link
            href='/booking'
            className='mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline font-medium'>
            Agendar consulta →
          </Link>
        </div>
      )}
    </section>
  )
}
