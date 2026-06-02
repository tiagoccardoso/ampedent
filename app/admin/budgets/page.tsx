import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/neon'
import { budgetStatus } from '@/lib/clinic'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'
import { DeleteConfirmButton } from '../_components/delete-confirm-button'

const optional = (v: FormDataEntryValue | null) => String(v || '').trim() || null
const currency = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const budgetLabels: Record<string, string> = {
  draft: 'Rascunho',
  sent: 'Enviado',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  canceled: 'Cancelado',
}
const budgetBadge: Record<string, string> = {
  draft: 'bg-gray-50 text-gray-600 border-gray-200',
  sent: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
  canceled: 'bg-amber-50 text-amber-700 border-amber-200',
}

async function save(fd: FormData) {
  'use server'
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  const id = optional(fd.get('id'))
  const patient = optional(fd.get('patient_id'))
  let target = '/admin/budgets'
  try {
    if (!patient) {
      target += '?error=Informe+o+paciente'
    } else if (id) {
      const updated = await sql`
        update budgets
           set patient_id = ${patient}::uuid,
               status = ${String(fd.get('status') || 'draft')}::budget_status,
               notes = ${optional(fd.get('notes'))}
         where id = ${id}::uuid
         returning id
      `
      target += (updated as unknown[]).length ? '?ok=Or%C3%A7amento+atualizado+com+sucesso' : '?error=Or%C3%A7amento+n%C3%A3o+encontrado'
    } else {
      await sql`
        insert into budgets (patient_id, status, notes)
        values (${patient}::uuid, ${String(fd.get('status') || 'draft')}::budget_status, ${optional(fd.get('notes'))})
      `
      target += '?ok=Or%C3%A7amento+cadastrado+com+sucesso'
    }
  } catch (e) {
    console.error('budgets.save')
    target += '?error=N%C3%A3o+foi+poss%C3%ADvel+salvar+o+or%C3%A7amento'
  }
  revalidatePath('/admin/budgets')
  redirect(target)
}

async function remove(fd: FormData) {
  'use server'
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  let target = '/admin/budgets'
  try {
    const id = optional(fd.get('id'))
    const deleted = id ? await sql`delete from budgets where id = ${id}::uuid returning id` : []
    target += (deleted as unknown[]).length ? '?ok=Or%C3%A7amento+exclu%C3%ADdo+com+sucesso' : '?error=Or%C3%A7amento+n%C3%A3o+encontrado'
  } catch (e) {
    console.error('budgets.delete')
    target += '?error=N%C3%A3o+foi+poss%C3%ADvel+excluir+o+or%C3%A7amento'
  }
  revalidatePath('/admin/budgets')
  redirect(target)
}

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  const params = (await searchParams) ?? {}

  const [budgets, patients] = await Promise.all([
    sql`select b.*, p.full_name patient_name from budgets b join patients p on p.id = b.patient_id order by b.created_at desc limit 100`,
    sql`select id, full_name from patients order by full_name`,
  ])
  const pats = patients as any[]

  return (
    <section className='space-y-8'>
      <div>
        <p className='text-xs font-bold tracking-[0.1em] uppercase mb-1 text-[#30628a]' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Gestão</p>
        <h1 className='text-2xl font-extrabold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>Orçamentos</h1>
        <p className='text-sm text-[#70787c] mt-1'>Controle de orçamentos e propostas de tratamento por paciente.</p>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
        <div className='px-6 py-4 border-b border-[#f2f4f5] flex items-center gap-3'>
          <span className='text-xl'>💰</span>
          <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>Novo orçamento</h2>
        </div>
        <form action={save} className='px-6 py-6 grid gap-x-5 gap-y-4 md:grid-cols-2'>
          <div>
            <label htmlFor='bud_patient'>Paciente *</label>
            <select id='bud_patient' name='patient_id' required>
              <option value=''>Selecione o paciente</option>
              {pats.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor='bud_status'>Status</label>
            <select id='bud_status' name='status'>
              {budgetStatus.map(s => <option key={s} value={s}>{budgetLabels[s] ?? s}</option>)}
            </select>
          </div>
          <div className='md:col-span-2'><label htmlFor='bud_notes'>Observações</label><textarea id='bud_notes' name='notes' rows={2} placeholder='Observações sobre o orçamento…' /></div>
          <div className='md:col-span-2 flex justify-end'><SubmitButton label='✓ Cadastrar orçamento' /></div>
        </form>
      </div>

      <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
        <div className='px-6 py-4 border-b border-[#f2f4f5]'>
          <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>
            Orçamentos <span className='ml-2 text-sm font-normal text-[#70787c]'>({(budgets as any[]).length})</span>
          </h2>
        </div>
        {(budgets as any[]).length === 0 ? (
          <div className='px-6 py-16 text-center'><div className='text-4xl mb-3'>💰</div><p className='text-[#70787c] text-sm'>Nenhum orçamento cadastrado.</p></div>
        ) : (
          <div className='admin-table-wrap rounded-none border-0'>
            <table className='admin-table' style={{ minWidth: 600 }}>
              <thead><tr>{['Paciente', 'Status', 'Total', 'Data', 'Ações'].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {(budgets as any[]).map(b => (
                  <tr key={b.id}>
                    <td className='font-semibold text-[#003441]'>{b.patient_name}</td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${budgetBadge[b.status] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {budgetLabels[b.status] ?? b.status}
                      </span>
                    </td>
                    <td className='font-semibold'>{currency(Number(b.total_amount || 0))}</td>
                    <td className='whitespace-nowrap'>{new Date(b.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className='space-y-2'>
                      <details className='rounded-lg border border-[#e6e8e9]'>
                        <summary className='cursor-pointer px-3 py-1.5 text-xs font-semibold text-[#30628a] hover:text-[#003441]'>✏️ Editar</summary>
                        <form action={save} className='p-3 grid gap-3 md:grid-cols-2 border-t border-[#f2f4f5]'>
                          <input type='hidden' name='id' value={b.id} />
                          <div><label>Paciente</label><select name='patient_id' defaultValue={b.patient_id}>{pats.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}</select></div>
                          <div><label>Status</label><select name='status' defaultValue={b.status}>{budgetStatus.map(s => <option key={s} value={s}>{budgetLabels[s] ?? s}</option>)}</select></div>
                          <div className='md:col-span-2'><label>Observações</label><textarea name='notes' defaultValue={b.notes || ''} rows={2} /></div>
                          <div className='md:col-span-2 flex justify-end'><SubmitButton label='Atualizar' variant='secondary' /></div>
                        </form>
                      </details>
                      <form action={remove}><input type='hidden' name='id' value={b.id} /><DeleteConfirmButton message={`Excluir o orçamento de ${b.patient_name}?`} /></form>
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
