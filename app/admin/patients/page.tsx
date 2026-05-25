import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { sql } from '@/lib/neon'
import { revalidatePath } from 'next/cache'
import { patientStatus } from '@/lib/clinic'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'

async function savePatient(formData: FormData) {
  'use server'
  try {
    const full_name = String(formData.get('full_name') || '').trim()
    const phone = String(formData.get('phone') || '').trim()
    if (!full_name || !phone) redirect('/admin/patients?error=Verifique+os+campos+obrigat%C3%B3rios')
    await sql`
      insert into patients (full_name, phone, cpf, birth_date, email, address, guardian_name, notes, status)
      values (
        ${full_name}, ${phone},
        ${String(formData.get('cpf') || '') || null},
        ${String(formData.get('birth_date') || '') || null},
        ${String(formData.get('email') || '') || null},
        ${String(formData.get('address') || '') || null},
        ${String(formData.get('guardian_name') || '') || null},
        ${String(formData.get('notes') || '') || null},
        ${String(formData.get('status') || 'active')}::patient_status
      )`
    revalidatePath('/admin/patients')
    redirect('/admin/patients?ok=Paciente+cadastrado+com+sucesso')
  } catch (e) {
    console.error('patients.save', e)
    redirect('/admin/patients?error=N%C3%A3o+foi+poss%C3%ADvel+salvar.+Verifique+os+dados+e+tente+novamente')
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
  const patients = await sql`select * from patients order by created_at desc limit 100`

  return (
    <section className='space-y-6'>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Pacientes</h1>
          <p className='page-subtitle'>Cadastro e listagem de pacientes</p>
        </div>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      {/* Form */}
      <div className='form-panel'>
        <p className='form-section-title'>Novo paciente</p>
        <form action={savePatient} className='grid md:grid-cols-2 gap-3'>
          <div className='field'>
            <label>Nome completo *</label>
            <input name='full_name' placeholder='Nome completo' required />
          </div>
          <div className='field'>
            <label>Telefone *</label>
            <input name='phone' placeholder='(00) 00000-0000' required />
          </div>
          <div className='field'>
            <label>CPF</label>
            <input name='cpf' placeholder='000.000.000-00' />
          </div>
          <div className='field'>
            <label>Data de nascimento</label>
            <input name='birth_date' type='date' />
          </div>
          <div className='field'>
            <label>E-mail</label>
            <input name='email' type='email' placeholder='paciente@email.com' />
          </div>
          <div className='field'>
            <label>Responsável</label>
            <input name='guardian_name' placeholder='Nome do responsável' />
          </div>
          <div className='field md:col-span-2'>
            <label>Endereço</label>
            <input name='address' placeholder='Rua, número, bairro, cidade' />
          </div>
          <div className='field md:col-span-2'>
            <label>Observações</label>
            <textarea name='notes' rows={3} placeholder='Informações adicionais…' />
          </div>
          <div className='field'>
            <label>Status</label>
            <select name='status'>
              {patientStatus.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className='flex items-end'>
            <SubmitButton label='Cadastrar paciente' />
          </div>
        </form>
      </div>

      {/* Table */}
      <div className='card overflow-hidden'>
        <div className='overflow-x-auto'>
          {(patients as any[]).length === 0 ? (
            <div className='px-6 py-12 text-center text-slate-400 text-sm'>
              Nenhum paciente cadastrado ainda.
            </div>
          ) : (
            <table className='data-table'>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>CPF</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(patients as any[]).map(p => (
                  <tr key={p.id}>
                    <td className='font-medium'>{p.full_name}</td>
                    <td>{p.phone}</td>
                    <td>{p.cpf || '—'}</td>
                    <td>
                      <span className={`badge ${p.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                        {p.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
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
