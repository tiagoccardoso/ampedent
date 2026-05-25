import { getCurrentAdminProfile } from '@/lib/auth'
import { sql } from '@/lib/neon'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'
import Link from 'next/link'

async function save(fd: FormData) {
  'use server'
  try {
    const full_name = String(fd.get('full_name') || '').trim()
    if (!full_name)
      redirect('/admin/professionals?error=Nome+do+profissional+%C3%A9+obrigat%C3%B3rio')

    await sql`
      INSERT INTO professionals (full_name, specialty, cro, schedule_notes, is_active)
      VALUES (
        ${full_name},
        ${String(fd.get('specialty') || '') || null},
        ${String(fd.get('cro') || '') || null},
        ${String(fd.get('schedule_notes') || '') || null},
        ${fd.get('is_active') === 'on'}
      )
    `
    revalidatePath('/admin/professionals')
    redirect('/admin/professionals?ok=Profissional+salvo+com+sucesso')
  } catch (e) {
    console.error('professionals.save', e)
    redirect(
      '/admin/professionals?error=N%C3%A3o+foi+poss%C3%ADvel+salvar.+Verifique+os+dados',
    )
  }
}

async function toggleActive(fd: FormData) {
  'use server'
  try {
    const id = String(fd.get('id') || '').trim()
    const current = fd.get('current_active') === 'true'
    if (!id) redirect('/admin/professionals?error=ID+inv%C3%A1lido')
    await sql`UPDATE professionals SET is_active = ${!current} WHERE id = ${id}::uuid`
    revalidatePath('/admin/professionals')
    redirect('/admin/professionals?ok=Status+atualizado')
  } catch (e) {
    console.error('professionals.toggle', e)
    redirect('/admin/professionals?error=Erro+ao+atualizar+status')
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>
}) {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  const rows = (await sql`
    SELECT p.*,
           COUNT(ps.id) AS schedule_days
    FROM professionals p
    LEFT JOIN professional_schedules ps ON ps.professional_id = p.id AND ps.is_active = true
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT 100
  `) as any[]

  const params = (await searchParams) ?? {}

  return (
    <section className='space-y-8 max-w-4xl'>
      <h1 className='text-2xl font-bold text-[#0b1c30]'>Profissionais</h1>
      <FormFeedback ok={params.ok} error={params.error} />

      {/* Formulário de cadastro */}
      <div className='card'>
        <h2 className='section-title'>Cadastrar novo profissional</h2>
        <form action={save} className='grid sm:grid-cols-2 gap-3'>
          <div>
            <label htmlFor='full_name'>Nome completo *</label>
            <input id='full_name' name='full_name' required placeholder='Dr. João Silva' />
          </div>
          <div>
            <label htmlFor='specialty'>Especialidade</label>
            <input id='specialty' name='specialty' placeholder='Ex.: Ortodontia' />
          </div>
          <div>
            <label htmlFor='cro'>CRO</label>
            <input id='cro' name='cro' placeholder='CRO-SP 12345' />
          </div>
          <div>
            <label htmlFor='schedule_notes'>Observações da agenda</label>
            <input id='schedule_notes' name='schedule_notes' placeholder='Observações internas' />
          </div>
          <div className='sm:col-span-2 flex items-center gap-2'>
            <label className='flex items-center gap-2 cursor-pointer text-sm font-normal'>
              <input type='checkbox' name='is_active' defaultChecked className='w-4 h-4' />
              Profissional ativo
            </label>
          </div>
          <div className='sm:col-span-2'>
            <SubmitButton label='Cadastrar profissional' />
          </div>
        </form>
      </div>

      {/* Lista de profissionais */}
      <div className='card'>
        <h2 className='section-title'>Profissionais cadastrados</h2>

        {rows.length === 0 ? (
          <p className='text-sm text-[#64748B] text-center py-6'>
            Nenhum profissional cadastrado ainda.
          </p>
        ) : (
          <div className='overflow-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-[#E5E7EB]'>
                  <th className='text-left py-3 pr-4 font-semibold text-[#0b1c30]'>Nome</th>
                  <th className='text-left py-3 pr-4 font-semibold text-[#0b1c30]'>Especialidade</th>
                  <th className='text-left py-3 pr-4 font-semibold text-[#0b1c30]'>CRO</th>
                  <th className='text-left py-3 pr-4 font-semibold text-[#0b1c30]'>Agenda</th>
                  <th className='text-left py-3 pr-4 font-semibold text-[#0b1c30]'>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className='border-b border-[#F3F4F6] hover:bg-[#F9FAFB]'>
                    <td className='py-3 pr-4 font-medium text-[#0b1c30]'>{r.full_name}</td>
                    <td className='py-3 pr-4 text-[#64748B]'>{r.specialty ?? '—'}</td>
                    <td className='py-3 pr-4 text-[#64748B]'>{r.cro ?? '—'}</td>
                    <td className='py-3 pr-4'>
                      {Number(r.schedule_days) > 0 ? (
                        <span className='inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#d3f1ff] text-[#005a71] font-medium'>
                          {r.schedule_days} dia{Number(r.schedule_days) > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className='text-xs text-[#64748B]'>Sem agenda</span>
                      )}
                    </td>
                    <td className='py-3 pr-4'>
                      <form action={toggleActive}>
                        <input type='hidden' name='id' value={r.id} />
                        <input type='hidden' name='current_active' value={String(r.is_active)} />
                        <button
                          type='submit'
                          className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer border-0 ${r.is_active ? 'bg-[#d3f9ec] text-[#006c49]' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                          {r.is_active ? 'Ativo' : 'Inativo'}
                        </button>
                      </form>
                    </td>
                    <td className='py-3'>
                      <Link
                        href={`/admin/professionals/schedule?id=${r.id}`}
                        className='text-[#005a71] hover:underline text-xs font-medium whitespace-nowrap'>
                        Gerenciar agenda →
                      </Link>
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
