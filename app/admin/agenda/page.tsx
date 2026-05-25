import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/neon'
import { appointmentStatus } from '@/lib/clinic'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'

async function save(formData: FormData) {
  'use server'
  const patient_id = String(formData.get('patient_id') || '')
  const appointment_date = String(formData.get('appointment_date') || '')
  const start_time = String(formData.get('start_time') || '')
  const end_time = String(formData.get('end_time') || '')
  if (!patient_id || !appointment_date || !start_time || !end_time) redirect('/admin/agenda?error=Verifique+os+campos+obrigat%C3%B3rios')
  try {
    await sql`insert into appointments (patient_id, professional_id, procedure_id, notes, appointment_date, start_time, end_time, status) values (${patient_id}::uuid, ${String(formData.get('professional_id')||'')||null}::uuid, ${String(formData.get('procedure_id')||'')||null}::uuid, ${String(formData.get('notes')||'')||null}, ${appointment_date}, ${start_time}, ${end_time}, ${String(formData.get('status')||'scheduled')}::appointment_status)`
  } catch (e) {
    console.error('agenda.save', e)
    redirect('/admin/agenda?error=N%C3%A3o+foi+poss%C3%ADvel+salvar.+Verifique+os+dados+e+tente+novamente')
  }
  revalidatePath('/admin/agenda')
  redirect('/admin/agenda?ok=Agendamento+criado+com+sucesso')
}

const statusLabel: Record<string, string> = {
  scheduled: 'Agendado',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  canceled: 'Cancelado',
  no_show: 'Não compareceu',
}

const statusClass: Record<string, string> = {
  scheduled: 'badge badge-pending',
  in_progress: 'badge badge-pending',
  completed: 'badge badge-success',
  canceled: 'badge badge-error',
  no_show: 'badge badge-error',
}

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  const params = (await searchParams) ?? {}

  const [rows, patients, professionals, procedures] = await Promise.all([
    sql`select a.*, p.full_name as patient_name, pr.full_name as professional_name from appointments a join patients p on p.id=a.patient_id left join professionals pr on pr.id=a.professional_id order by appointment_date desc, start_time desc limit 100`,
    sql`select id, full_name from patients order by full_name`,
    sql`select id, full_name from professionals where is_active=true order by full_name`,
    sql`select id, name from procedures where is_active=true order by name`,
  ])

  return (
    <section className='space-y-6'>
      <div className='page-header'>
        <h1 className='page-title'>Agenda</h1>
        <p className='page-subtitle'>Cadastre e gerencie consultas agendadas</p>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[#0f172a]'>Nova consulta</h2>
        </div>
        <div className='section-card-body'>
          <form action={save} className='grid md:grid-cols-2 gap-3'>
            <div>
              <label>Paciente *</label>
              <select name='patient_id' required>
                <option value=''>Selecione o paciente</option>
                {(patients as any[]).map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </div>
            <div>
              <label>Profissional</label>
              <select name='professional_id'>
                <option value=''>Selecione o profissional</option>
                {(professionals as any[]).map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </div>
            <div>
              <label>Procedimento</label>
              <select name='procedure_id'>
                <option value=''>Selecione o procedimento</option>
                {(procedures as any[]).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label>Status</label>
              <select name='status'>
                {appointmentStatus.map(s => <option key={s} value={s}>{statusLabel[s] ?? s}</option>)}
              </select>
            </div>
            <div><label>Data *</label><input name='appointment_date' type='date' required /></div>
            <div><label>Início *</label><input name='start_time' type='time' required /></div>
            <div><label>Fim *</label><input name='end_time' type='time' required /></div>
            <div className='md:col-span-2'>
              <label>Observações</label>
              <textarea name='notes' rows={2} placeholder='Observações sobre a consulta...' />
            </div>
            <div><SubmitButton label='Criar consulta' /></div>
          </form>
        </div>
      </div>

      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[#0f172a]'>Consultas agendadas</h2>
          <span className='text-xs text-[#64748b]'>{(rows as any[]).length} registros</span>
        </div>
        <div className='overflow-auto'>
          <table className='admin-table'>
            <thead>
              <tr>
                <th>Paciente</th>
                <th className='hidden md:table-cell'>Profissional</th>
                <th>Data</th>
                <th className='hidden sm:table-cell'>Horário</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(rows as any[]).length === 0 && (
                <tr><td colSpan={5} className='text-center py-8 text-[#64748b] text-sm'>Nenhuma consulta cadastrada.</td></tr>
              )}
              {(rows as any[]).map(r => (
                <tr key={r.id}>
                  <td className='font-medium text-[#0f172a]'>{r.patient_name}</td>
                  <td className='hidden md:table-cell text-[#64748b]'>{r.professional_name ?? '—'}</td>
                  <td>{new Date(r.appointment_date).toLocaleDateString('pt-BR')}</td>
                  <td className='hidden sm:table-cell text-[#64748b]'>{r.start_time} – {r.end_time}</td>
                  <td><span className={statusClass[r.status] ?? 'badge'}>{statusLabel[r.status] ?? r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
