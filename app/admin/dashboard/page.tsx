import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { sql } from '@/lib/neon'
import Link from 'next/link'

export default async function DashboardPage() {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  const [bookingsCount, patientsCount, appointmentsToday, pendingFinancial] = await Promise.allSettled([
    sql`select count(*) as total from bookings where status='pending'`,
    sql`select count(*) as total from patients`,
    sql`select count(*) as total from appointments where appointment_date = current_date`,
    sql`select count(*) as total from financial_entries where status='pending'`,
  ])

  const pending = bookingsCount.status === 'fulfilled' ? Number((bookingsCount.value as any[])[0]?.total ?? 0) : 0
  const patients = patientsCount.status === 'fulfilled' ? Number((patientsCount.value as any[])[0]?.total ?? 0) : 0
  const todayApts = appointmentsToday.status === 'fulfilled' ? Number((appointmentsToday.value as any[])[0]?.total ?? 0) : 0
  const pendingFin = pendingFinancial.status === 'fulfilled' ? Number((pendingFinancial.value as any[])[0]?.total ?? 0) : 0

  const stats = [
    { label: 'Agendamentos pendentes', value: pending, href: '/admin/bookings', color: '#fef3c7', text: '#92400e' },
    { label: 'Total de pacientes', value: patients, href: '/admin/patients', color: '#e5eeff', text: '#0e7490' },
    { label: 'Consultas hoje', value: todayApts, href: '/admin/agenda', color: '#dcfce7', text: '#006c49' },
    { label: 'Cobranças pendentes', value: pendingFin, href: '/admin/financial', color: '#fce7f3', text: '#9d174d' },
  ]

  const shortcuts = [
    { label: 'Novo paciente', href: '/admin/patients', desc: 'Cadastrar paciente' },
    { label: 'Nova consulta', href: '/admin/agenda', desc: 'Agendar consulta' },
    { label: 'Novo orçamento', href: '/admin/budgets', desc: 'Criar orçamento' },
    { label: 'Registros financeiros', href: '/admin/financial', desc: 'Gestão financeira' },
  ]

  return (
    <section className='space-y-6'>
      <div className='page-header'>
        <h1 className='page-title'>Dashboard da Clínica</h1>
        <p className='page-subtitle'>Olá, {admin.profile.name}. Aqui está o resumo de hoje.</p>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {stats.map(s => (
          <Link
            key={s.label}
            href={s.href}
            className='bg-white rounded-xl border border-[#e5e7eb] p-4 shadow-card hover:shadow-card-hover transition-shadow'>
            <p className='text-xs font-medium text-[#64748b] mb-1'>{s.label}</p>
            <p className='text-3xl font-bold' style={{ color: s.text }}>{s.value}</p>
            <span
              className='inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full'
              style={{ background: s.color, color: s.text }}>
              ver →
            </span>
          </Link>
        ))}
      </div>

      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[#0f172a]'>Acesso rápido</h2>
        </div>
        <div className='section-card-body grid grid-cols-2 md:grid-cols-4 gap-3'>
          {shortcuts.map(s => (
            <Link
              key={s.label}
              href={s.href}
              className='flex flex-col gap-1 p-4 rounded-lg border border-[#e5e7eb] hover:border-[#0e7490] hover:bg-[#f0f9ff] transition-colors'>
              <p className='text-sm font-semibold text-[#0f172a]'>{s.label}</p>
              <p className='text-xs text-[#64748b]'>{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
