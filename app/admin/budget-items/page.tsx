import { getCurrentAdminProfile } from '@/lib/auth'
import { sql } from '@/lib/neon'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'

const parseMoney = (v: string) => Number(v.replace(/\./g, '').replace(',', '.')) || 0

async function saveBudgetItem(formData: FormData) {
  'use server'
  try {
    const budget_id = String(formData.get('budget_id') || '')
    const description = String(formData.get('description') || '').trim()
    const quantity = Number(formData.get('quantity') || 1)
    const unit_amount = parseMoney(String(formData.get('unit_amount') || '0'))
    if (!budget_id || !description)
      redirect('/admin/budget-items?error=Verifique+os+campos+obrigat%C3%B3rios')
    await sql`
      insert into budget_items (budget_id, procedure_id, description, quantity, unit_amount)
      values (
        ${budget_id}::uuid,
        ${String(formData.get('procedure_id') || '') || null}::uuid,
        ${description},
        ${Number.isFinite(quantity) && quantity > 0 ? quantity : 1},
        ${unit_amount}
      )`
    revalidatePath('/admin/budget-items')
    revalidatePath('/admin/budgets')
    redirect('/admin/budget-items?ok=Item+de+or%C3%A7amento+salvo+com+sucesso')
  } catch (e) {
    console.error('budget_items.save', e)
    redirect('/admin/budget-items?error=N%C3%A3o+foi+poss%C3%ADvel+salvar.+Verifique+os+dados+e+tente+novamente')
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
  const [budgetItems, budgets, procedures] = await Promise.all([
    sql`
      select bi.*, b.patient_id, p.full_name as patient_name, pr.name as procedure_name
      from budget_items bi
      join budgets b on b.id = bi.budget_id
      join patients p on p.id = b.patient_id
      left join procedures pr on pr.id = bi.procedure_id
      order by bi.created_at desc
      limit 100`,
    sql`
      select b.id, p.full_name as patient_name, b.status
      from budgets b
      join patients p on p.id = b.patient_id
      order by b.created_at desc
      limit 200`,
    sql`select id, name from procedures where is_active = true order by name`,
  ])

  return (
    <section className='space-y-6'>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Itens do Orçamento</h1>
          <p className='page-subtitle'>Adicione itens a orçamentos existentes</p>
        </div>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      <div className='form-panel'>
        <p className='form-section-title'>Novo item</p>
        <form action={saveBudgetItem} className='grid md:grid-cols-2 gap-3'>
          <div className='field'>
            <label>Orçamento *</label>
            <select name='budget_id' required>
              <option value=''>Selecione o orçamento</option>
              {(budgets as any[]).map(b => (
                <option key={b.id} value={b.id}>
                  {b.id.slice(0, 8)} — {b.patient_name} ({b.status})
                </option>
              ))}
            </select>
          </div>
          <div className='field'>
            <label>Procedimento</label>
            <select name='procedure_id'>
              <option value=''>Selecione o procedimento</option>
              {(procedures as any[]).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className='field md:col-span-2'>
            <label>Descrição *</label>
            <input name='description' required placeholder='Descrição do item' />
          </div>
          <div className='field'>
            <label>Quantidade</label>
            <input name='quantity' type='number' min={1} defaultValue={1} required />
          </div>
          <div className='field'>
            <label>Valor unitário</label>
            <input name='unit_amount' required placeholder='0,00' />
          </div>
          <div>
            <SubmitButton label='Salvar item' />
          </div>
        </form>
      </div>

      <div className='card overflow-hidden'>
        <div className='overflow-x-auto'>
          {(budgetItems as any[]).length === 0 ? (
            <div className='px-6 py-12 text-center text-slate-400 text-sm'>
              Nenhum item de orçamento encontrado.
            </div>
          ) : (
            <table className='data-table'>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Descrição</th>
                  <th>Procedimento</th>
                  <th>Qtd.</th>
                  <th className='text-right'>Unitário</th>
                  <th className='text-right'>Total</th>
                </tr>
              </thead>
              <tbody>
                {(budgetItems as any[]).map(item => (
                  <tr key={item.id}>
                    <td className='font-medium'>{item.patient_name}</td>
                    <td>{item.description}</td>
                    <td>{item.procedure_name || '—'}</td>
                    <td>{item.quantity}</td>
                    <td className='text-right'>
                      {Number(item.unit_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className='text-right font-medium'>
                      {Number(item.line_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
