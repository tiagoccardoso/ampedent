import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/neon'
import { financeStatus } from '@/lib/clinic'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'

const parseMoney = (v: string) => Number(v.replace(/\./g, '').replace(',', '.')) || 0

async function save(fd: FormData) {
  'use server'
  try {
    const patient_id = String(fd.get('patient_id') || '')
    const description = String(fd.get('description') || '').trim()
    if (!patient_id || !description)
      redirect('/admin/financial?error=Verifique+os+campos+obrigat%C3%B3rios')
    await sql`
      insert into financial_entries (patient_id, budget_id, description, payment_method, due_date, amount, status)
      values (
        ${patient_id}::uuid,
        ${String(fd.get('budget_id') || '') || null}::uuid,
        ${description},
        ${String(fd.get('payment_method') || '') || null},
        ${String(fd.get('due_date') || '') || null},
        ${parseMoney(String(fd.get('amount') || '0'))},
        ${String(fd.get('status') || 'pending')}::finance_status
      )`
    revalidatePath('/admin/financial')
    redirect('/admin/financial?ok=Registro+financeiro+salvo+com+sucesso')
  } catch (e) {
    console.error('financial.save', e)
    redirect('/admin/financial?error=N%C3%A3o+foi+poss%C3%ADvel+salvar.+Verifique+os+dados+e+tente+novamente')
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
  const [rows, pats, budgets] = await Promise.all([
    sql`
      select fe.*, p.full_name patient_name
      from financial_entries fe
      join patients p on p.id = fe.patient_id
      order by fe.created_at desc
      limit 100`,
    sql`select id, full_name from patients order by full_name`,
    sql`select id from budgets order by created_at desc limit 100`,
  ])

  return (
    <section className='space-y-6'>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Financeiro</h1>
          <p className='page-subtitle'>Lançamentos e controle financeiro</p>
        </div>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      {/* Form */}
      <div className='form-panel'>
        <p className='form-section-title'>Novo lançamento</p>
        <form action={save} className='grid md:grid-cols-2 gap-3'>
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
            <label>Orçamento</label>
            <select name='budget_id'>
              <option value=''>Selecione o orçamento</option>
              {(budgets as any[]).map(b => (
                <option key={b.id} value={b.id}>{b.id.slice(0, 8)}</option>
              ))}
            </select>
          </div>
          <div className='field md:col-span-2'>
            <label>Descrição *</label>
            <input name='description' required placeholder='Descrição do lançamento' />
          </div>
          <div className='field'>
            <label>Forma de pagamento</label>
            <input name='payment_method' placeholder='Ex: Cartão, Pix, Dinheiro' />
          </div>
          <div className='field'>
            <label>Vencimento</label>
            <input name='due_date' type='date' />
          </div>
          <div className='field'>
            <label>Valor</label>
            <input name='amount' required placeholder='0,00' />
          </div>
          <div className='field'>
            <label>Status</label>
            <select name='status'>
              {financeStatus.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className='flex items-end'>
            <SubmitButton label='Salvar lançamento' />
          </div>
        </form>
      </div>

      {/* Table */}
      <div className='card overflow-hidden'>
        <div className='overflow-x-auto'>
          {(rows as any[]).length === 0 ? (
            <div className='px-6 py-12 text-center text-slate-400 text-sm'>
              Nenhum lançamento encontrado.
            </div>
          ) : (
            <table className='data-table'>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Descrição</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                  <th className='text-right'>Valor</th>
                </tr>
              </thead>
              <tbody>
                {(rows as any[]).map(r => (
                  <tr key={r.id}>
                    <td className='font-medium'>{r.patient_name}</td>
                    <td>{r.description}</td>
                    <td>{r.due_date ? new Date(r.due_date).toLocaleDateString('pt-BR') : '—'}</td>
                    <td>
                      <span className={`badge ${
                        r.status === 'paid'    ? 'badge-completed' :
                        r.status === 'pending' ? 'badge-pending'   : 'badge-canceled'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className='text-right font-medium'>
                      {Number(r.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
