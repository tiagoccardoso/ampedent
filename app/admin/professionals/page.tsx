import { getCurrentAdminProfile } from '@/lib/auth'
import { sql } from '@/lib/neon'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'
import { ConfirmActionForm } from '../_components/confirm-action'

async function saveProfessional(fd: FormData) {
  'use server'
  const full_name = String(fd.get('full_name') || '').trim()
  if (!full_name) redirect('/admin/professionals?error=O+campo+Nome+%C3%A9+obrigat%C3%B3rio')
  try {
    await sql`
      insert into professionals (full_name, specialty, cro, schedule_notes, is_active)
      values (
        ${full_name},
        ${String(fd.get('specialty') || '') || null},
        ${String(fd.get('cro') || '') || null},
        ${String(fd.get('schedule_notes') || '') || null},
        ${fd.get('is_active') === 'on'}
      )
    `
  } catch (e) {
    console.error('professionals.save', e)
    redirect('/admin/professionals?error=N%C3%A3o+foi+poss%C3%ADvel+cadastrar+o+profissional.+Verifique+os+dados.')
  }
  revalidatePath('/admin/professionals')
  redirect('/admin/professionals?ok=Profissional+cadastrado+com+sucesso')
}

async function updateProfessional(fd: FormData) {
  'use server'
  const id = String(fd.get('id') || '').trim()
  const full_name = String(fd.get('full_name') || '').trim()
  if (!id || !full_name) redirect('/admin/professionals?error=Dados+inv%C3%A1lidos+para+atualiza%C3%A7%C3%A3o')
  try {
    await sql`
      update professionals
      set
        full_name = ${full_name},
        specialty = ${String(fd.get('specialty') || '') || null},
        cro = ${String(fd.get('cro') || '') || null},
        schedule_notes = ${String(fd.get('schedule_notes') || '') || null},
        is_active = ${fd.get('is_active') === 'on'}
      where id = ${id}::uuid
    `
  } catch (e) {
    console.error('professionals.update', e)
    redirect('/admin/professionals?error=N%C3%A3o+foi+poss%C3%ADvel+atualizar+o+profissional.')
  }
  revalidatePath('/admin/professionals')
  redirect('/admin/professionals?ok=Profissional+atualizado+com+sucesso')
}

async function deactivateProfessional(fd: FormData) {
  'use server'
  const id = String(fd.get('id') || '').trim()
  if (!id) redirect('/admin/professionals?error=ID+inv%C3%A1lido')
  try {
    await sql`update professionals set is_active = false where id = ${id}::uuid`
  } catch (e) {
    console.error('professionals.deactivate', e)
    redirect('/admin/professionals?error=N%C3%A3o+foi+poss%C3%ADvel+desativar+o+profissional.')
  }
  revalidatePath('/admin/professionals')
  redirect('/admin/professionals?ok=Profissional+desativado+com+sucesso')
}

