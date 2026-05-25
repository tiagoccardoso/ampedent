import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/neon'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'

async function save(fd: FormData) {
  'use server'
  try {
    const patient_id = String(fd.get('patient_id') || '')
    const tooth_code = String(fd.get('tooth_code') || '')
    if (!patient_id || !tooth_code) redirect('/admin/odontogram?error=Verifique+os+campos+obrigat%C3%B3rios')
    await sql`insert into odontogram_entries (patient_id,tooth_code,condition,planned_procedure,performed_procedure,notes) values (${patient_id}::uuid, ${tooth_code}, ${String(fd.get('condition') || '') || null}, ${String(fd.get('planned_procedure') || '') || null}, ${String(fd.get('performed_procedure') || '') || null}, ${String(fd.get('notes') || '') || null})`
    revalidatePath('/admin/odontogram')
    redirect('/admin/odontogram?ok=Odontograma+salvo+com+sucesso')
  } catch (e) {
    console.error('odontogram.save', e)
    redirect('/admin/odontogram?error=N%C3%A3o+foi+poss%C3%ADvel+salvar.+Verifique+os+dados+e+tente+novamente')
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>
}) {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  const [rows, pats] = await Promise.all([
    sql`select o.*, p.full_name patient_name from odontogram_entries o join patients p on p.id=o.patient_id order by o.created_at desc limit 100`,
    sql`select id, full_name from patients order by full_name`,
  ])

  const params = (await searchParams) ?? {}

  return (
    <section className='space-y-6'>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Odontograma</h1>
          <p className='page-subtitle'>Registro de condições e procedimentos por dente</p>
        </div>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      {/* Formulário */}
      <div className='form-panel'>
        <p className='form-section-title'>Nova entrada de odontograma</p>
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
            <label>Dente *</label>
            <input name='tooth_code' required placeholder='Ex: 11, 22, 36' />
          </div>
          <div className='field'>
            <label>Condição</label>
            <input name='condition' placeholder='Ex: Cárie, Restaurado, Ausente' />
          </div>
          <div className='field'>
            <label>Procedimento planejado</label>
            <input name='planned_procedure' placeholder='Ex: Restauração, Extração' />
          </div>
          <div className='field'>
            <label>Procedimento realizado</label>
            <input name='performed_procedure' placeholder='Ex: Restauração concluída' />
          </div>
          <div className='field'>
            <label>Observações</label>
            <textarea name='notes' rows={3} placeholder='Notas adicionais sobre o dente' />
          </div>
          <div className='md:col-span-2 flex justify-end'>
            <SubmitButton label='Salvar odontograma' />
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className='card overflow-hidden'>
        <div className='overflow-x-auto'>
          {(rows as any[]).length === 0 ? (
            <div className='px-6 py-12 text-center text-slate-400 text-sm'>
              Nenhuma entrada de odontograma registrada ainda.
            </div>
          ) : (
            <table className='data-table'>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Dente</th>
                  <th>Condição</th>
                  <th>Proc. planejado</th>
                  <th>Proc. realizado</th>
                </tr>
              </thead>
              <tbody>
                {(rows as any[]).map(r => (
                  <tr key={r.id}>
                    <td className='font-medium'>{r.patient_name}</td>
                    <td>{r.tooth_code}</td>
                    <td>{r.condition || '—'}</td>
                    <td>{r.planned_procedure || '—'}</td>
                    <td>{r.performed_procedure || '—'}</td>
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
