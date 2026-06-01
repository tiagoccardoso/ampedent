import { getCurrentAdminProfile } from '@/lib/auth'
import { sql } from '@/lib/neon'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'
import { DeleteConfirmButton } from '../_components/delete-confirm-button'

const optional = (value: FormDataEntryValue | null) => String(value || '').trim() || null
const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

async function requireAccess() {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  if (!['superadmin', 'admin', 'reception'].includes(admin.role)) redirect('/admin/dashboard')
  return admin
}

async function saveProfessional(formData: FormData) {
  'use server'
  await requireAccess()
  const id = optional(formData.get('id'))
  const fullName = optional(formData.get('full_name'))
  let target = '/admin/professionals'
  try {
    if (!fullName) {
      target += '?error=Informe+o+nome+do+profissional'
    } else if (id) {
      const updated = await sql`
        update professionals
           set full_name = ${fullName},
               specialty = ${optional(formData.get('specialty'))},
               cro = ${optional(formData.get('cro'))},
               schedule_notes = ${optional(formData.get('schedule_notes'))},
               is_active = ${formData.get('is_active') === 'on'}
         where id = ${id}::uuid
         returning id
      `
      target += (updated as unknown[]).length ? '?ok=Profissional+atualizado+com+sucesso' : '?error=Profissional+n%C3%A3o+encontrado'
    } else {
      await sql`
        insert into professionals (full_name, specialty, cro, schedule_notes, is_active)
        values (${fullName}, ${optional(formData.get('specialty'))}, ${optional(formData.get('cro'))}, ${optional(formData.get('schedule_notes'))}, ${formData.get('is_active') === 'on'})
      `
      target += '?ok=Profissional+cadastrado+com+sucesso'
    }
  } catch (error) {
    console.error('professionals.save')
    target += '?error=N%C3%A3o+foi+poss%C3%ADvel+salvar+o+profissional'
  }
  revalidatePath('/admin/professionals')
  redirect(target)
}

async function deleteProfessional(formData: FormData) {
  'use server'
  await requireAccess()
  let target = '/admin/professionals'
  try {
    const id = optional(formData.get('id'))
    const deleted = id ? await sql`delete from professionals where id = ${id}::uuid returning id` : []
    target += (deleted as unknown[]).length ? '?ok=Profissional+exclu%C3%ADdo+com+sucesso' : '?error=Profissional+n%C3%A3o+encontrado'
  } catch (error) {
    console.error('professionals.delete')
    target += '?error=N%C3%A3o+foi+poss%C3%ADvel+excluir.+Verifique+v%C3%ADnculos'
  }
  revalidatePath('/admin/professionals')
  redirect(target)
}

async function saveSchedule(formData: FormData) {
  'use server'
  await requireAccess()
  let target = '/admin/professionals'
  try {
    const professionalId = optional(formData.get('professional_id'))
    const weekday = Number(formData.get('weekday'))
    const startTime = optional(formData.get('start_time'))
    const endTime = optional(formData.get('end_time'))
    if (!professionalId || Number.isNaN(weekday) || !startTime || !endTime) {
      target += '?error=Preencha+os+campos+obrigat%C3%B3rios+da+agenda'
    } else {
      await sql`
        insert into professional_schedules (professional_id, weekday, start_time, end_time, break_start, break_end, appointment_duration_minutes, is_active)
        values (${professionalId}::uuid, ${weekday}, ${startTime}::time, ${endTime}::time, ${optional(formData.get('break_start'))}::time, ${optional(formData.get('break_end'))}::time, ${Number(formData.get('appointment_duration_minutes') || 60)}, ${formData.get('is_active') === 'on'})
        on conflict (professional_id, weekday) do update
           set start_time = excluded.start_time,
               end_time = excluded.end_time,
               break_start = excluded.break_start,
               break_end = excluded.break_end,
               appointment_duration_minutes = excluded.appointment_duration_minutes,
               is_active = excluded.is_active
      `
      target += '?ok=Agenda+do+profissional+salva+com+sucesso'
    }
  } catch (error) {
    console.error('professionals.schedule.save')
    target += '?error=N%C3%A3o+foi+poss%C3%ADvel+salvar+a+agenda'
  }
  revalidatePath('/admin/professionals')
  redirect(target)
}

