import { getCurrentAdminProfile } from '@/lib/auth'
import { sql } from '@/lib/neon'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'

async function save(fd: FormData) {
  'use server'
  try {
    const full_name = String(fd.get('full_name') || '').trim()
    if (!full_name) redirect('/admin/professionals?error=Verifique+os+campos+obrigat%C3%B3rios')
    await sql`
      insert into professionals (full_name, specialty, cro, schedule_notes, is_active)
      values (
        ${full_name},
        ${String(fd.get('specialty') || '') || null},
        ${String(fd.get('cro') || '') || null},
        ${String(fd.get('schedule_notes') || '') || null},
        ${fd.get('is_active') === 'on'}
      )`
    revalidatePath('/admin/professionals')
    redirect('/admin/professionals?ok=Profissional+salvo+com+sucesso')
  } catch (e) {
    console.error('professionals.save', e)
    redirect('/admin/professionals?error=N%C3%A3o+foi+poss%C3%ADvel+salvar.+Verifique+os+dados+e+tente+novamente')
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>
}) {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  const rows = await sql`select * from professionals order by created_at desc limit 100`
  const params = (await searchParams) ?? {}

  return (
    <section className='space-y-6'>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Profissionais</h1>
          <p className='page-subtitle'>Cadastro e listagem de profissionais</p>
        </div>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      {/* Formulário */}
      <div className='form-panel'>
        <p className='form-section-title'>Novo profissional</p>
        <form action={save} className='grid md:grid-cols-2 gap-3'>
          <div className='field'>
            <label>Nome completo *</label>
            <input name='full_name' required placeholder='Nome completo' />
          </div>
          <div className='field'>
            <label>Especialidade</label>
            <input name='specialty' placeholder='Ex: Ortodontia' />
          </div>
          <div className='field'>
            <label>CRO</label>
            <input name='cro' placeholder='Número do CRO' />
          </div>
          <div className='field'>
            <label>Observações da agenda</label>
            <input name='schedule_notes' placeholder='Ex: Atende às segundas e quartas' />
          </div>
          <div className='flex items-center gap-2 pt-1'>
            <input
              type='checkbox'
              name='is_active'
              id='is_active_prof'
              defaultChecked
              className='w-4 h-4'
            />
            <label htmlFor='is_active_prof' className='mb-0 cursor-pointer'>Ativo</label>
          </div>
          <div className='flex items-end'>
            <SubmitButton label='Cadastrar profissional' />
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className='card overflow-hidden'>
        <div className='overflow-x-auto'>
          {(rows as any[]).length === 0 ? (
            <div className='px-6 py-12 text-center text-slate-400 text-sm'>
              Nenhum profissional cadastrado ainda.
            </div>
          ) : (
            <table className='data-table'>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Especialidade</th>
                  <th>CRO</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(rows as any[]).map(r => (
                  <tr key={r.id}>
                    <td className='font-medium'>{r.full_name}</td>
                    <td>{r.specialty || '—'}</td>
                    <td>{r.cro || '—'}</td>
                    <td>
                      <span className={`badge ${r.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {r.is_active ? 'Ativo' : 'Inativo'}
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
