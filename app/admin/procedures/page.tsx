import { getCurrentAdminProfile } from '@/lib/auth'
import { sql } from '@/lib/neon'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'

const parseMoney = (v: string) => Number(v.replace(/\./g, '').replace(',', '.')) || 0

async function save(fd: FormData) {
  'use server'
  try {
    const name = String(fd.get('name') || '').trim()
    if (!name) redirect('/admin/procedures?error=Verifique+os+campos+obrigat%C3%B3rios')
    await sql`
      insert into procedures (name, description, amount, estimated_minutes, category, is_active)
      values (
        ${name},
        ${String(fd.get('description') || '') || null},
        ${parseMoney(String(fd.get('amount') || '0'))},
        ${Number(fd.get('estimated_minutes') || 0) || null},
        ${String(fd.get('category') || '') || null},
        ${fd.get('is_active') === 'on'}
      )`
    revalidatePath('/admin/procedures')
    redirect('/admin/procedures?ok=Procedimento+salvo+com+sucesso')
  } catch (e) {
    console.error('procedures.save', e)
    redirect('/admin/procedures?error=N%C3%A3o+foi+poss%C3%ADvel+salvar.+Verifique+os+dados+e+tente+novamente')
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
  const rows = await sql`select * from procedures order by created_at desc limit 100`

  return (
    <section className='space-y-6'>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Procedimentos</h1>
          <p className='page-subtitle'>Cadastro e listagem de procedimentos</p>
        </div>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      {/* Formulário */}
      <div className='form-panel'>
        <p className='form-section-title'>Novo procedimento</p>
        <form action={save} className='grid md:grid-cols-2 gap-3'>
          <div className='field'>
            <label>Nome *</label>
            <input name='name' required placeholder='Nome do procedimento' />
          </div>
          <div className='field'>
            <label>Valor *</label>
            <input name='amount' required placeholder='Ex: 120,50' />
          </div>
          <div className='field'>
            <label>Duração estimada (min)</label>
            <input name='estimated_minutes' type='number' placeholder='Ex: 60' />
          </div>
          <div className='field'>
            <label>Categoria</label>
            <input name='category' placeholder='Ex: Cirurgia, Prevenção' />
          </div>
          <div className='field md:col-span-2'>
            <label>Descrição</label>
            <textarea name='description' rows={3} placeholder='Descrição detalhada do procedimento' />
          </div>
          <div className='flex items-center gap-2 pt-1'>
            <input
              type='checkbox'
              name='is_active'
              id='is_active_proc'
              defaultChecked
              className='w-4 h-4'
            />
            <label htmlFor='is_active_proc' className='mb-0 cursor-pointer'>Ativo</label>
          </div>
          <div className='flex items-end'>
            <SubmitButton label='Cadastrar procedimento' />
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className='card overflow-hidden'>
        <div className='overflow-x-auto'>
          {(rows as any[]).length === 0 ? (
            <div className='px-6 py-12 text-center text-slate-400 text-sm'>
              Nenhum procedimento cadastrado ainda.
            </div>
          ) : (
            <table className='data-table'>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Valor</th>
                  <th>Duração</th>
                  <th>Categoria</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(rows as any[]).map(r => (
                  <tr key={r.id}>
                    <td className='font-medium'>{r.name}</td>
                    <td>
                      {Number(r.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td>{r.estimated_minutes ? `${r.estimated_minutes} min` : '—'}</td>
                    <td>{r.category || '—'}</td>
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
