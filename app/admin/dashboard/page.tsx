import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { sql } from '@/lib/neon'
import Link from 'next/link'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-gray-50 text-gray-600 border-gray-200',
  canceled: 'bg-red-50 text-red-600 border-red-200',
  no_show: 'bg-amber-50 text-amber-700 border-amber-200',
}

const statusLabels: Record<string, string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  canceled: 'Cancelado',
  no_show: 'Não compareceu',
}

export default async function DashboardPage() {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  const today = new Date().toISOString().slice(0, 10)

  const [patients, professionals, appointments, todayAppointments, procedures, pendingFinance, overdueFinance, upcoming, recentPatients] =
    await Promise.all([
      sql`select count(*)::int as total from patients`,
      sql`select count(*)::int as total from professionals where is_active = true`,
      sql`select count(*)::int as total from appointments`,
      sql`select count(*)::int as total from appointments where appointment_date = ${today}`,
      sql`select count(*)::int as total from procedures where is_active = true`,
      sql`select coalesce(sum(amount), 0)::numeric as total from financial_entries where status = 'pending'`,
      sql`select coalesce(sum(amount), 0)::numeric as total from financial_entries where status = 'overdue'`,
      sql`
        select a.id, a.appointment_date, a.start_time, a.status,
               p.full_name as patient_name,
               pr.full_name as professional_name
          from appointments a
          join patients p on p.id = a.patient_id
          left join professionals pr on pr.id = a.professional_id
         where a.appointment_date >= ${today}
           and a.status not in ('canceled', 'no_show')
         order by a.appointment_date asc, a.start_time asc
         limit 6
      `,
      sql`select full_name, created_at from patients order by created_at desc limit 5`,
    ])

  const cards = [
    {
      label: 'Pacientes cadastrados',
      value: (patients as any[])[0]?.total ?? 0,
      icon: '👥',
      href: '/admin/patients',
      accent: '#003441',
      lightBg: '#f0f9ff',
    },
    {
      label: 'Profissionais ativos',
      value: (professionals as any[])[0]?.total ?? 0,
      icon: '🩺',
      href: '/admin/professionals',
      accent: '#30628a',
      lightBg: '#f0f6ff',
    },
    {
      label: 'Agendamentos hoje',
      value: (todayAppointments as any[])[0]?.total ?? 0,
      icon: '📅',
      href: '/admin/agenda',
      accent: '#0f4c5c',
      lightBg: '#f0fdf4',
    },
    {
      label: 'Total de agendamentos',
      value: (appointments as any[])[0]?.total ?? 0,
      icon: '📋',
      href: '/admin/appointments',
      accent: '#003441',
      lightBg: '#fafaf0',
    },
    {
      label: 'Procedimentos ativos',
      value: (procedures as any[])[0]?.total ?? 0,
      icon: '🦷',
      href: '/admin/procedures',
      accent: '#735c00',
      lightBg: '#fffbf0',
    },
    {
      label: 'Financeiro pendente',
      value: currency.format(Number((pendingFinance as any[])[0]?.total ?? 0)),
      icon: '⏳',
      href: '/admin/financial',
      accent: '#30628a',
      lightBg: '#f0f4ff',
    },
    {
      label: 'Financeiro vencido',
      value: currency.format(Number((overdueFinance as any[])[0]?.total ?? 0)),
      icon: '⚠️',
      href: '/admin/financial',
      accent: '#ba1a1a',
      lightBg: '#fff5f5',
    },
  ]

  return (
    <section className='space-y-8'>
      {/* Page header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <p
            className='text-xs font-bold tracking-[0.1em] uppercase mb-1'
            style={{ color: '#003441', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Resumo operacional
          </p>
          <h1
            className='text-2xl font-extrabold text-[#003441]'
            style={{ fontFamily: 'Manrope, sans-serif' }}>
            Dashboard da Clínica
          </h1>
          <p className='text-sm text-[#70787c] mt-1'>
            Indicadores em tempo real calculados a partir dos dados do sistema.
          </p>
        </div>
        <div className='flex gap-3'>
          <Link
            href='/admin/agenda'
            className='btn-primary text-sm'>
            + Novo agendamento
          </Link>
          <Link
            href='/admin/patients'
            className='btn-secondary text-sm'>
            + Novo paciente
          </Link>
        </div>
      </div>

      {/* Metric cards */}
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {cards.map(card => (
          <Link
            key={card.label}
            href={card.href}
            className='metric-card flex items-start justify-between group'>
            <div>
              <p
                className='text-xs font-bold tracking-[0.06em] uppercase mb-2 text-[#70787c]'
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {card.label}
              </p>
              <p
                className='text-3xl font-extrabold transition-colors duration-200'
                style={{ color: card.accent, fontFamily: 'Manrope, sans-serif' }}>
                {card.value}
              </p>
            </div>
            <div
              className='w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-transform duration-200 group-hover:scale-110'
              style={{ background: card.lightBg }}>
              {card.icon}
            </div>
          </Link>
        ))}
      </div>

      {/* Tables row */}
      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Upcoming appointments */}
        <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
          <div className='px-6 py-5 border-b border-[#f2f4f5] flex items-center justify-between'>
            <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>
              Próximos agendamentos
            </h2>
            <Link
              href='/admin/agenda'
              className='text-xs font-semibold text-[#30628a] hover:text-[#003441] transition-colors'
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Ver todos →
            </Link>
          </div>
          <div className='divide-y divide-[#f2f4f5]'>
            {(upcoming as any[]).length === 0 ? (
              <div className='px-6 py-10 text-center'>
                <div className='text-3xl mb-2'>📅</div>
                <p className='text-sm text-[#70787c]'>Nenhum agendamento futuro encontrado.</p>
              </div>
            ) : (
              (upcoming as any[]).map(item => (
                <div key={item.id} className='px-6 py-4 flex items-center gap-4 hover:bg-[#f8fafb] transition-colors'>
                  <div
                    className='w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-center'
                    style={{ background: '#f0f6ff' }}>
                    <span className='text-[10px] font-bold text-[#30628a] leading-none'>
                      {new Date(item.appointment_date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                    </span>
                    <span className='text-sm font-extrabold text-[#003441] leading-none'>
                      {new Date(item.appointment_date + 'T00:00:00').getDate()}
                    </span>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='font-semibold text-[#003441] text-sm truncate'>{item.patient_name}</p>
                    <p className='text-xs text-[#70787c] truncate'>
                      {String(item.start_time).slice(0, 5)} · {item.professional_name || 'Profissional a definir'}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full border flex-shrink-0 ${statusColors[item.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {statusLabels[item.status] || item.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent patients */}
        <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
          <div className='px-6 py-5 border-b border-[#f2f4f5] flex items-center justify-between'>
            <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>
              Cadastros recentes
            </h2>
            <Link
              href='/admin/patients'
              className='text-xs font-semibold text-[#30628a] hover:text-[#003441] transition-colors'
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Ver todos →
            </Link>
          </div>
          <div className='divide-y divide-[#f2f4f5]'>
            {(recentPatients as any[]).length === 0 ? (
              <div className='px-6 py-10 text-center'>
                <div className='text-3xl mb-2'>👥</div>
                <p className='text-sm text-[#70787c]'>Nenhum paciente cadastrado ainda.</p>
              </div>
            ) : (
              (recentPatients as any[]).map((patient, index) => (
                <div
                  key={`${patient.full_name}-${index}`}
                  className='px-6 py-4 flex items-center gap-4 hover:bg-[#f8fafb] transition-colors'>
                  <div
                    className='w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm text-white'
                    style={{ background: `hsl(${(index * 47 + 200) % 360}, 55%, 42%)` }}>
                    {patient.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='font-semibold text-[#003441] text-sm truncate'>{patient.full_name}</p>
                    <p className='text-xs text-[#70787c]'>{formatDateTime(patient.created_at)}</p>
                  </div>
                  <span
                    className='text-[10px] font-bold px-2 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 flex-shrink-0'
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Novo
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className='rounded-2xl border border-[#e6e8e9] bg-white p-6'>
        <h2
          className='font-bold text-[#003441] mb-5'
          style={{ fontFamily: 'Manrope, sans-serif' }}>
          Acesso rápido
        </h2>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3'>
          {[
            { href: '/admin/patients', label: 'Pacientes', icon: '👥' },
            { href: '/admin/agenda', label: 'Agenda', icon: '📅' },
            { href: '/admin/records', label: 'Prontuário', icon: '📄' },
            { href: '/admin/procedures', label: 'Procedimentos', icon: '🦷' },
            { href: '/admin/budgets', label: 'Orçamentos', icon: '💰' },
            { href: '/admin/financial', label: 'Financeiro', icon: '📊' },
          ].map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className='flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-[#f2f4f5] transition-colors text-center group'>
              <span className='text-2xl group-hover:scale-110 transition-transform'>{icon}</span>
              <span className='text-xs font-semibold text-[#40484b]' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
