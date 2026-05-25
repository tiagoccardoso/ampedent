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
    if (!patient_id) redirect('/admin/records?error=Verifique+os+campos+obrigat%C3%B3rios')
    await sql`
      insert into medical_records (
        patient_id, professional_id, anamnesis, evolution,
        performed_procedures, dentist_notes, attachment_url
      )
      values (
        ${patient_id}::uuid,
        ${String(fd.get('professional_id') || '') || null}::uuid,
        ${String(fd.get('anamnesis') || '') || null},
        ${String(fd.get('evolution') || '') || null},
        ${String(fd.get('performed_procedures') || '') || null},
        ${String(fd.get('dentist_notes') || '') || null},
        ${String(fd.get('attachment_url') || '') || null}
      )`
    revalidatePath('/admin/records')
    redirect('/admin/records?ok=Prontu%C3%A1rio+salvo+com+sucesso')
  } catch (e) {
    console.error('records.save', e)
    redirect('/admin/records?error=N%C3%A3o+foi+poss%C3%ADvel+salvar.+Verifique+os+dados+e+tente+novamente')
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>
}) {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  const [rows, pats, pros] = await Promise.all([
    sql`
      select mr.*, p.full_name patient_name
      from medical_records mr
      join patients p on p.id = mr.patient_id
      order by mr.created_at desc limit 100`,
    sql`select id, full_name from patients order by full_name`,
    sql`select id, full_name from professionals where is_active = true order by full_name`,
  ])

  const params = (await searchParams) ?? {}

  return (
    <section className='space-y-6'>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Prontuários</h1>
          <p className='page-subtitle'>Registros clínicos e evoluções dos pacientes</p>
        </div>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      {/* Formulário */}
      <div className='form-panel'>
        <p className='form-section-title'>Novo prontuário</p>
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
            <label>Profissional</label>
            <select name='professional_id'>
              <option value=''>Selecione o profissional</option>
              {(pros as any[]).map(p => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </div>
          <div className='field'>
            <label>Anamnese</label>
            <textarea name='anamnesis' rows={3} placeholder='Histórico e queixas do paciente' />
          </div>
          <div className='field'>
            <label>Evolução</label>
            <textarea name='evolution' rows={3} placeholder='Evolução clínica' />
          </div>
          <div className='field'>
            <label>Procedimentos realizados</label>
            <textarea name='performed_procedures' rows={3} placeholder='Liste os procedimentos realizados' />
          </div>
          <div className='field'>
            <label>Notas do dentista</label>
            <textarea name='dentist_notes' rows={3} placeholder='Observações internas' />
          </div>
          <div className='field md:col-span-2'>
            <label>Link do anexo</label>
            <input name='attachment_url' placeholder='https://…' />
          </div>
          <div className='md:col-span-2 flex justify-end'>
            <SubmitButton label='Salvar prontuário' />
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className='card overflow-hidden'>
        <div className='overflow-x-auto'>
          {(rows as any[]).length === 0 ? (
            <div className='px-6 py-12 text-center text-slate-400 text-sm'>
              Nenhum prontuário registrado ainda.
            </div>
          ) : (
            <table className='data-table'>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Anamnese</th>
                  <th>Evolução</th>
                </tr>
              </thead>
              <tbody>
                {(rows as any[]).map(r => (
                  <tr key={r.id}>
                    <td className='font-medium'>{r.patient_name}</td>
                    <td className='max-w-xs truncate'>{r.anamnesis || '—'}</td>
                    <td className='max-w-xs truncate'>{r.evolution || '—'}</td>
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
