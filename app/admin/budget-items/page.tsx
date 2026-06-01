import { getCurrentAdminProfile } from '@/lib/auth'
import { sql } from '@/lib/neon'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'
import { DeleteConfirmButton } from '../_components/delete-confirm-button'

const parseMoney = (v: string) => Number(v.replace(/\./g, '').replace(',', '.')) || 0
const optional = (v: FormDataEntryValue | null) => String(v || '').trim() || null
const currency = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

async function save(fd: FormData) {
  'use server'
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  const id = optional(fd.get('id'))
  const budget = optional(fd.get('budget_id'))
  const desc = optional(fd.get('description'))
  let target = '/admin/budget-items'
  try {
    if (!budget || !desc) {
      target += '?error=Informe+or%C3%A7amento+e+descri%C3%A7%C3%A3o'
    } else if (id) {
      const updated = await sql`
        update budget_items
           set budget_id = ${budget}::uuid,
               procedure_id = ${optional(fd.get('procedure_id'))}::uuid,
               description = ${desc},
               quantity = ${Number(fd.get('quantity') || 1)},
               unit_amount = ${parseMoney(String(fd.get('unit_amount') || '0'))}
         where id = ${id}::uuid
         returning id
      `
      target += (updated as unknown[]).length ? '?ok=Item+atualizado+com+sucesso' : '?error=Item+n%C3%A3o+encontrado'
    } else {
      await sql`
        insert into budget_items (budget_id, procedure_id, description, quantity, unit_amount)
        values (${budget}::uuid, ${optional(fd.get('procedure_id'))}::uuid, ${desc}, ${Number(fd.get('quantity') || 1)}, ${parseMoney(String(fd.get('unit_amount') || '0'))})
      `
      target += '?ok=Item+cadastrado+com+sucesso'
    }
    await sql`
      update budgets
         set total_amount = coalesce((select sum(line_total) from budget_items where budget_id = ${budget}::uuid), 0)
       where id = ${budget}::uuid
    `
  } catch (e) {
    console.error('budget_items.save')
    target += '?error=N%C3%A3o+foi+poss%C3%ADvel+salvar+o+item'
  }
  revalidatePath('/admin/budget-items')
  revalidatePath('/admin/budgets')
  redirect(target)
}

