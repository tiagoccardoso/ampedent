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
    if (!full_name || !phone)
      redirect('/admin/patients?error=Verifique+os+campos+obrigatórios')
    await sql`
      INSERT INTO patients (full_name, phone, cpf, birth_date, email, address, guardian_name, notes, status)
      VALUES (
        ${full_name}, ${phone},
        ${String(formData.get('cpf') || '') || null},
        ${String(formData.get('birth_date') || '') || null},
        ${String(formData.get('email') || '') || null},
        ${String(formData.get('address') || '') || null},
        ${String(formData.get('guardian_name') || '') || null},
        ${String(formData.get('notes') || '') || null},
        ${String(formData.get('status') || 'active')}::patient_status
      )
    `
    revalidatePath('/admin/patients')
    redirect('/admin/patients?ok=Paciente+cadastrado+com+sucesso')
  } catch (e) {
    console.error('patients.save', e)
    redirect(
      '/admin/patients?error=Não+foi+possível+salvar.+Verifique+os+dados+e+tente+novamente',
    )
  }
}

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
}
const statusClass: Record<string, string> = {
  active: 'badge badge-success',
  inactive: 'badge badge-neutral',
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>
}) {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  const params = (await searchParams) ?? {}
  const patients = await sql`SELECT * FROM patients ORDER BY created_at DESC LIMIT 100`

  return (
    <section className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Pacientes</h1>
        <p className='text-sm text-gray-500 mt-1'>Cadastro e gestão de pacientes da clínica.</p>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      {/* Form */}
      <div className='admin-card'>
        <h2 className='text-base font-semibold text-gray-900 mb-4'>Novo paciente</h2>
        <form action={savePatient} className='grid md:grid-cols-2 gap-4'>
          <div>
            <label htmlFor='full_name'>Nome completo *</label>
            <input id='full_name' name='full_name' placeholder='Nome do paciente' required />
          </div>
          <div>
            <label htmlFor='phone'>Telefone *</label>
            <input id='phone' name='phone' placeholder='(11) 99999-9999' required />
          </div>
          <div>
            <label htmlFor='cpf'>CPF</label>
            <input id='cpf' name='cpf' placeholder='000.000.000-00' />
          </div>
          <div>
            <label htmlFor='birth_date'>Data de nascimento</label>
            <input id='birth_date' name='birth_date' type='date' />
          </div>
          <div>
            <label htmlFor='email'>E-mail</label>
            <input id='email' name='email' type='email' placeholder='paciente@email.com' />
          </div>
          <div>
            <label htmlFor='guardian_name'>Responsável</label>
            <input id='guardian_name' name='guardian_name' placeholder='Nome do responsável (se menor)' />
          </div>
          <div className='md:col-span-2'>
            <label htmlFor='address'>Endereço</label>
            <input id='address' name='address' placeholder='Rua, número, bairro, cidade' />
          </div>
          <div className='md:col-span-2'>
            <label htmlFor='notes'>Observações</label>
            <textarea id='notes' name='notes' rows={3} placeholder='Alergias, condições especiais ou outras observações' />
          </div>
          <div>
            <label htmlFor='status'>Status</label>
            <select id='status' name='status'>
              {patientStatus.map(s => (
                <option key={s} value={s}>
                  {statusLabels[s] ?? s}
                </option>
              ))}
            </select>
          </div>
          <div className='md:col-span-2 flex justify-end'>
            <SubmitButton label='Cadastrar paciente' />
          </div>
        </form>
      </div>

      {/* Table */}
      <div className='admin-card'>
        <h2 className='text-base font-semibold text-gray-900 mb-4'>
          Pacientes cadastrados{' '}
          <span className='text-gray-400 font-normal text-sm'>({(patients as any[]).length})</span>
        </h2>
        {(patients as any[]).length === 0 ? (
          <p className='text-sm text-gray-500 py-8 text-center'>Nenhum paciente cadastrado ainda.</p>
        ) : (
          <div className='overflow-auto'>
            <table className='admin-table'>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>CPF</th>
                  <th>E-mail</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(patients as any[]).map(p => (
                  <tr key={p.id}>
                    <td className='font-medium'>{p.full_name}</td>
                    <td>{p.phone}</td>
                    <td className='text-gray-500'>{p.cpf ?? '—'}</td>
                    <td className='text-gray-500'>{p.email ?? '—'}</td>
                    <td>
                      <span className={statusClass[p.status] ?? 'badge badge-neutral'}>
                        {statusLabels[p.status] ?? p.status}
                      </span>
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
