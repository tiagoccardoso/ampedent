import { getCurrentAdminProfile } from '@/lib/auth'
import { sql } from '@/lib/neon'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'
import { DeleteConfirmButton } from '../_components/delete-confirm-button'

const parseMoney = (value: string) => Number(value.replace(/\./g, '').replace(',', '.')) || 0
const optional = (value: FormDataEntryValue | null) => String(value || '').trim() || null

async function saveProcedure(formData: FormData) {
  'use server'

  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  if (!['superadmin', 'admin', 'dentist'].includes(admin.role)) redirect('/admin/dashboard')

  const id = optional(formData.get('id'))
  const name = optional(formData.get('name'))
  let target = '/admin/procedures'

  try {
    if (!name) {
      target += '?error=Informe+o+nome+do+procedimento'
    } else if (id) {
      const updated = await sql`
        update procedures
           set name = ${name},
               description = ${optional(formData.get('description'))},
               amount = ${parseMoney(String(formData.get('amount') || '0'))},
               estimated_minutes = ${Number(formData.get('estimated_minutes') || 0) || null},
               category = ${optional(formData.get('category'))},
               is_active = ${formData.get('is_active') === 'on'}
         where id = ${id}::uuid
         returning id
      `
      target += (updated as unknown[]).length ? '?ok=Procedimento+atualizado+com+sucesso' : '?error=Procedimento+n%C3%A3o+encontrado'
    } else {
      await sql`
        insert into procedures (name, description, amount, estimated_minutes, category, is_active)
        values (${name}, ${optional(formData.get('description'))}, ${parseMoney(String(formData.get('amount') || '0'))}, ${Number(formData.get('estimated_minutes') || 0) || null}, ${optional(formData.get('category'))}, ${formData.get('is_active') === 'on'})
      `
      target += '?ok=Procedimento+cadastrado+com+sucesso'
    }
  } catch (error) {
    console.error('procedures.save')
    target += '?error=N%C3%A3o+foi+poss%C3%ADvel+salvar+o+procedimento'
  }

  revalidatePath('/admin/procedures')
  redirect(target)
}

async function deleteProcedure(formData: FormData) {
  'use server'

  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  if (!['superadmin', 'admin', 'dentist'].includes(admin.role)) redirect('/admin/dashboard')

  let target = '/admin/procedures'
  try {
    const id = optional(formData.get('id'))
    if (!id) {
      target += '?error=Procedimento+inv%C3%A1lido'
    } else {
      const deleted = await sql`delete from procedures where id = ${id}::uuid returning id`
      target += (deleted as unknown[]).length ? '?ok=Procedimento+exclu%C3%ADdo+com+sucesso' : '?error=Procedimento+n%C3%A3o+encontrado'
    }
  } catch (error) {
    console.error('procedures.delete')
    target += '?error=N%C3%A3o+foi+poss%C3%ADvel+excluir.+Verifique+se+n%C3%A3o+h%C3%A1+v%C3%ADnculos'
  }

  revalidatePath('/admin/procedures')
  redirect(target)
}

