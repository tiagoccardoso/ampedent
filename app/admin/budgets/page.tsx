import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/neon'
import { budgetStatus } from '@/lib/clinic'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'

const parseMoney = (v: string) => Number(v.replace(/\./g, '').replace(',', '.')) || 0

async function saveBudget(fd: FormData) {
  'use server'
  try {
    const patient_id = String(fd.get('patient_id') || '')
    if (!patient_id) redirect('/admin/budgets?error=Verifique+os+campos+obrigat%C3%B3rios')
    await sql`insert into budgets (patient_id,status,notes,total_amount) values (${patient_id}::uuid, ${String(fd.get('status') || 'draft')}::budget_status, ${String(fd.get('notes') || '') || null}, ${parseMoney(String(fd.get('total_amount') || '0'))})`
    revalidatePath('/admin/budgets')
    redirect('/admin/budgets?ok=Or%C3%A7amento+salvo+com+sucesso')
  } catch (e) {
    console.error('budgets.save', e)
    redirect('/admin/budgets?error=N%C3%A3o+foi+poss%C3%ADvel+salvar.+Verifique+os+dados+e+tente+novamente')
  }
}

async function saveItem(fd: FormData) {
  'use server'
  try {
    const budget_id = String(fd.get('budget_id') || '')
    const description = String(fd.get('description') || '').trim()
    if (!budget_id || !description) redirect('/admin/budgets?error=Verifique+os+campos+obrigat%C3%B3rios')
    await sql`insert into budget_items (budget_id, procedure_id, description, quantity, unit_amount) values (${budget_id}::uuid, ${String(fd.get('procedure_id') || '') || null}::uuid, ${description}, ${Number(fd.get('quantity') || 1)}, ${parseMoney(String(fd.get('unit_amount') || '0'))})`
    revalidatePath('/admin/budgets')
    redirect('/admin/budgets?ok=Item+de+or%C3%A7amento+salvo+com+sucesso')
  } catch (e) {
    console.error('budgets.saveItem', e)
    redirect('/admin/budgets?error=N%C3%A3o+foi+poss%C3%ADvel+salvar.+Verifique+os+dados+e+tente+novamente')
  }
}

const budgetStatusLabel: Record<string, string> = {
  draft: 'Rascunho',
  sent: 'Enviado',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  canceled: 'Cancelado',
}

const budgetStatusBadge: Record<string, string> = {
  draft: 'badge-inactive',
  sent: 'badge-scheduled',
  approved: 'badge-completed',
  rejected: 'badge-canceled',
  canceled: 'badge-canceled',
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>
}) {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  const [budgets, items, pats, procs] = await Promise.all([
    sql`select b.*, p.full_name patient_name from budgets b join patients p on p.id=b.patient_id order by b.created_at desc limit 100`,
    sql`select bi.*, pr.name procedure_name from budget_items bi left join procedures pr on pr.id=bi.procedure_id order by bi.created_at desc limit 100`,
    sql`select id, full_name from patients order by full_name`,
    sql`select id, name from procedures where is_active=true order by name`,
  ])

  const params = (await searchParams) ?? {}

  return (
    <section className='space-y-6'>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Orçamentos</h1>
          <p className='page-subtitle'>Criação e acompanhamento de orçamentos</p>
        </div>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      {/* Formulário — novo orçamento */}
      <div className='form-panel'>
        <p className='form-section-title'>Novo orçamento</p>
        <form action={saveBudget} className='grid md:grid-cols-2 gap-3'>
          <div className='field'>
            <label>Paciente *</label>
            <select name='patient_id' required>
              <option value=''>Selecione o paciente</option>
              {(pats as any[]).map(p => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </div>
          <div className='field'>
            <label>Status</label>
            <select name='status'>
              {budgetStatus.map(s => (
                <option key={s} value={s}>{budgetStatusLabel[s] ?? s}</option>
              ))}
            </select>
          </div>
          <div className='field'>
            <label>Valor total *</label>
            <input name='total_amount' required placeholder='Ex: 950,00' />
          </div>
          <div className='field'>
            <label>Observações</label>
            <textarea name='notes' rows={3} placeholder='Observações sobre o orçamento' />
          </div>
          <div className='md:col-span-2 flex justify-end'>
            <SubmitButton label='Salvar orçamento' />
          </div>
        </form>
      </div>

      {/* Formulário — novo item de orçamento */}
      <div className='form-panel'>
        <p className='form-section-title'>Adicionar item ao orçamento</p>
        <form action={saveItem} className='grid md:grid-cols-2 gap-3'>
          <div className='field'>
            <label>Orçamento *</label>
            <select name='budget_id' required>
              <option value=''>Selecione o orçamento</option>
              {(budgets as any[]).map(b => (
                <option key={b.id} value={b.id}>
                  {b.id.slice(0, 8)} — {b.patient_name}
                </option>
              ))}
            </select>
          </div>
          <div className='field'>
            <label>Procedimento</label>
            <select name='procedure_id'>
              <option value=''>Selecione (opcional)</option>
              {(procs as any[]).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className='field'>
            <label>Descrição *</label>
            <input name='description' required placeholder='Descrição do item' />
          </div>
          <div className='field'>
            <label>Quantidade</label>
            <input name='quantity' type='number' defaultValue={1} min={1} />
          </div>
          <div className='field'>
            <label>Valor unitário *</label>
            <input name='unit_amount' required placeholder='Ex: 100,00' />
          </div>
          <div className='flex items-end'>
            <SubmitButton label='Salvar item' />
          </div>
        </form>
      </div>

      {/* Tabela de orçamentos */}
      <div className='card overflow-hidden'>
        <div className='overflow-x-auto'>
          {(budgets as any[]).length === 0 ? (
            <div className='px-6 py-12 text-center text-slate-400 text-sm'>
              Nenhum orçamento cadastrado ainda.
            </div>
          ) : (
            <table className='data-table'>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Paciente</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(budgets as any[]).map(b => (
                  <tr key={b.id}>
                    <td className='font-mono text-xs text-slate-400'>{b.id.slice(0, 8)}</td>
                    <td className='font-medium'>{b.patient_name}</td>
                    <td>
                      <span className={`badge ${budgetStatusBadge[b.status] ?? 'badge-inactive'}`}>
                        {budgetStatusLabel[b.status] ?? b.status}
                      </span>
                    </td>
                    <td>
                      {Number(b.total_amount).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Tabela de itens */}
      {(items as any[]).length > 0 && (
        <div className='card overflow-hidden'>
          <div className='px-4 py-3 border-b border-slate-100'>
            <p className='form-section-title mb-0'>Itens de orçamento</p>
          </div>
          <div className='overflow-x-auto'>
            <table className='data-table'>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Procedimento</th>
                  <th>Qtd</th>
                  <th>Valor unit.</th>
                </tr>
              </thead>
              <tbody>
                {(items as any[]).map(i => (
                  <tr key={i.id}>
                    <td className='font-medium'>{i.description}</td>
                    <td>{i.procedure_name || '—'}</td>
                    <td>{i.quantity}</td>
                    <td>
                      {Number(i.unit_amount).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
