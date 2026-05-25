import { getCurrentAdminProfile } from '@/lib/auth'
import { sql } from '@/lib/neon'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { FormFeedback } from '../../_components/form-feedback'
import { SubmitButton } from '../../_components/submit-button'
import { ProfessionalScheduleRow, ScheduleBlockRow } from '@/lib/types'
import Link from 'next/link'

const DAYS = [
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
]

async function saveScheduleDay(fd: FormData) {
  'use server'
  const professionalId = String(fd.get('professional_id') || '').trim()
  const dayOfWeek = Number(fd.get('day_of_week'))
  const startTime = String(fd.get('start_time') || '').trim()
  const endTime = String(fd.get('end_time') || '').trim()
  const slotDuration = Math.max(15, Number(fd.get('slot_duration_minutes') || 60))
  const isActive = fd.get('is_active') === 'on'

  if (!professionalId || !startTime || !endTime)
    redirect(
      `/admin/professionals/schedule?id=${professionalId}&error=Verifique+os+campos+obrigat%C3%B3rios`,
    )

  try {
    await sql`
      INSERT INTO professional_schedules
        (professional_id, day_of_week, start_time, end_time, slot_duration_minutes, is_active)
      VALUES
        (${professionalId}::uuid, ${dayOfWeek}, ${startTime}, ${endTime}, ${slotDuration}, ${isActive})
      ON CONFLICT (professional_id, day_of_week) DO UPDATE SET
        start_time            = EXCLUDED.start_time,
        end_time              = EXCLUDED.end_time,
        slot_duration_minutes = EXCLUDED.slot_duration_minutes,
        is_active             = EXCLUDED.is_active,
        updated_at            = now()
    `
    revalidatePath('/admin/professionals/schedule')
    redirect(
      `/admin/professionals/schedule?id=${professionalId}&ok=Agenda+salva+com+sucesso`,
    )
  } catch (e) {
    console.error('saveScheduleDay', e)
    redirect(
      `/admin/professionals/schedule?id=${professionalId}&error=Erro+ao+salvar+agenda`,
    )
  }
}

async function deleteScheduleDay(fd: FormData) {
  'use server'
  const professionalId = String(fd.get('professional_id') || '').trim()
  const dayOfWeek = Number(fd.get('day_of_week'))

  if (!professionalId)
    redirect('/admin/professionals/schedule?error=ID+inv%C3%A1lido')

  try {
    await sql`
      DELETE FROM professional_schedules
      WHERE professional_id = ${professionalId}::uuid
        AND day_of_week = ${dayOfWeek}
    `
    revalidatePath('/admin/professionals/schedule')
    redirect(
      `/admin/professionals/schedule?id=${professionalId}&ok=Expediente+removido`,
    )
  } catch (e) {
    console.error('deleteScheduleDay', e)
    redirect(
      `/admin/professionals/schedule?id=${professionalId}&error=Erro+ao+remover+expediente`,
    )
  }
}

async function addBlock(fd: FormData) {
  'use server'
  const professionalId = String(fd.get('professional_id') || '').trim()
  const blockDate = String(fd.get('block_date') || '').trim()
  const startTime = String(fd.get('start_time') || '').trim() || null
  const endTime = String(fd.get('end_time') || '').trim() || null
  const reason = String(fd.get('reason') || '').trim() || null

  if (!professionalId || !blockDate)
    redirect(
      `/admin/professionals/schedule?id=${professionalId}&error=Data+do+bloqueio+%C3%A9+obrigat%C3%B3ria`,
    )

  // Se informou um dos horários, exige ambos
  if ((startTime && !endTime) || (!startTime && endTime))
    redirect(
      `/admin/professionals/schedule?id=${professionalId}&error=Informe+hor%C3%A1rio+inicial+e+final+do+bloqueio`,
    )

  try {
    await sql`
      INSERT INTO schedule_blocks (professional_id, block_date, start_time, end_time, reason)
      VALUES (${professionalId}::uuid, ${blockDate}::date, ${startTime}, ${endTime}, ${reason})
    `
    revalidatePath('/admin/professionals/schedule')
    redirect(
      `/admin/professionals/schedule?id=${professionalId}&ok=Bloqueio+adicionado`,
    )
  } catch (e) {
    console.error('addBlock', e)
    redirect(
      `/admin/professionals/schedule?id=${professionalId}&error=Erro+ao+adicionar+bloqueio`,
    )
  }
}

async function deleteBlock(fd: FormData) {
  'use server'
  const id = String(fd.get('id') || '').trim()
  const professionalId = String(fd.get('professional_id') || '').trim()

  if (!id)
    redirect(
      `/admin/professionals/schedule?id=${professionalId}&error=ID+inv%C3%A1lido`,
    )

  try {
    await sql`DELETE FROM schedule_blocks WHERE id = ${id}::uuid`
    revalidatePath('/admin/professionals/schedule')
    redirect(
      `/admin/professionals/schedule?id=${professionalId}&ok=Bloqueio+removido`,
    )
  } catch (e) {
    console.error('deleteBlock', e)
    redirect(
      `/admin/professionals/schedule?id=${professionalId}&error=Erro+ao+remover+bloqueio`,
    )
  }
}

