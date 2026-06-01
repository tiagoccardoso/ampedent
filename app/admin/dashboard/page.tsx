import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { sql } from '@/lib/neon'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default async function DashboardPage() {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  const today = new Date().toISOString().slice(0, 10)
  const [patients, professionals, appointments, todayAppointments, procedures, pendingFinance, overdueFinance, upcoming, recentPatients] = await Promise.all([
    sql`select count(*)::int as total from patients`,
    sql`select count(*)::int as total from professionals where is_active = true`,
    sql`select count(*)::int as total from appointments`,
    sql`select count(*)::int as total from appointments where appointment_date = ${today}`,
    sql`select count(*)::int as total from procedures where is_active = true`,
    sql`select coalesce(sum(amount), 0)::numeric as total from financial_entries where status = 'pending'`,
    sql`select coalesce(sum(amount), 0)::numeric as total from financial_entries where status = 'overdue'`,
    sql`
      select a.id, a.appointment_date, a.start_time, a.status, p.full_name as patient_name, pr.full_name as professional_name
        from appointments a
        join patients p on p.id = a.patient_id
        left join professionals pr on pr.id = a.professional_id
       where a.appointment_date >= ${today} and a.status not in ('canceled', 'no_show')
       order by a.appointment_date asc, a.start_time asc
       limit 5
    `,
    sql`select full_name, created_at from patients order by created_at desc limit 5`,
  ])

  const cards = [
    { label: 'Pacientes cadastrados', value: (patients as any[])[0]?.total ?? 0 },
    { label: 'Profissionais ativos', value: (professionals as any[])[0]?.total ?? 0 },
    { label: 'Agendamentos totais', value: (appointments as any[])[0]?.total ?? 0 },
    { label: 'Agendamentos de hoje', value: (todayAppointments as any[])[0]?.total ?? 0 },
    { label: 'Procedimentos ativos', value: (procedures as any[])[0]?.total ?? 0 },
    { label: 'Financeiro pendente', value: currency.format(Number((pendingFinance as any[])[0]?.total ?? 0)) },
    { label: 'Financeiro vencido', value: currency.format(Number((overdueFinance as any[])[0]?.total ?? 0)) },
  ]

  return (
    <section className='space-y-8'>
      <div>
        <p className='text-sm font-semibold uppercase tracking-wide text-blue-700'>Resumo operacional</p>
        <h1 className='text-2xl font-bold'>Dashboard da Clínica</h1>
        <p className='text-sm text-gray-600'>Indicadores calculados a partir dos dados reais cadastrados no banco.</p>
      </div>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {cards.map(card => <div key={card.label} className='rounded-xl border bg-white p-5 shadow-sm'><p className='text-sm text-gray-500'>{card.label}</p><p className='mt-2 text-3xl font-bold text-gray-900'>{card.value}</p></div>)}
      </div>
      <div className='grid gap-6 lg:grid-cols-2'>
        <div className='rounded-xl border bg-white p-5 shadow-sm'><h2 className='mb-4 text-lg font-bold'>Próximos agendamentos</h2><div className='space-y-3'>{(upcoming as any[]).length ? (upcoming as any[]).map(item => <div key={item.id} className='rounded border p-3 text-sm'><div className='font-semibold'>{item.patient_name}</div><div>{item.appointment_date} às {String(item.start_time).slice(0, 5)} · {item.professional_name || 'Profissional não definido'} · {item.status}</div></div>) : <p className='text-sm text-gray-500'>Nenhum agendamento futuro encontrado.</p>}</div></div>
        <div className='rounded-xl border bg-white p-5 shadow-sm'><h2 className='mb-4 text-lg font-bold'>Cadastros recentes</h2><div className='space-y-3'>{(recentPatients as any[]).length ? (recentPatients as any[]).map((patient, index) => <div key={`${patient.full_name}-${index}`} className='rounded border p-3 text-sm'><div className='font-semibold'>{patient.full_name}</div><div>{new Date(patient.created_at).toLocaleString('pt-BR')}</div></div>) : <p className='text-sm text-gray-500'>Nenhum paciente cadastrado.</p>}</div></div>
      </div>
    </section>
  )
}