async function remove(fd: FormData) {
  'use server'
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  let target = '/admin/budget-items'
  try {
    const id = optional(fd.get('id'))
    const budget = optional(fd.get('budget_id'))
    const deleted = id ? await sql`delete from budget_items where id = ${id}::uuid returning id` : []
    if (budget) await sql`update budgets set total_amount = coalesce((select sum(line_total) from budget_items where budget_id = ${budget}::uuid), 0) where id = ${budget}::uuid`
    target += (deleted as unknown[]).length ? '?ok=Item+exclu%C3%ADdo+com+sucesso' : '?error=Item+n%C3%A3o+encontrado'
  } catch (e) {
    console.error('budget_items.delete')
    target += '?error=N%C3%A3o+foi+poss%C3%ADvel+excluir+o+item'
  }
  revalidatePath('/admin/budget-items')
  revalidatePath('/admin/budgets')
  redirect(target)
}

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  const params = (await searchParams) ?? {}

  const [items, budgets, procedures] = await Promise.all([
    sql`select bi.*, b.patient_id, p.full_name patient_name, pr.name procedure_name from budget_items bi join budgets b on b.id = bi.budget_id join patients p on p.id = b.patient_id left join procedures pr on pr.id = bi.procedure_id order by bi.created_at desc limit 100`,
    sql`select b.id, p.full_name patient_name, b.status from budgets b join patients p on p.id = b.patient_id order by b.created_at desc limit 200`,
    sql`select id, name from procedures where is_active = true order by name`,
  ])
  const bs = budgets as any[]
  const ps = procedures as any[]

  return (
    <section className='space-y-8'>
      <div>
        <p className='text-xs font-bold tracking-[0.1em] uppercase mb-1 text-[#30628a]' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Gestão</p>
        <h1 className='text-2xl font-extrabold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>Itens do Orçamento</h1>
        <p className='text-sm text-[#70787c] mt-1'>Inclua, edite e remova itens vinculados aos orçamentos dos pacientes.</p>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
        <div className='px-6 py-4 border-b border-[#f2f4f5] flex items-center gap-3'>
          <span className='text-xl'>📝</span>
          <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>Adicionar item</h2>
        </div>
        <form action={save} className='px-6 py-6 grid gap-x-5 gap-y-4 md:grid-cols-2'>
          <div>
            <label htmlFor='bi_budget'>Orçamento *</label>
            <select id='bi_budget' name='budget_id' required>
              <option value=''>Selecione o orçamento</option>
              {bs.map(b => <option key={b.id} value={b.id}>{b.id.slice(0, 8)} — {b.patient_name} ({b.status})</option>)}
            </select>
          </div>
          <div>
            <label htmlFor='bi_procedure'>Procedimento vinculado</label>
            <select id='bi_procedure' name='procedure_id'>
              <option value=''>Procedimento avulso</option>
              {ps.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className='md:col-span-2'><label htmlFor='bi_desc'>Descrição *</label><input id='bi_desc' name='description' required placeholder='Ex.: Restauração dente 16, Limpeza' /></div>
          <div><label htmlFor='bi_qty'>Quantidade</label><input id='bi_qty' name='quantity' type='number' min={1} defaultValue={1} required /></div>
          <div><label htmlFor='bi_amount'>Valor unitário (R$) *</label><input id='bi_amount' name='unit_amount' required placeholder='Ex.: 120,00' /></div>
          <div className='md:col-span-2 flex justify-end'><SubmitButton label='✓ Adicionar item' /></div>
        </form>
      </div>

      <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
        <div className='px-6 py-4 border-b border-[#f2f4f5]'>
          <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>
            Itens cadastrados <span className='ml-2 text-sm font-normal text-[#70787c]'>({(items as any[]).length})</span>
          </h2>
        </div>
        {(items as any[]).length === 0 ? (
          <div className='px-6 py-16 text-center'><div className='text-4xl mb-3'>📝</div><p className='text-[#70787c] text-sm'>Nenhum item cadastrado.</p></div>
        ) : (
          <div className='admin-table-wrap rounded-none border-0'>
            <table className='admin-table' style={{ minWidth: 700 }}>
              <thead><tr>{['Paciente', 'Descrição', 'Procedimento', 'Qtd.', 'Total', 'Ações'].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {(items as any[]).map(i => (
                  <tr key={i.id}>
                    <td className='font-semibold text-[#003441]'>{i.patient_name}</td>
                    <td>{i.description}</td>
                    <td>{i.procedure_name || '—'}</td>
                    <td>{i.quantity}</td>
                    <td className='font-semibold'>{currency(Number(i.line_total))}</td>
                    <td className='space-y-2'>
                      <details className='rounded-lg border border-[#e6e8e9]'>
                        <summary className='cursor-pointer px-3 py-1.5 text-xs font-semibold text-[#30628a] hover:text-[#003441]'>✏️ Editar</summary>
                        <form action={save} className='p-3 grid gap-3 md:grid-cols-2 border-t border-[#f2f4f5]'>
                          <input type='hidden' name='id' value={i.id} />
                          <div><label>Orçamento</label><select name='budget_id' defaultValue={i.budget_id}>{bs.map(b => <option key={b.id} value={b.id}>{b.id.slice(0, 8)} — {b.patient_name}</option>)}</select></div>
                          <div><label>Procedimento</label><select name='procedure_id' defaultValue={i.procedure_id || ''}><option value=''>Avulso</option>{ps.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                          <div className='md:col-span-2'><label>Descrição</label><input name='description' defaultValue={i.description} required /></div>
                          <div><label>Quantidade</label><input name='quantity' type='number' min={1} defaultValue={i.quantity} /></div>
                          <div><label>Valor unitário</label><input name='unit_amount' defaultValue={String(i.unit_amount).replace('.', ',')} /></div>
                          <div className='md:col-span-2 flex justify-end'><SubmitButton label='Atualizar' variant='secondary' /></div>
                        </form>
                      </details>
                      <form action={remove}>
                        <input type='hidden' name='id' value={i.id} />
                        <input type='hidden' name='budget_id' value={i.budget_id} />
                        <DeleteConfirmButton message={`Excluir o item "${i.description}"?`} />
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
