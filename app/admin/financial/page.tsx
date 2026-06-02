import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/neon'
import { financeStatus } from '@/lib/clinic'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'
import { DeleteConfirmButton } from '../_components/delete-confirm-button'

const parseMoney = (v: string) => Number(v.replace(/\./g, '').replace(',', '.')) || 0
const optional = (v: FormDataEntryValue | null) => String(v || '').trim() || null
const currency = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const financeLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  overdue: 'Vencido',
  canceled: 'Cancelado',
}
const financeBadge: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  overdue: 'bg-red-50 text-red-600 border-red-200',
  canceled: 'bg-gray-50 text-gray-500 border-gray-200',
}

async function save(fd: FormData) {
  'use server'
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  if (!['superadmin', 'admin', 'financial'].includes(admin.role)) redirect('/admin/dashboard')
  const id = optional(fd.get('id'))
  const patient = optional(fd.get('patient_id'))
  const desc = optional(fd.get('description'))
  let target = '/admin/financial'
  try {
    if (!patient || !desc) {
      target += '?error=Informe+paciente+e+descri%C3%A7%C3%A3o'
    } else if (id) {
      const updated = await sql`
        update financial_entries
           set patient_id = ${patient}::uuid,
               budget_id = ${optional(fd.get('budget_id'))}::uuid,
               description = ${desc},
               payment_method = ${optional(fd.get('payment_method'))},
               due_date = ${optional(fd.get('due_date'))},
               amount = ${parseMoney(String(fd.get('amount') || '0'))},
               status = ${String(fd.get('status') || 'pending')}::finance_status
         where id = ${id}::uuid
         returning id
      `
      target += (updated as unknown[]).length ? '?ok=Registro+financeiro+atualizado+com+sucesso' : '?error=Registro+n%C3%A3o+encontrado'
    } else {
      await sql`
        insert into financial_entries (patient_id, budget_id, description, payment_method, due_date, amount, status)
        values (${patient}::uuid, ${optional(fd.get('budget_id'))}::uuid, ${desc}, ${optional(fd.get('payment_method'))}, ${optional(fd.get('due_date'))}, ${parseMoney(String(fd.get('amount') || '0'))}, ${String(fd.get('status') || 'pending')}::finance_status)
      `
      target += '?ok=Registro+financeiro+cadastrado+com+sucesso'
    }
  } catch (e) {
    console.error('financial.save')
    target += '?error=N%C3%A3o+foi+poss%C3%ADvel+salvar+o+registro'
  }
  revalidatePath('/admin/financial')
  redirect(target)
}