async function deleteSchedule(formData: FormData) {
  'use server'
  await requireAccess()
  let target = '/admin/professionals'
  try {
    const id = optional(formData.get('id'))
    const deleted = id ? await sql`delete from professional_schedules where id = ${id}::uuid returning id` : []
    target += (deleted as unknown[]).length ? '?ok=Agenda+exclu%C3%ADda+com+sucesso' : '?error=Agenda+n%C3%A3o+encontrada'
  } catch (error) {
    console.error('professionals.schedule.delete')
    target += '?error=N%C3%A3o+foi+poss%C3%ADvel+excluir+a+agenda'
  }
  revalidatePath('/admin/professionals')
  redirect(target)
}

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  await requireAccess()
  const params = (await searchParams) ?? {}
  const [professionals, schedules] = await Promise.all([
    sql`select * from professionals order by created_at desc limit 100`,
    sql`select ps.*, p.full_name from professional_schedules ps join professionals p on p.id = ps.professional_id order by p.full_name, ps.weekday`,
  ])
  const professionalRows = professionals as any[]

  return (
    <section className='space-y-8'>
      <div>
        <p className='text-xs font-bold tracking-[0.1em] uppercase mb-1 text-[#30628a]' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Equipe</p>
        <h1 className='text-2xl font-extrabold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>Profissionais</h1>
        <p className='text-sm text-[#70787c] mt-1'>Cadastro de profissionais e configuração dos horários de atendimento.</p>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
        <div className='px-6 py-4 border-b border-[#f2f4f5] flex items-center gap-3'>
          <span className='text-xl'>🩺</span>
          <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>Cadastrar profissional</h2>
        </div>
        <form action={saveProfessional} className='px-6 py-6 grid gap-x-5 gap-y-4 md:grid-cols-2'>
          <div><label htmlFor='pro_name'>Nome completo *</label><input id='pro_name' name='full_name' required placeholder='Dr. João da Silva' /></div>
          <div><label htmlFor='pro_spec'>Especialidade</label><input id='pro_spec' name='specialty' placeholder='Ex.: Clínico Geral, Ortodontista' /></div>
          <div><label htmlFor='pro_cro'>CRO</label><input id='pro_cro' name='cro' placeholder='CRO-SP 12345' /></div>
          <div className='flex items-center gap-2 self-end pb-2'>
            <input type='checkbox' id='pro_active' name='is_active' defaultChecked className='w-4 h-4 accent-[#003441]' />
            <label htmlFor='pro_active' className='mb-0 normal-case text-sm text-[#40484b]'>Profissional ativo</label>
          </div>
          <div className='md:col-span-2'><label htmlFor='pro_notes'>Observações da agenda</label><textarea id='pro_notes' name='schedule_notes' rows={2} placeholder='Observações sobre preferências de horário…' /></div>
          <div className='md:col-span-2 flex justify-end'><SubmitButton label='✓ Cadastrar profissional' /></div>
        </form>
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Professionals list */}
        <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
          <div className='px-6 py-4 border-b border-[#f2f4f5]'>
            <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>
              Profissionais <span className='ml-2 text-sm font-normal text-[#70787c]'>({professionalRows.length})</span>
            </h2>
          </div>
          {professionalRows.length === 0 ? (
            <div className='px-6 py-12 text-center'><div className='text-3xl mb-2'>🩺</div><p className='text-[#70787c] text-sm'>Nenhum profissional cadastrado.</p></div>
          ) : (
            <div className='admin-table-wrap rounded-none border-0'>
              <table className='admin-table' style={{ minWidth: 400 }}>
                <thead><tr>{['Nome', 'Especialidade', 'CRO', 'Ativo', 'Ações'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {professionalRows.map(row => (
                    <tr key={row.id}>
                      <td className='font-semibold text-[#003441]'>{row.full_name}</td>
                      <td>{row.specialty || '—'}</td>
                      <td>{row.cro || '—'}</td>
                      <td>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${row.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {row.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className='space-y-2'>
                        <details className='rounded-lg border border-[#e6e8e9]'>
                          <summary className='cursor-pointer px-3 py-1.5 text-xs font-semibold text-[#30628a] hover:text-[#003441]'>✏️ Editar</summary>
                          <form action={saveProfessional} className='p-3 grid gap-3 border-t border-[#f2f4f5]'>
                            <input type='hidden' name='id' value={row.id} />
                            <div><label>Nome</label><input name='full_name' defaultValue={row.full_name} required /></div>
                            <div><label>Especialidade</label><input name='specialty' defaultValue={row.specialty || ''} /></div>
                            <div><label>CRO</label><input name='cro' defaultValue={row.cro || ''} /></div>
                            <div><label>Observações</label><textarea name='schedule_notes' defaultValue={row.schedule_notes || ''} rows={2} /></div>
                            <div className='flex items-center gap-2'>
                              <input type='checkbox' name='is_active' defaultChecked={row.is_active} className='w-4 h-4 accent-[#003441]' />
                              <span className='text-xs text-[#40484b]'>Ativo</span>
                            </div>
                            <div className='flex justify-end'><SubmitButton label='Atualizar' variant='secondary' /></div>
                          </form>
                        </details>
                        <form action={deleteProfessional}><input type='hidden' name='id' value={row.id} /><DeleteConfirmButton message={`Excluir o profissional ${row.full_name}?`} /></form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Schedule config */}
        <div className='space-y-5'>
          <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
            <div className='px-6 py-4 border-b border-[#f2f4f5] flex items-center gap-3'>
              <span className='text-xl'>🗓️</span>
              <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>Configurar agenda</h2>
            </div>
            <form action={saveSchedule} className='px-6 py-6 grid gap-x-5 gap-y-4 md:grid-cols-2'>
              <div>
                <label htmlFor='sch_prof'>Profissional *</label>
                <select id='sch_prof' name='professional_id' required>
                  <option value=''>Selecione</option>
                  {professionalRows.map(row => <option key={row.id} value={row.id}>{row.full_name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor='sch_day'>Dia da semana *</label>
                <select id='sch_day' name='weekday' required>
                  {weekdays.map((day, index) => <option key={day} value={index}>{day}</option>)}
                </select>
              </div>
              <div><label htmlFor='sch_start'>Início *</label><input id='sch_start' name='start_time' type='time' required /></div>
              <div><label htmlFor='sch_end'>Fim *</label><input id='sch_end' name='end_time' type='time' required /></div>
              <div><label htmlFor='sch_break_start'>Início do intervalo</label><input id='sch_break_start' name='break_start' type='time' /></div>
              <div><label htmlFor='sch_break_end'>Fim do intervalo</label><input id='sch_break_end' name='break_end' type='time' /></div>
              <div><label htmlFor='sch_dur'>Duração da consulta (min)</label><input id='sch_dur' name='appointment_duration_minutes' type='number' min={1} defaultValue={60} /></div>
              <div className='flex items-center gap-2 self-end pb-2'>
                <input type='checkbox' id='sch_active' name='is_active' defaultChecked className='w-4 h-4 accent-[#003441]' />
                <label htmlFor='sch_active' className='mb-0 normal-case text-sm text-[#40484b]'>Agenda ativa</label>
              </div>
              <div className='md:col-span-2 flex justify-end'><SubmitButton label='✓ Salvar agenda' /></div>
            </form>
          </div>

          {/* Schedule list */}
          <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
            <div className='px-6 py-4 border-b border-[#f2f4f5]'>
              <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>Horários configurados</h2>
            </div>
            {(schedules as any[]).length === 0 ? (
              <div className='px-6 py-8 text-center'><p className='text-[#70787c] text-sm'>Nenhum horário configurado.</p></div>
            ) : (
              <div className='divide-y divide-[#f2f4f5]'>
                {(schedules as any[]).map(schedule => (
                  <div key={schedule.id} className='px-6 py-4 flex items-start justify-between gap-4'>
                    <div>
                      <p className='font-semibold text-[#003441] text-sm'>{schedule.full_name}</p>
                      <p className='text-xs text-[#70787c] mt-0.5'>
                        {weekdays[schedule.weekday]} · {String(schedule.start_time).slice(0, 5)} às {String(schedule.end_time).slice(0, 5)} · {schedule.appointment_duration_minutes} min
                      </p>
                    </div>
                    <div className='flex items-center gap-2 flex-shrink-0'>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${schedule.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {schedule.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                      <form action={deleteSchedule}>
                        <input type='hidden' name='id' value={schedule.id} />
                        <DeleteConfirmButton label='Excluir' message='Excluir este horário de atendimento?' />
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