function formatTimeDisplay(t: string | null) {
  if (!t) return '—'
  return t.slice(0, 5)
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>
}) {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  const params = (await searchParams) ?? {}
  const professionalId = params.id ?? ''

  const allProfessionals = (await sql`
    SELECT id, full_name, specialty FROM professionals ORDER BY full_name
  `) as { id: string; full_name: string; specialty: string | null }[]

  let professional: { id: string; full_name: string; specialty: string | null } | null = null
  let schedules: ProfessionalScheduleRow[] = []
  let blocks: ScheduleBlockRow[] = []

  if (professionalId) {
    const profRows = await sql`
      SELECT id, full_name, specialty FROM professionals WHERE id = ${professionalId}::uuid LIMIT 1
    `
    professional = (profRows[0] as any) ?? null

    if (professional) {
      const [sRows, bRows] = await Promise.all([
        sql`
          SELECT * FROM professional_schedules
          WHERE professional_id = ${professionalId}::uuid
          ORDER BY day_of_week
        `,
        sql`
          SELECT * FROM schedule_blocks
          WHERE professional_id = ${professionalId}::uuid
          ORDER BY block_date DESC
          LIMIT 50
        `,
      ])
      schedules = sRows as ProfessionalScheduleRow[]
      blocks = bRows as ScheduleBlockRow[]
    }
  }

  const scheduleMap = Object.fromEntries(schedules.map(s => [s.day_of_week, s]))

  return (
    <section className='space-y-8 max-w-4xl'>
      <div className='flex items-center gap-3'>
        <Link
          href='/admin/professionals'
          className='text-[#005a71] hover:underline text-sm'>
          ← Profissionais
        </Link>
        <span className='text-gray-300'>|</span>
        <h1 className='text-2xl font-bold text-[#0b1c30]'>Agenda de Trabalho</h1>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      {/* Seletor de profissional */}
      <div className='card'>
        <h2 className='section-title'>Selecionar Profissional</h2>
        <form method='GET'>
          <div className='grid md:grid-cols-3 gap-3 items-end'>
            <div className='md:col-span-2'>
              <label htmlFor='prof-select'>Profissional</label>
              <select
                id='prof-select'
                name='id'
                defaultValue={professionalId}>
                <option value=''>Selecione…</option>
                {allProfessionals.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                    {p.specialty ? ` — ${p.specialty}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <button type='submit' className='btn-primary'>
              Carregar agenda
            </button>
          </div>
        </form>
      </div>

      {professional && (
        <>
          {/* Expediente semanal */}
          <div className='card'>
            <h2 className='section-title'>
              Expediente Semanal —{' '}
              <span className='text-[#005a71]'>{professional.full_name}</span>
            </h2>
            <p className='text-sm text-[#64748B] mb-6'>
              Configure os dias e horários de atendimento. A duração de cada
              slot define o intervalo entre consultas disponíveis para os
              pacientes.
            </p>

            <div className='space-y-4'>
              {DAYS.map(day => {
                const existing = scheduleMap[day.value]
                return (
                  <div
                    key={day.value}
                    className={`rounded-lg border p-4 ${existing?.is_active ? 'border-[#0e7490] bg-[#eff4ff]' : 'border-[#E5E7EB] bg-white'}`}>
                    <div className='flex items-start justify-between gap-4 flex-wrap'>
                      <div className='font-semibold text-[#0b1c30] min-w-[140px]'>
                        {day.label}
                        {existing && (
                          <span
                            className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${existing.is_active ? 'bg-[#d3f1ff] text-[#005a71]' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                            {existing.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        )}
                      </div>

                      {existing && (
                        <div className='text-sm text-[#64748B]'>
                          {formatTimeDisplay(existing.start_time)} –{' '}
                          {formatTimeDisplay(existing.end_time)} &bull; slots de{' '}
                          {existing.slot_duration_minutes} min
                        </div>
                      )}
                    </div>

                    {/* Formulário salvar — standalone, sem aninhamento */}
                    <form action={saveScheduleDay} className='mt-3'>
                      <input type='hidden' name='professional_id' value={professionalId} />
                      <input type='hidden' name='day_of_week' value={day.value} />
                      <div className='grid sm:grid-cols-2 md:grid-cols-4 gap-2 items-end'>
                        <div>
                          <label className='text-xs'>Início</label>
                          <input
                            type='time'
                            name='start_time'
                            defaultValue={existing?.start_time?.slice(0, 5) ?? '08:00'}
                            required
                          />
                        </div>
                        <div>
                          <label className='text-xs'>Fim</label>
                          <input
                            type='time'
                            name='end_time'
                            defaultValue={existing?.end_time?.slice(0, 5) ?? '17:00'}
                            required
                          />
                        </div>
                        <div>
                          <label className='text-xs'>Slot (min)</label>
                          <input
                            type='number'
                            name='slot_duration_minutes'
                            defaultValue={existing?.slot_duration_minutes ?? 60}
                            min={15}
                            max={240}
                            step={15}
                            required
                          />
                        </div>
                        <div className='flex items-center gap-3 pb-1'>
                          <label className='flex items-center gap-1 text-sm cursor-pointer'>
                            <input
                              type='checkbox'
                              name='is_active'
                              defaultChecked={existing?.is_active ?? true}
                              className='w-4 h-4'
                            />
                            Ativo
                          </label>
                        </div>
                      </div>
                      <div className='mt-3'>
                        <SubmitButton label='Salvar expediente' />
                      </div>
                    </form>
                    {/* Formulário remover — irmão do salvar, nunca aninhado */}
                    {existing && (
                      <form action={deleteScheduleDay} className='mt-2'>
                        <input type='hidden' name='professional_id' value={professionalId} />
                        <input type='hidden' name='day_of_week' value={day.value} />
                        <button
                          type='submit'
                          className='btn-danger text-xs py-1 px-3'
                          onClick={e => {
                            if (!confirm('Remover este expediente?')) e.preventDefault()
                          }}>
                          Remover expediente
                        </button>
                      </form>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bloqueios de horário */}
          <div className='card'>
            <h2 className='section-title'>Bloqueios de Data / Horário</h2>
            <p className='text-sm text-[#64748B] mb-4'>
              Bloqueie datas específicas (férias, feriados) ou horários dentro de
              um dia (almoço, pausa). Deixe os campos de horário em branco para
              bloquear o dia inteiro.
            </p>

            <form action={addBlock} className='grid sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6'>
              <input type='hidden' name='professional_id' value={professionalId} />
              <div>
                <label className='text-xs'>Data *</label>
                <input type='date' name='block_date' required />
              </div>
              <div>
                <label className='text-xs'>Início (opcional)</label>
                <input type='time' name='start_time' />
              </div>
              <div>
                <label className='text-xs'>Fim (opcional)</label>
                <input type='time' name='end_time' />
              </div>
              <div>
                <label className='text-xs'>Motivo</label>
                <input type='text' name='reason' placeholder='Ex.: Almoço' />
              </div>
              <div className='sm:col-span-2 md:col-span-4'>
                <SubmitButton label='Adicionar bloqueio' />
              </div>
            </form>

            {blocks.length > 0 ? (
              <div className='overflow-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-[#E5E7EB]'>
                      <th className='text-left py-2 pr-4 font-semibold text-[#0b1c30]'>Data</th>
                      <th className='text-left py-2 pr-4 font-semibold text-[#0b1c30]'>Início</th>
                      <th className='text-left py-2 pr-4 font-semibold text-[#0b1c30]'>Fim</th>
                      <th className='text-left py-2 pr-4 font-semibold text-[#0b1c30]'>Motivo</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {blocks.map(b => (
                      <tr key={b.id} className='border-b border-[#F3F4F6] hover:bg-[#F9FAFB]'>
                        <td className='py-2 pr-4'>{b.block_date}</td>
                        <td className='py-2 pr-4'>
                          {b.start_time ? formatTimeDisplay(b.start_time) : 'Dia inteiro'}
                        </td>
                        <td className='py-2 pr-4'>
                          {b.end_time ? formatTimeDisplay(b.end_time) : '—'}
                        </td>
                        <td className='py-2 pr-4 text-[#64748B]'>{b.reason ?? '—'}</td>
                        <td className='py-2'>
                          <form action={deleteBlock}>
                            <input type='hidden' name='id' value={b.id} />
                            <input type='hidden' name='professional_id' value={professionalId} />
                            <button
                              type='submit'
                              className='text-[#ba1a1a] hover:underline text-xs'
                              onClick={e => {
                                if (!confirm('Remover este bloqueio?')) e.preventDefault()
                              }}>
                              Remover
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className='text-sm text-[#64748B] bg-[#F9FAFB] rounded-lg p-4 text-center'>
                Nenhum bloqueio cadastrado.
              </p>
            )}
          </div>
        </>
      )}

      {!professional && professionalId && (
        <div className='card text-center text-[#64748B]'>
          Profissional não encontrado.
        </div>
      )}

      {!professionalId && (
        <div className='card text-center text-[#64748B] py-8'>
          Selecione um profissional acima para gerenciar a agenda.
        </div>
      )}
    </section>
  )
}
