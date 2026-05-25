import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { sql } from '@/lib/neon'

export default async function DashboardPage() {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  const [[patientsRow], [appointmentsRow], [financialRow]] = await Promise.all([
    sql`select count(*) as total from patients`,
    sql`select count(*) as total from appointments where appointment_date >= current_date`,
    sql`select coalesce(sum(amount),0) as total from financial_entries where status='paid'`,
  ]).catch(() => [[{ total: 0 }], [{ total: 0 }], [{ total: 0 }]])

  const stats = [
    {
      label: 'Pacientes cadastrados',
      value: String(patientsRow?.total ?? 0),
      color: 'bg-blue-50 text-blue-700',
      border: 'border-blue-100',
    },
    {
      label: 'Consultas futuras',
      value: String(appointmentsRow?.total ?? 0),
      color: 'bg-teal-50 text-teal-700',
      border: 'border-teal-100',
    },
    {
      label: 'Total recebido',
      value: Number(financialRow?.total ?? 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      color: 'bg-green-50 text-green-700',
      border: 'border-green-100',
    },
  ]

  return (
    <section className='space-y-6'>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Dashboard</h1>
          <p className='page-subtitle'>Resumo operacional da clínica</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {stats.map(stat => (
          <div key={stat.label} className={`card p-5 border ${stat.border}`}>
            <p className='text-sm text-slate-500 mb-1'>{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className='card p-5'>
        <p className='font-semibold text-slate-700 mb-3 text-sm'>Atalhos rápidos</p>
        <div className='flex flex-wrap gap-2'>
          {[
            { href: '/admin/patients', label: 'Novo paciente' },
            { href: '/admin/agenda', label: 'Novo agendamento' },
            { href: '/admin/financial', label: 'Lançamento financeiro' },
          ].map(link => (
            <a key={link.href} href={link.href} className='btn btn-primary text-sm'>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
