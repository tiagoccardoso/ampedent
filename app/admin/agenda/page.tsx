import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/neon'
import { appointmentStatus } from '@/lib/clinic'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'
import { DeleteConfirmButton } from '../_components/delete-confirm-button'

const optional = (value: FormDataEntryValue | null) => String(value || '').trim() || null

async function saveAppointment(formData: FormData) {
  'use server'

  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  if (!['superadmin', 'admin', 'dentist', 'reception'].includes(admin.role)) redirect('/admin/dashboard')

  const id = optional(formData.get('id'))
  const patientId = optional(formData.get('patient_id'))
  const appointmentDate = optional(formData.get('appointment_date'))
  const startTime = optional(formData.get('start_time'))
  const endTime = optional(formData.get('end_time'))
  let target = '/admin/agenda'

  try {
    if (!patientId || !appointmentDate || !startTime || !endTime) {
      target += '?error=Informe+paciente%2C+data+e+hor%C3%A1rios'
    } else if (id) {
      const updated = await sql`
        update appointments
           set patient_id = ${patientId}::uuid,
               professional_id = ${optional(formData.get('professional_id'))}::uuid,
               procedure_id = ${optional(formData.get('procedure_id'))}::uuid,
               notes = ${optional(formData.get('notes'))},
               appointment_date = ${appointmentDate},
               start_time = ${startTime},
               end_time = ${endTime},
               status = ${String(formData.get('status') || 'scheduled')}::appointment_status
         where id = ${id}::uuid
         returning id
      `
      target += (updated as unknown[]).length ? '?ok=Agendamento+atualizado+com+sucesso' : '?error=Agendamento+n%C3%A3o+encontrado'
    } else {
      await sql`
        insert into appointments (patient_id, professional_id, procedure_id, notes, appointment_date, start_time, end_time, status)
        values (${patientId}::uuid, ${optional(formData.get('professional_id'))}::uuid, ${optional(formData.get('procedure_id'))}::uuid, ${optional(formData.get('notes'))}, ${appointmentDate}, ${startTime}, ${endTime}, ${String(formData.get('status') || 'scheduled')}::appointment_status)
      `
      target += '?ok=Agendamento+criado+com+sucesso'
    }
  } catch (error) {
    console.error('agenda.save', error)
    target += '?error=N%C3%A3o+foi+poss%C3%ADvel+salvar.+Verifique+hor%C3%A1rios+e+v%C3%ADnculos'
  }

  revalidatePath('/admin/agenda')
  redirect(target)
}

async function deleteAppointment(formData: FormData) {
  'use server'

  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  if (!['superadmin', 'admin', 'dentist', 'reception'].includes(admin.role)) redirect('/admin/dashboard')

  let target = '/admin/agenda'
  try {
    const id = optional(formData.get('id'))
    if (!id) {
      target += '?error=Agendamento+inv%C3%A1lido'
    } else {
      const deleted = await sql`delete from appointments where id = ${id}::uuid returning id`
      target += (deleted as unknown[]).length ? '?ok=Agendamento+exclu%C3%ADdo+com+sucesso' : '?error=Agendamento+n%C3%A3o+encontrado'
    }
  } catch (error) {
    console.error('agenda.delete', error)
    target += '?error=N%C3%A3o+foi+poss%C3%ADvel+excluir+o+agendamento'
  }

  revalidatePath('/admin/agenda')
  redirect(target)
}

const statusLabel: Record<string, string> = {
  scheduled: 'Agendado',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  canceled: 'Cancelado',
  no_show: 'Não compareceu',
}

const statusBadge: Record<string, string> = {
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  canceled: 'bg-red-50 text-red-600 border-red-200',
  no_show: 'bg-gray-50 text-gray-600 border-gray-200',
}

type AgendaData = {
  rows: any[]
  patientOptions: any[]
  professionalOptions: any[]
  procedureOptions: any[]
  loadError?: string
}