async function saveSchedule(fd: FormData) {
  'use server'
  const professional_id = String(fd.get('professional_id') || '')
  const weekday = Number(fd.get('weekday'))
  const start_time = String(fd.get('start_time') || '')
  const end_time = String(fd.get('end_time') || '')
  if (!professional_id || Number.isNaN(weekday) || !start_time || !end_time) {
    redirect('/admin/professionals?error=Preencha+os+campos+obrigat%C3%B3rios+da+agenda')
  }
  const break_start = String(fd.get('break_start') || '')
  const break_end = String(fd.get('break_end') || '')
  const duration = Number(fd.get('appointment_duration_minutes') || 60)
  const is_active = fd.get('is_active') === 'on'
  try {
    await sql`
      insert into professional_schedules
        (professional_id, weekday, start_time, end_time, break_start, break_end, appointment_duration_minutes, is_active)
      values
        (${professional_id}::uuid, ${weekday}, ${start_time}::time, ${end_time}::time,
         ${break_start || null}::time, ${break_end || null}::time, ${duration}, ${is_active})
      on conflict (professional_id, weekday) do update set
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        break_start = excluded.break_start,
        break_end = excluded.break_end,
        appointment_duration_minutes = excluded.appointment_duration_minutes,
        is_active = excluded.is_active
    `
  } catch (e) {
    console.error('professionals.schedule.save', e)
    redirect('/admin/professionals?error=N%C3%A3o+foi+poss%C3%ADvel+salvar+a+agenda+do+profissional')
  }
  revalidatePath('/admin/professionals')
  redirect('/admin/professionals?ok=Agenda+salva+com+sucesso')
}

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  const params = (await searchParams) ?? {}
  const rows = await sql`select * from professionals order by full_name asc limit 100`
  const schedules = await sql`
    select ps.*, p.full_name
    from professional_schedules ps
    join professionals p on p.id = ps.professional_id
    order by p.full_name, ps.weekday
  `
  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

  const editId = params.edit ?? null
  const editPro = editId ? (rows as any[]).find(r => r.id === editId) : null

  return (
    <section className='space-y-6'>
      <div className='page-header'>
        <h1 className='page-title'>Profissionais e Agenda</h1>
        <p className='page-subtitle'>Gerencie os profissionais e configure as agendas de atendimento</p>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      {/* Edit form — shown only when ?edit=UUID */}
      {editPro && (
        <div className='section-card border-[#0e7490]/30'>
          <div className='section-card-header'>
            <h2 className='text-sm font-semibold text-[#0e7490]'>Editar profissional</h2>
          </div>
          <div className='section-card-body'>
            <form action={updateProfessional} className='grid md:grid-cols-2 gap-4'>
              <input type='hidden' name='id' value={editPro.id} />
              <div>
                <label htmlFor='edit_full_name'>Nome completo *</label>
                <input id='edit_full_name' name='full_name' defaultValue={editPro.full_name} required />
              </div>
              <div>
                <label htmlFor='edit_specialty'>Especialidade</label>
                <input id='edit_specialty' name='specialty' defaultValue={editPro.specialty ?? ''} placeholder='Ex: Ortodontia, Clínica Geral' />
              </div>
              <div>
                <label htmlFor='edit_cro'>CRO</label>
                <input id='edit_cro' name='cro' defaultValue={editPro.cro ?? ''} placeholder='Ex: SP-12345' />
              </div>
              <div>
                <label htmlFor='edit_schedule_notes'>Observações da agenda</label>
                <input id='edit_schedule_notes' name='schedule_notes' defaultValue={editPro.schedule_notes ?? ''} placeholder='Informações adicionais' />
              </div>
              <div className='md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
                <label className='flex items-center gap-2 cursor-pointer select-none'>
                  <input type='checkbox' name='is_active' defaultChecked={editPro.is_active} className='w-4 h-4 rounded accent-[#0e7490]' />
                  <span className='text-sm font-medium text-[#0f172a]'>Profissional ativo</span>
                </label>
                <div className='flex gap-2'>
                  <a href='/admin/professionals' className='btn text-sm'>Cancelar</a>
                  <SubmitButton label='Salvar alterações' />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New professional form */}
      {!editPro && (
        <div className='section-card'>
          <div className='section-card-header'>
            <h2 className='text-sm font-semibold text-[#0f172a]'>Cadastrar profissional</h2>
          </div>
          <div className='section-card-body'>
            <form action={saveProfessional} className='grid md:grid-cols-2 gap-4'>
              <div>
                <label htmlFor='pro_full_name'>Nome completo *</label>
                <input id='pro_full_name' name='full_name' placeholder='Nome completo do profissional' required />
              </div>
              <div>
                <label htmlFor='pro_specialty'>Especialidade</label>
                <input id='pro_specialty' name='specialty' placeholder='Ex: Ortodontia, Clínica Geral' />
              </div>
              <div>
                <label htmlFor='pro_cro'>CRO</label>
                <input id='pro_cro' name='cro' placeholder='Ex: SP-12345' />
              </div>
              <div>
                <label htmlFor='pro_schedule_notes'>Observações da agenda</label>
                <input id='pro_schedule_notes' name='schedule_notes' placeholder='Informações adicionais' />
              </div>
              <div className='md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
                <label className='flex items-center gap-2 cursor-pointer select-none'>
                  <input type='checkbox' name='is_active' defaultChecked className='w-4 h-4 rounded accent-[#0e7490]' />
                  <span className='text-sm font-medium text-[#0f172a]'>Profissional ativo</span>
                </label>
                <SubmitButton label='Cadastrar profissional' />
              </div>
            </form>
          </div>
        </div>
      )}

      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[#0f172a]'>Configurar agenda semanal</h2>
          <span className='text-xs text-[#64748b]'>Define horários por profissional e dia da semana</span>
        </div>
        <div className='section-card-body'>
          <form action={saveSchedule} className='grid md:grid-cols-3 gap-4'>
            <div>
              <label>Profissional *</label>
              <select name='professional_id' required>
                <option value=''>Selecione o profissional</option>
                {(rows as any[]).map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
              </select>
            </div>
            <div>
              <label>Dia da semana *</label>
              <select name='weekday' required>
                {weekDays.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
            </div>
            <div>
              <label>Duração da consulta (min)</label>
              <input name='appointment_duration_minutes' type='number' min={10} step={5} defaultValue={60} />
            </div>
            <div>
              <label>Início do expediente *</label>
              <input name='start_time' type='time' required />
            </div>
            <div>
              <label>Fim do expediente *</label>
              <input name='end_time' type='time' required />
            </div>
            <div>
              <label>Início do intervalo</label>
              <input name='break_start' type='time' />
            </div>
            <div>
              <label>Fim do intervalo</label>
              <input name='break_end' type='time' />
            </div>
            <div className='md:col-span-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
              <label className='flex items-center gap-2 cursor-pointer select-none'>
                <input type='checkbox' name='is_active' defaultChecked className='w-4 h-4 rounded accent-[#0e7490]' />
                <span className='text-sm font-medium text-[#0f172a]'>Agenda ativa</span>
              </label>
              <SubmitButton label='Salvar agenda' />
            </div>
          </form>
        </div>
      </div>

      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[#0f172a]'>Profissionais cadastrados</h2>
          <span className='text-xs text-[#64748b]'>{(rows as any[]).length} registros</span>
        </div>
        <div className='overflow-auto'>
          <table className='admin-table'>
            <thead>
              <tr>
                <th>Nome</th>
                <th className='hidden sm:table-cell'>Especialidade</th>
                <th className='hidden md:table-cell'>CRO</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {(rows as any[]).length === 0 && (
                <tr><td colSpan={5} className='text-center py-8 text-[#64748b] text-sm'>Nenhum profissional cadastrado.</td></tr>
              )}
              {(rows as any[]).map(r => (
                <tr key={r.id} className={r.id === editId ? 'bg-[#f0f9ff]' : ''}>
                  <td className='font-medium text-[#0f172a]'>{r.full_name}</td>
                  <td className='hidden sm:table-cell text-[#64748b]'>{r.specialty ?? '—'}</td>
                  <td className='hidden md:table-cell text-[#64748b]'>{r.cro ?? '—'}</td>
                  <td>
                    <span className={r.is_active ? 'badge badge-success' : 'badge badge-error'}>
                      {r.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className='flex items-center gap-2'>
                      <a href={`/admin/professionals?edit=${r.id}`} className='btn-sm'>Editar</a>
                      {r.is_active && (
                        <ConfirmActionForm
                          action={deactivateProfessional}
                          id={r.id}
                          confirmMsg={`Desativar "${r.full_name}"? O profissional não aparecerá mais para novos agendamentos.`}
                          buttonLabel='Desativar'
                          buttonClass='btn-danger-sm'
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[#0f172a]'>Agendas configuradas</h2>
          <span className='text-xs text-[#64748b]'>{(schedules as any[]).length} configurações</span>
        </div>
        <div className='overflow-auto'>
          <table className='admin-table'>
            <thead>
              <tr>
                <th>Profissional</th>
                <th>Dia</th>
                <th className='hidden sm:table-cell'>Expediente</th>
                <th className='hidden md:table-cell'>Intervalo</th>
                <th className='hidden md:table-cell'>Duração</th>
                <th>Ativo</th>
              </tr>
            </thead>
            <tbody>
              {(schedules as any[]).length === 0 && (
                <tr><td colSpan={6} className='text-center py-8 text-[#64748b] text-sm'>Nenhuma agenda configurada.</td></tr>
              )}
              {(schedules as any[]).map(s => (
                <tr key={s.id}>
                  <td className='font-medium text-[#0f172a]'>{s.full_name}</td>
                  <td>{weekDays[s.weekday]}</td>
                  <td className='hidden sm:table-cell text-[#64748b]'>{s.start_time} – {s.end_time}</td>
                  <td className='hidden md:table-cell text-[#64748b]'>
                    {s.break_start && s.break_end ? `${s.break_start} – ${s.break_end}` : '—'}
                  </td>
                  <td className='hidden md:table-cell text-[#64748b]'>{s.appointment_duration_minutes} min</td>
                  <td>
                    <span className={s.is_active ? 'badge badge-success' : 'badge badge-error'}>
                      {s.is_active ? 'Sim' : 'Não'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
