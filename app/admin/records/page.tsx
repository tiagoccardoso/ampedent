import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/neon'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'
import { DeleteConfirmButton } from '../_components/delete-confirm-button'

const optional = (v: FormDataEntryValue | null) => String(v || '').trim() || null

async function save(fd: FormData) {
  'use server'
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  if (!['superadmin', 'admin', 'dentist'].includes(admin.role)) redirect('/admin/dashboard')
  const id = optional(fd.get('id'))
  const patient = optional(fd.get('patient_id'))
  let target = '/admin/records'
  try {
    if (!patient) {
      target += '?error=Informe+o+paciente'
    } else if (id) {
      const updated = await sql`
        update medical_records
           set patient_id = ${patient}::uuid,
               professional_id = ${optional(fd.get('professional_id'))}::uuid,
               anamnesis = ${optional(fd.get('anamnesis'))},
               evolution = ${optional(fd.get('evolution'))},
               performed_procedures = ${optional(fd.get('performed_procedures'))},
               dentist_notes = ${optional(fd.get('dentist_notes'))},
               attachment_url = ${optional(fd.get('attachment_url'))}
         where id = ${id}::uuid
         returning id
      `
      target += (updated as unknown[]).length ? '?ok=Prontu%C3%A1rio+atualizado+com+sucesso' : '?error=Prontu%C3%A1rio+n%C3%A3o+encontrado'
    } else {
      await sql`
        insert into medical_records (patient_id, professional_id, anamnesis, evolution, performed_procedures, dentist_notes, attachment_url)
        values (${patient}::uuid, ${optional(fd.get('professional_id'))}::uuid, ${optional(fd.get('anamnesis'))}, ${optional(fd.get('evolution'))}, ${optional(fd.get('performed_procedures'))}, ${optional(fd.get('dentist_notes'))}, ${optional(fd.get('attachment_url'))})
      `
      target += '?ok=Prontu%C3%A1rio+cadastrado+com+sucesso'
    }
  } catch (e) {
    console.error('records.save')
    target += '?error=N%C3%A3o+foi+poss%C3%ADvel+salvar+o+prontu%C3%A1rio'
  }
  revalidatePath('/admin/records')
  redirect(target)
}