async function remove(fd: FormData) {
  'use server'
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  if (!['superadmin', 'admin', 'financial'].includes(admin.role)) redirect('/admin/dashboard')
  let target = '/admin/financial'
  try {
    const id = optional(fd.get('id'))
    const deleted = id ? await sql`delete from financial_entries where id = ${id}::uuid returning id` : []
    target += (deleted as unknown[]).length ? '?ok=Registro+financeiro+exclu%C3%ADdo+com+sucesso' : '?error=Registro+n%C3%A3o+encontrado'
  } catch (e) {
    console.error('financial.delete')
    target += '?error=N%C3%A3o+foi+poss%C3%ADvel+excluir+o+registro'
  }
  revalidatePath('/admin/financial')
  redirect(target)
}

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  if (!['superadmin', 'admin', 'financial'].includes(admin.role)) redirect('/admin/dashboard')
  const params = (await searchParams) ?? {}

  const [rows, pats, budgets] = await Promise.all([
    sql`select fe.*, p.full_name patient_name from financial_entries fe join patients p on p.id = fe.patient_id order by fe.created_at desc limit 100`,
    sql`select id, full_name from patients order by full_name`,
    sql`select id from budgets order by created_at desc limit 100`,
  ])
  const patients = pats as any[]
  const bs = budgets as any[]

  return (
    <section className='space-y-8'>
      <div>
        <p className='text-xs font-bold tracking-[0.1em] uppercase mb-1 text-[#30628a]' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Gestão</p>
        <h1 className='text-2xl font-extrabold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>Financeiro</h1>
        <p className='text-sm text-[#70787c] mt-1'>Lançamentos financeiros vinculados a pacientes e orçamentos.</p>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
        <div className='px-6 py-4 border-b border-[#f2f4f5] flex items-center gap-3'>
          <span className='text-xl'>➕</span>
          <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>Novo lançamento</h2>
        </div>
        <form action={save} className='px-6 py-6 grid gap-x-5 gap-y-4 md:grid-cols-2'>
          <div>
            <label htmlFor='fin_patient'>Paciente *</label>
            <select id='fin_patient' name='patient_id' required>
              <option value=''>Selecione o paciente</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor='fin_budget'>Orçamento vinculado</label>
            <select id='fin_budget' name='budget_id'>
              <option value=''>Sem vínculo com orçamento</option>
              {bs.map(b => <option key={b.id} value={b.id}>{b.id.slice(0, 8)}</option>)}
            </select>
          </div>
          <div className='md:col-span-2'>
            <label htmlFor='fin_desc'>Descrição *</label>
            <input id='fin_desc' name='description' required placeholder='Ex.: Consulta de avaliação, Restauração dente 16' />
          </div>
          <div>
            <label htmlFor='fin_method'>Forma de pagamento</label>
            <input id='fin_method' name='payment_method' placeholder='Ex.: Dinheiro, Cartão, PIX' />
          </div>
          <div>
            <label htmlFor='fin_date'>Data de vencimento</label>
            <input id='fin_date' name='due_date' type='date' />
          </div>
          <div>
            <label htmlFor='fin_amount'>Valor (R$) *</label>
            <input id='fin_amount' name='amount' required placeholder='Ex.: 150,00' />
          </div>
          <div>
            <label htmlFor='fin_status'>Status</label>
            <select id='fin_status' name='status'>
              {financeStatus.map(s => <option key={s} value={s}>{financeLabels[s] ?? s}</option>)}
            </select>
          </div>
          <div className='md:col-span-2 flex justify-end'>
            <SubmitButton label='✓ Cadastrar lançamento' />
          </div>
        </form>
      </div>

      <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
        <div className='px-6 py-4 border-b border-[#f2f4f5]'>
          <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>
            Lançamentos <span className='ml-2 text-sm font-normal text-[#70787c]'>({(rows as any[]).length})</span>
          </h2>
        </div>
        {(rows as any[]).length === 0 ? (
          <div className='px-6 py-16 text-center'><div className='text-4xl mb-3'>💳</div><p className='text-[#70787c] text-sm'>Nenhum lançamento financeiro registrado.</p></div>
        ) : (
          <div className='admin-table-wrap rounded-none border-0'>
            <table className='admin-table' style={{ minWidth: 760 }}>
              <thead><tr>{['Paciente', 'Descrição', 'Valor', 'Vencimento', 'Status', 'Ações'].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {(rows as any[]).map(r => (
                  <tr key={r.id}>
                    <td className='font-semibold text-[#003441]'>{r.patient_name}</td>
                    <td>{r.description}</td>
                    <td className='font-semibold'>{currency(Number(r.amount))}</td>
                    <td>{r.due_date ? new Date(r.due_date + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${financeBadge[r.status] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {financeLabels[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className='space-y-2'>
                      <details className='rounded-lg border border-[#e6e8e9]'>
                        <summary className='cursor-pointer px-3 py-1.5 text-xs font-semibold text-[#30628a] hover:text-[#003441]'>✏️ Editar</summary>
                        <form action={save} className='p-3 grid gap-3 md:grid-cols-2 border-t border-[#f2f4f5]'>
                          <input type='hidden' name='id' value={r.id} />
                          <div><label>Paciente</label><select name='patient_id' defaultValue={r.patient_id}>{patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}</select></div>
                          <div><label>Orçamento</label><select name='budget_id' defaultValue={r.budget_id || ''}><option value=''>Sem vínculo</option>{bs.map(b => <option key={b.id} value={b.id}>{b.id.slice(0, 8)}</option>)}</select></div>
                          <div className='md:col-span-2'><label>Descrição</label><input name='description' defaultValue={r.description} /></div>
                          <div><label>Forma de pagamento</label><input name='payment_method' defaultValue={r.payment_method || ''} /></div>
                          <div><label>Vencimento</label><input name='due_date' type='date' defaultValue={r.due_date || ''} /></div>
                          <div><label>Valor</label><input name='amount' defaultValue={String(r.amount).replace('.', ',')} /></div>
                          <div><label>Status</label><select name='status' defaultValue={r.status}>{financeStatus.map(s => <option key={s} value={s}>{financeLabels[s] ?? s}</option>)}</select></div>
                          <div className='md:col-span-2 flex justify-end'><SubmitButton label='Atualizar' variant='secondary' /></div>
                        </form>
                      </details>
                      <form action={remove}><input type='hidden' name='id' value={r.id} /><DeleteConfirmButton message={`Excluir o lançamento "${r.description}"?`} /></form>
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
