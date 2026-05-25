import { getCurrentAdminProfile } from '@/lib/auth'
import { sql } from '@/lib/neon'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'

async function saveProfessional(fd: FormData) {
  'use server'
  try {
    const full_name = String(fd.get('full_name') || '').trim()
    if (!full_name) redirect('/admin/professionals?error=Verifique+os+campos+obrigat%C3%B3rios')
    await sql`insert into professionals (full_name,specialty,cro,schedule_notes,is_active) values (${full_name},${String(fd.get('specialty') || '') || null},${String(fd.get('cro') || '') || null},${String(fd.get('schedule_notes') || '') || null},${fd.get('is_active') === 'on'})`
    revalidatePath('/admin/professionals')
    redirect('/admin/professionals?ok=Profissional+salvo+com+sucesso')
  } catch (e) {
    console.error('professionals.save', e)
    redirect('/admin/professionals?error=N%C3%A3o+foi+poss%C3%ADvel+salvar.+Verifique+os+dados+e+tente+novamente')
  }
}

async function saveSchedule(fd: FormData) {
  'use server'
  try {
    const professional_id = String(fd.get('professional_id') || '')
    const weekday = Number(fd.get('weekday'))
    const start_time = String(fd.get('start_time') || '')
    const end_time = String(fd.get('end_time') || '')
    const break_start = String(fd.get('break_start') || '')
    const break_end = String(fd.get('break_end') || '')
    const duration = Number(fd.get('appointment_duration_minutes') || 60)
    const is_active = fd.get('is_active') === 'on'

    if (!professional_id || Number.isNaN(weekday) || !start_time || !end_time) {
      redirect('/admin/professionals?error=Preencha+os+campos+obrigat%C3%B3rios+da+agenda')
    }

    await sql`
      insert into professional_schedules (professional_id, weekday, start_time, end_time, break_start, break_end, appointment_duration_minutes, is_active)
      values (${professional_id}::uuid, ${weekday}, ${start_time}::time, ${end_time}::time, ${break_start || null}::time, ${break_end || null}::time, ${duration}, ${is_active})
      on conflict (professional_id, weekday)
      do update set
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        break_start = excluded.break_start,
        break_end = excluded.break_end,
        appointment_duration_minutes = excluded.appointment_duration_minutes,
        is_active = excluded.is_active
    `

    revalidatePath('/admin/professionals')
    redirect('/admin/professionals?ok=Agenda+salva+com+sucesso')
  } catch (e) {
    console.error('professionals.schedule.save', e)
    redirect('/admin/professionals?error=N%C3%A3o+foi+poss%C3%ADvel+salvar+agenda')
  }
}

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  const rows = await sql`select * from professionals order by created_at desc limit 100`
  const schedules = await sql`select ps.*, p.full_name from professional_schedules ps join professionals p on p.id = ps.professional_id order by p.full_name, ps.weekday`
  const params = (await searchParams) ?? {}
  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

  return <section className='space-y-6'>
    <h1 className='text-2xl font-bold'>Profissionais e Agenda</h1>
    <FormFeedback ok={params.ok} error={params.error} />

    <form action={saveProfessional} className='grid md:grid-cols-2 gap-3'>
      <input name='full_name' required placeholder='Nome completo *' />
      <input name='specialty' placeholder='Especialidade' />
      <input name='cro' placeholder='cro' />
      <input name='schedule_notes' placeholder='Observações da agenda' />
      <label className='flex items-center gap-2'><input type='checkbox' name='is_active' defaultChecked />Ativo</label>
      <SubmitButton />
    </form>

    <form action={saveSchedule} className='grid md:grid-cols-3 gap-3'>
      <select name='professional_id' required>
        <option value=''>Profissional *</option>
        {(rows as any[]).map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
      </select>
      <select name='weekday' required>
        {weekDays.map((d, i) => <option key={d} value={i}>{d}</option>)}
      </select>
      <input name='appointment_duration_minutes' type='number' min={10} defaultValue={60} />
      <input name='start_time' type='time' required />
      <input name='end_time' type='time' required />
      <input name='break_start' type='time' />
      <input name='break_end' type='time' />
      <label className='flex items-center gap-2'><input type='checkbox' name='is_active' defaultChecked />Agenda ativa</label>
      <SubmitButton />
    </form>

    <div className='overflow-auto'><table className='w-full text-sm'><thead><tr><th>Nome</th><th>Especialidade</th><th>Ativo</th></tr></thead><tbody>{(rows as any[]).map(r => <tr key={r.id}><td>{r.full_name}</td><td>{r.specialty}</td><td>{r.is_active ? 'Sim' : 'Não'}</td></tr>)}</tbody></table></div>
    <div className='overflow-auto'><table className='w-full text-sm'><thead><tr><th>Profissional</th><th>Dia</th><th>Expediente</th><th>Intervalo</th><th>Duração</th><th>Ativo</th></tr></thead><tbody>{(schedules as any[]).map(s => <tr key={s.id}><td>{s.full_name}</td><td>{weekDays[s.weekday]}</td><td>{s.start_time} - {s.end_time}</td><td>{s.break_start && s.break_end ? `${s.break_start} - ${s.break_end}` : '-'}</td><td>{s.appointment_duration_minutes} min</td><td>{s.is_active ? 'Sim' : 'Não'}</td></tr>)}</tbody></table></div>
  </section>
}