async function remove(fd: FormData) {
  'use server'
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  if (!['superadmin', 'admin', 'dentist'].includes(admin.role)) redirect('/admin/dashboard')
  let target = '/admin/records'
  try {
    const id = optional(fd.get('id'))
    const deleted = id ? await sql`delete from medical_records where id = ${id}::uuid returning id` : []
    target += (deleted as unknown[]).length ? '?ok=Prontu%C3%A1rio+exclu%C3%ADdo+com+sucesso' : '?error=Prontu%C3%A1rio+n%C3%A3o+encontrado'
  } catch (e) {
    console.error('records.delete')
    target += '?error=N%C3%A3o+foi+poss%C3%ADvel+excluir+o+prontu%C3%A1rio'
  }
  revalidatePath('/admin/records')
  redirect(target)
}

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  if (!['superadmin', 'admin', 'dentist'].includes(admin.role)) redirect('/admin/dashboard')
  const params = (await searchParams) ?? {}

  const [rows, pats, pros] = await Promise.all([
    sql`select mr.*, p.full_name patient_name, pr.full_name professional_name from medical_records mr join patients p on p.id = mr.patient_id left join professionals pr on pr.id = mr.professional_id order by mr.created_at desc limit 100`,
    sql`select id, full_name from patients order by full_name`,
    sql`select id, full_name from professionals where is_active = true order by full_name`,
  ])
  const patients = pats as any[]
  const professionals = pros as any[]

  return (
    <section className='space-y-8'>
      <div>
        <p className='text-xs font-bold tracking-[0.1em] uppercase mb-1 text-[#30628a]' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Clínica</p>
        <h1 className='text-2xl font-extrabold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>Prontuários</h1>
        <p className='text-sm text-[#70787c] mt-1'>Registros clínicos dos pacientes com histórico de evolução e procedimentos.</p>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
        <div className='px-6 py-4 border-b border-[#f2f4f5] flex items-center gap-3'>
          <span className='text-xl'>📄</span>
          <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>Novo prontuário</h2>
        </div>
        <form action={save} className='px-6 py-6 grid gap-x-5 gap-y-4 md:grid-cols-2'>
          <div>
            <label htmlFor='rec_patient'>Paciente *</label>
            <select id='rec_patient' name='patient_id' required>
              <option value=''>Selecione o paciente</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor='rec_prof'>Profissional responsável</label>
            <select id='rec_prof' name='professional_id'>
              <option value=''>Selecione o profissional</option>
              {professionals.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </div>
          <div className='md:col-span-2'><label htmlFor='rec_anamnesis'>Anamnese</label><textarea id='rec_anamnesis' name='anamnesis' rows={3} placeholder='Histórico de saúde, queixas e informações gerais do paciente…' /></div>
          <div className='md:col-span-2'><label htmlFor='rec_evolution'>Evolução clínica</label><textarea id='rec_evolution' name='evolution' rows={3} placeholder='Evolução do tratamento e observações da consulta…' /></div>
          <div><label htmlFor='rec_procs'>Procedimentos realizados</label><textarea id='rec_procs' name='performed_procedures' rows={2} placeholder='Procedimentos executados nesta visita…' /></div>
          <div><label htmlFor='rec_notes'>Notas do dentista</label><textarea id='rec_notes' name='dentist_notes' rows={2} placeholder='Observações internas…' /></div>
          <div className='md:col-span-2'><label htmlFor='rec_attachment'>URL do anexo</label><input id='rec_attachment' name='attachment_url' placeholder='https://…' /></div>
          <div className='md:col-span-2 flex justify-end'><SubmitButton label='✓ Cadastrar prontuário' /></div>
        </form>
      </div>

      <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
        <div className='px-6 py-4 border-b border-[#f2f4f5]'>
          <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>
            Prontuários cadastrados <span className='ml-2 text-sm font-normal text-[#70787c]'>({(rows as any[]).length})</span>
          </h2>
        </div>
        {(rows as any[]).length === 0 ? (
          <div className='px-6 py-16 text-center'><div className='text-4xl mb-3'>📄</div><p className='text-[#70787c] text-sm'>Nenhum prontuário registrado.</p></div>
        ) : (
          <div className='admin-table-wrap rounded-none border-0'>
            <table className='admin-table' style={{ minWidth: 700 }}>
              <thead><tr>{['Paciente', 'Profissional', 'Evolução', 'Data', 'Ações'].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {(rows as any[]).map(r => (
                  <tr key={r.id}>
                    <td className='font-semibold text-[#003441]'>{r.patient_name}</td>
                    <td>{r.professional_name || '—'}</td>
                    <td style={{ maxWidth: 280 }}><p className='text-sm text-[#40484b]' style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.evolution || '—'}</p></td>
                    <td className='whitespace-nowrap'>{new Date(r.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className='space-y-2'>
                      <details className='rounded-lg border border-[#e6e8e9]'>
                        <summary className='cursor-pointer px-3 py-1.5 text-xs font-semibold text-[#30628a] hover:text-[#003441]'>✏️ Editar</summary>
                        <form action={save} className='p-3 grid gap-3 md:grid-cols-2 border-t border-[#f2f4f5]'>
                          <input type='hidden' name='id' value={r.id} />
                          <div><label>Paciente</label><select name='patient_id' defaultValue={r.patient_id}>{patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}</select></div>
                          <div><label>Profissional</label><select name='professional_id' defaultValue={r.professional_id || ''}><option value=''>—</option>{professionals.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}</select></div>
                          <div className='md:col-span-2'><label>Anamnese</label><textarea name='anamnesis' defaultValue={r.anamnesis || ''} rows={2} /></div>
                          <div className='md:col-span-2'><label>Evolução</label><textarea name='evolution' defaultValue={r.evolution || ''} rows={2} /></div>
                          <div><label>Procedimentos realizados</label><textarea name='performed_procedures' defaultValue={r.performed_procedures || ''} rows={2} /></div>
                          <div><label>Notas do dentista</label><textarea name='dentist_notes' defaultValue={r.dentist_notes || ''} rows={2} /></div>
                          <div className='md:col-span-2'><label>URL do anexo</label><input name='attachment_url' defaultValue={r.attachment_url || ''} /></div>
                          <div className='md:col-span-2 flex justify-end'><SubmitButton label='Atualizar' variant='secondary' /></div>
                        </form>
                      </details>
                      <form action={remove}><input type='hidden' name='id' value={r.id} /><DeleteConfirmButton message={`Excluir o prontuário de ${r.patient_name}?`} /></form>
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
