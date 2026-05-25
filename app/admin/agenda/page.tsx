import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/neon'
import { appointmentStatus } from '@/lib/clinic'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'

async function save(formData: FormData) {
  'use server'
  try {
    const patient_id = String(formData.get('patient_id') || '')
    const appointment_date = String(formData.get('appointment_date') || '')
    const start_time = String(formData.get('start_time') || '')
    const end_time = String(formData.get('end_time') || '')
    if (!patient_id || !appointment_date || !start_time || !end_time)
      redirect('/admin/agenda?error=Verifique+os+campos+obrigat%C3%B3rios')
    await sql`
      insert into appointments (patient_id, professional_id, procedure_id, notes, appointment_date, start_time, end_time, status)
      values (
        ${patient_id}::uuid,
        ${String(formData.get('professional_id') || '') || null}::uuid,
        ${String(formData.get('procedure_id') || '') || null}::uuid,
        ${String(formData.get('notes') || '') || null},
        ${appointment_date}, ${start_time}, ${end_time},
        ${String(formData.get('status') || 'scheduled')}::appointment_status
      )`
    revalidatePath('/admin/agenda')
    redirect('/admin/agenda?ok=Agendamento+criado+com+sucesso')
  } catch (e) {
    console.error('agenda.save', e)
    redirect('/admin/agenda?error=N%C3%A3o+foi+poss%C3%ADvel+salvar.+Verifique+os+dados+e+tente+novamente')
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>
}) {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  const params = (await searchParams) ?? {}
  const [rows, patients, professionals, procedures] = await Promise.all([
    sql`
      select a.*, p.full_name as patient_name
      from appointments a
      join patients p on p.id = a.patient_id
      order by appointment_date desc, start_time desc
      limit 100`,
    sql`select id, full_name from patients order by full_name`,
    sql`select id, full_name from professionals where is_active = true order by full_name`,
    sql`select id, name from procedures where is_active = true order by name`,
  ])

  return (
    <section className='space-y-6'>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Agenda</h1>
          <p className='page-subtitle'>Agendamentos da clínica</p>
        </div>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      {/* Form */}
      <div className='form-panel'>
        <p className='form-section-title'>Novo agendamento</p>
        <form action={save} className='grid md:grid-cols-2 gap-3'>
          <div className='field'>
            <label>Paciente *</label>
            <select name='patient_id' required>
              <option value=''>Selecione o paciente</option>
              {(patients as any[]).map(p => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </div>
          <div className='field'>
            <label>Profissional</label>
            <select name='professional_id'>
              <option value=''>Selecione o profissional</option>
              {(professionals as any[]).map(p => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </div>
          <div className='field'>
            <label>Procedimento</label>
            <select name='procedure_id'>
              <option value=''>Selecione o procedimento</option>
              {(procedures as any[]).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className='field'>
            <label>Status</label>
            <select name='status'>
              {appointmentStatus.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className='field'>
            <label>Data *</label>
            <input name='appointment_date' type='date' required />
          </div>
          <div className='field'>
            <label>Hora início *</label>
            <input name='start_time' type='time' required />
          </div>
          <div className='field'>
            <label>Hora fim *</label>
            <input name='end_time' type='time' required />
          </div>
          <div className='field md:col-span-2'>
            <label>Observações</label>
            <textarea name='notes' rows={3} placeholder='Observações do agendamento…' />
          </div>
          <div>
            <SubmitButton label='Criar agendamento' />
          </div>
        </form>
      </div>

      {/* Table */}
      <div className='card overflow-hidden'>
        <div className='overflow-x-auto'>
          {(rows as any[]).length === 0 ? (
            <div className='px-6 py-12 text-center text-slate-400 text-sm'>
              Nenhum agendamento encontrado.
            </div>
          ) : (
            <table className='data-table'>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Data</th>
                  <th>Hora início</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(rows as any[]).map(r => (
                  <tr key={r.id}>
                    <td className='font-medium'>{r.patient_name}</td>
                    <td>{new Date(r.appointment_date).toLocaleDateString('pt-BR')}</td>
                    <td>{r.start_time}</td>
                    <td>
                      <span className={`badge ${
                        r.status === 'scheduled'  ? 'badge-scheduled'  :
                        r.status === 'completed'  ? 'badge-completed'  :
                        r.status === 'canceled'   ? 'badge-canceled'   : 'badge-pending'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  )
}