const currency = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  if (!['superadmin', 'admin', 'dentist'].includes(admin.role)) redirect('/admin/dashboard')

  const params = (await searchParams) ?? {}
  const rows = await sql`select * from procedures order by created_at desc limit 100`

  return (
    <section className='space-y-8'>
      <div>
        <p className='text-xs font-bold tracking-[0.1em] uppercase mb-1 text-[#30628a]' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Clínica</p>
        <h1 className='text-2xl font-extrabold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>Procedimentos</h1>
        <p className='text-sm text-[#70787c] mt-1'>Gerencie os serviços e procedimentos usados em agendamentos e orçamentos.</p>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
        <div className='px-6 py-4 border-b border-[#f2f4f5] flex items-center gap-3'>
          <span className='text-xl'>➕</span>
          <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>Cadastrar procedimento</h2>
        </div>
        <form action={saveProcedure} className='px-6 py-6 grid gap-x-5 gap-y-4 md:grid-cols-2'>
          <div><label htmlFor='proc_name'>Nome *</label><input id='proc_name' name='name' required placeholder='Ex.: Restauração em resina' /></div>
          <div><label htmlFor='proc_amount'>Valor (R$) *</label><input id='proc_amount' name='amount' required placeholder='Ex.: 120,50' /></div>
          <div><label htmlFor='proc_duration'>Duração estimada (min)</label><input id='proc_duration' name='estimated_minutes' type='number' min={1} placeholder='60' /></div>
          <div><label htmlFor='proc_category'>Categoria</label><input id='proc_category' name='category' placeholder='Ex.: Restauração, Endodontia' /></div>
          <div className='md:col-span-2'><label htmlFor='proc_desc'>Descrição</label><textarea id='proc_desc' name='description' rows={2} placeholder='Detalhes opcionais do procedimento' /></div>
          <div className='flex items-center gap-2'>
            <input type='checkbox' id='proc_active' name='is_active' defaultChecked className='w-4 h-4 accent-[#003441]' />
            <label htmlFor='proc_active' className='mb-0 normal-case text-sm text-[#40484b]'>Procedimento ativo</label>
          </div>
          <div className='flex justify-end'><SubmitButton label='✓ Cadastrar procedimento' /></div>
        </form>
      </div>

      <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
        <div className='px-6 py-4 border-b border-[#f2f4f5]'>
          <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>
            Procedimentos cadastrados <span className='ml-2 text-sm font-normal text-[#70787c]'>({(rows as any[]).length})</span>
          </h2>
        </div>
        {(rows as any[]).length === 0 ? (
          <div className='px-6 py-16 text-center'><div className='text-4xl mb-3'>⚙️</div><p className='text-[#70787c] text-sm'>Nenhum procedimento cadastrado.</p></div>
        ) : (
          <div className='admin-table-wrap rounded-none border-0'>
            <table className='admin-table' style={{ minWidth: 720 }}>
              <thead><tr>{['Nome', 'Valor', 'Duração', 'Categoria', 'Ativo', 'Ações'].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {(rows as any[]).map(row => (
                  <tr key={row.id}>
                    <td className='font-semibold text-[#003441]'>{row.name}</td>
                    <td>{currency(Number(row.amount))}</td>
                    <td>{row.estimated_minutes ? `${row.estimated_minutes} min` : '—'}</td>
                    <td>{row.category || '—'}</td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${row.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {row.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className='space-y-2'>
                      <details className='rounded-lg border border-[#e6e8e9]'>
                        <summary className='cursor-pointer px-3 py-1.5 text-xs font-semibold text-[#30628a] hover:text-[#003441]'>✏️ Editar</summary>
                        <form action={saveProcedure} className='p-3 grid gap-3 md:grid-cols-2 border-t border-[#f2f4f5]'>
                          <input type='hidden' name='id' value={row.id} />
                          <div><label>Nome *</label><input name='name' defaultValue={row.name} required /></div>
                          <div><label>Valor</label><input name='amount' defaultValue={String(row.amount).replace('.', ',')} /></div>
                          <div><label>Duração (min)</label><input name='estimated_minutes' type='number' min={1} defaultValue={row.estimated_minutes || ''} /></div>
                          <div><label>Categoria</label><input name='category' defaultValue={row.category || ''} /></div>
                          <div className='md:col-span-2'><label>Descrição</label><textarea name='description' defaultValue={row.description || ''} rows={2} /></div>
                          <div className='flex items-center gap-2'>
                            <input type='checkbox' name='is_active' defaultChecked={row.is_active} className='w-4 h-4 accent-[#003441]' />
                            <span className='text-xs text-[#40484b]'>Ativo</span>
                          </div>
                          <div className='flex justify-end'><SubmitButton label='Atualizar' variant='secondary' /></div>
                        </form>
                      </details>
                      <form action={deleteProcedure}><input type='hidden' name='id' value={row.id} /><DeleteConfirmButton message={`Excluir o procedimento "${row.name}"?`} /></form>
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