async function loadAgendaData(): Promise<AgendaData> {
  try {
    const [rows, patients, professionals, procedures] = await Promise.all([
      sql`
        select a.*, p.full_name as patient_name, pr.full_name as professional_name, proc.name as procedure_name
          from appointments a
          join patients p on p.id = a.patient_id
          left join professionals pr on pr.id = a.professional_id
          left join procedures proc on proc.id = a.procedure_id
         order by a.appointment_date desc, a.start_time desc
         limit 100
      `,
      sql`select id, full_name from patients order by full_name`,
      sql`select id, full_name from professionals where is_active = true order by full_name`,
      sql`select id, name from procedures where is_active = true order by name`,
    ])
    return {
      rows: rows as any[],
      patientOptions: patients as any[],
      professionalOptions: professionals as any[],
      procedureOptions: procedures as any[],
    }
  } catch (error) {
    console.error('agenda.load', error)
    return {
      rows: [],
      patientOptions: [],
      professionalOptions: [],
      procedureOptions: [],
      loadError: 'Não foi possível carregar os dados. Verifique se DATABASE_URL está configurado e as migrations foram aplicadas.',
    }
  }
}

function AppointmentFormFields({
  appointment,
  patientOptions,
  professionalOptions,
  procedureOptions,
  disabled,
}: {
  appointment?: any
  patientOptions: any[]
  professionalOptions: any[]
  procedureOptions: any[]
  disabled?: boolean
}) {
  const suffix = appointment?.id ?? 'new'
  return (
    <div className='grid gap-x-5 gap-y-4 md:grid-cols-2'>
      {appointment && <input type='hidden' name='id' value={appointment.id} />}

      <div>
        <label htmlFor={`patient_id_${suffix}`}>Paciente *</label>
        <select id={`patient_id_${suffix}`} name='patient_id' required disabled={disabled} defaultValue={appointment?.patient_id ?? ''}>
          <option value=''>Selecione o paciente</option>
          {patientOptions.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor={`professional_id_${suffix}`}>Profissional</label>
        <select id={`professional_id_${suffix}`} name='professional_id' disabled={disabled} defaultValue={appointment?.professional_id ?? ''}>
          <option value=''>Selecione o profissional</option>
          {professionalOptions.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor={`procedure_id_${suffix}`}>Procedimento</label>
        <select id={`procedure_id_${suffix}`} name='procedure_id' disabled={disabled} defaultValue={appointment?.procedure_id ?? ''}>
          <option value=''>Selecione o procedimento</option>
          {procedureOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor={`status_${suffix}`}>Status</label>
        <select id={`status_${suffix}`} name='status' disabled={disabled} defaultValue={appointment?.status ?? 'scheduled'}>
          {appointmentStatus.map(s => <option key={s} value={s}>{statusLabel[s] ?? s}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor={`appointment_date_${suffix}`}>Data *</label>
        <input id={`appointment_date_${suffix}`} name='appointment_date' type='date' required disabled={disabled} defaultValue={appointment?.appointment_date ?? ''} />
      </div>

      <div>
        <label htmlFor={`start_time_${suffix}`}>Início *</label>
        <input id={`start_time_${suffix}`} name='start_time' type='time' required disabled={disabled} defaultValue={appointment ? String(appointment.start_time).slice(0, 5) : ''} />
      </div>

      <div>
        <label htmlFor={`end_time_${suffix}`}>Fim *</label>
        <input id={`end_time_${suffix}`} name='end_time' type='time' required disabled={disabled} defaultValue={appointment ? String(appointment.end_time).slice(0, 5) : ''} />
      </div>

      <div className='md:col-span-2'>
        <label htmlFor={`notes_${suffix}`}>Observações</label>
        <textarea id={`notes_${suffix}`} name='notes' rows={2} placeholder='Observações sobre a consulta…' disabled={disabled} defaultValue={appointment?.notes ?? ''} className='resize-y' />
      </div>
    </div>
  )
}

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  if (!['superadmin', 'admin', 'dentist', 'reception'].includes(admin.role)) redirect('/admin/dashboard')

  const params = (await searchParams) ?? {}
  const { rows, patientOptions, professionalOptions, procedureOptions, loadError } = await loadAgendaData()

  return (
    <section className='space-y-8'>
      {/* Page header */}
      <div>
        <p
          className='text-xs font-bold tracking-[0.1em] uppercase mb-1 text-[#30628a]'
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Clínica
        </p>
        <h1 className='text-2xl font-extrabold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>
          Agenda
        </h1>
        <p className='text-sm text-[#70787c] mt-1'>Cadastre e gerencie consultas agendadas.</p>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      {loadError && (
        <div className='rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900'>
          <p className='font-semibold'>Não foi possível carregar os dados da agenda.</p>
          <p className='mt-1'>{loadError}</p>
        </div>
      )}

      {!loadError && patientOptions.length === 0 && (
        <div className='rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900'>
          Cadastre pelo menos um paciente para criar agendamentos.
        </div>
      )}

      {/* New appointment form */}
      <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
        <div className='px-6 py-4 border-b border-[#f2f4f5] flex items-center gap-3'>
          <span className='text-xl'>📅</span>
          <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>
            Nova consulta
          </h2>
        </div>
        <form action={saveAppointment} className='px-6 py-6'>
          <AppointmentFormFields
            patientOptions={patientOptions}
            professionalOptions={professionalOptions}
            procedureOptions={procedureOptions}
            disabled={!!loadError || patientOptions.length === 0}
          />
          <div className='mt-6 flex justify-end'>
            <SubmitButton label='✓ Criar consulta' />
          </div>
        </form>
      </div>

      {/* Appointment list */}
      <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
        <div className='px-6 py-4 border-b border-[#f2f4f5] flex items-center justify-between'>
          <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>
            Consultas agendadas{' '}
            <span className='ml-2 text-sm font-normal text-[#70787c]'>({rows.length})</span>
          </h2>
        </div>

        {rows.length === 0 ? (
          <div className='px-6 py-16 text-center'>
            <div className='text-4xl mb-3'>📅</div>
            <p className='text-[#70787c] text-sm'>Nenhuma consulta cadastrada.</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[900px] text-sm'>
              <thead>
                <tr style={{ background: '#f8fafb', borderBottom: '1px solid #e6e8e9' }}>
                  {['Paciente', 'Profissional', 'Procedimento', 'Data', 'Horário', 'Status', 'Ações'].map(h => (
                    <th
                      key={h}
                      className='px-5 py-3 text-left text-[10px] font-bold tracking-[0.08em] uppercase text-[#70787c]'
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-[#f2f4f5]'>
                {rows.map(row => (
                  <tr key={row.id} className='hover:bg-[#f8fafb] transition-colors align-top'>
                    <td className='px-5 py-4 font-medium text-[#003441]'>{row.patient_name}</td>
                    <td className='px-5 py-4 text-[#40484b]'>{row.professional_name ?? '—'}</td>
                    <td className='px-5 py-4 text-[#40484b]'>{row.procedure_name ?? '—'}</td>
                    <td className='px-5 py-4 text-[#40484b]'>
                      {new Date(row.appointment_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className='px-5 py-4 text-[#40484b]'>
                      {String(row.start_time).slice(0, 5)} – {String(row.end_time).slice(0, 5)}
                    </td>
                    <td className='px-5 py-4'>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge[row.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {statusLabel[row.status] ?? row.status}
                      </span>
                    </td>
                    <td className='px-5 py-4 space-y-2'>
                      <details className='rounded-lg border border-[#e6e8e9] p-2'>
                        <summary className='cursor-pointer text-xs font-semibold text-[#30628a] hover:text-[#003441]'>
                          ✏️ Editar
                        </summary>
                        <form action={saveAppointment} className='mt-3'>
                          <AppointmentFormFields
                            appointment={row}
                            patientOptions={patientOptions}
                            professionalOptions={professionalOptions}
                            procedureOptions={procedureOptions}
                          />
                          <div className='mt-4 flex justify-end'>
                            <SubmitButton label='Atualizar' variant='secondary' />
                          </div>
                        </form>
                      </details>
                      <form action={deleteAppointment}>
                        <input type='hidden' name='id' value={row.id} />
                        <DeleteConfirmButton message={`Excluir o agendamento de ${row.patient_name}?`} />
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
