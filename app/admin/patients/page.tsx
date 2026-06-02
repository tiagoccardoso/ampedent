import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { sql } from '@/lib/neon'
import { revalidatePath } from 'next/cache'
import { patientStatus } from '@/lib/clinic'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'
import { DeleteConfirmButton } from '../_components/delete-confirm-button'

const optional = (value: FormDataEntryValue | null) => String(value || '').trim() || null

async function savePatient(formData: FormData) {
  'use server'
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  const id = optional(formData.get('id'))
  const fullName = optional(formData.get('full_name'))
  const phone = optional(formData.get('phone'))
  let target = '/admin/patients'

  try {
    if (!fullName || !phone) {
      target += '?error=Informe+nome+completo+e+telefone'
    } else if (id) {
      const updated = await sql`
        update patients
           set full_name      = ${fullName},
               phone          = ${phone},
               cpf            = ${optional(formData.get('cpf'))},
               birth_date     = ${optional(formData.get('birth_date'))},
               email          = ${optional(formData.get('email'))},
               address        = ${optional(formData.get('address'))},
               guardian_name  = ${optional(formData.get('guardian_name'))},
               notes          = ${optional(formData.get('notes'))},
               status         = ${String(formData.get('status') || 'active')}::patient_status
         where id = ${id}::uuid
         returning id
      `
      target += (updated as unknown[]).length
        ? '?ok=Paciente+atualizado+com+sucesso'
        : '?error=Paciente+n%C3%A3o+encontrado'
    } else {
      await sql`
        insert into patients (full_name, phone, cpf, birth_date, email, address, guardian_name, notes, status)
        values (
          ${fullName}, ${phone},
          ${optional(formData.get('cpf'))},
          ${optional(formData.get('birth_date'))},
          ${optional(formData.get('email'))},
          ${optional(formData.get('address'))},
          ${optional(formData.get('guardian_name'))},
          ${optional(formData.get('notes'))},
          ${String(formData.get('status') || 'active')}::patient_status
        )
      `
      target += '?ok=Paciente+cadastrado+com+sucesso'
    }
  } catch {
    target += '?error=N%C3%A3o+foi+poss%C3%ADvel+salvar+o+paciente.+Verifique+os+dados'
  }

  revalidatePath('/admin/patients')
  redirect(target)
}

async function deletePatient(formData: FormData) {
  'use server'
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  let target = '/admin/patients'
  try {
    const id = optional(formData.get('id'))
    if (!id) {
      target += '?error=Paciente+inv%C3%A1lido'
    } else {
      const deleted = await sql`delete from patients where id = ${id}::uuid returning id`
      target += (deleted as unknown[]).length
        ? '?ok=Paciente+exclu%C3%ADdo+com+sucesso'
        : '?error=Paciente+n%C3%A3o+encontrado'
    }
  } catch {
    target += '?error=N%C3%A3o+foi+poss%C3%ADvel+excluir.+Verifique+se+n%C3%A3o+h%C3%A1+v%C3%ADnculos'
  }

  revalidatePath('/admin/patients')
  redirect(target)
}

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  archived: 'Arquivado',
}
const statusBadge: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-amber-50 text-amber-700 border-amber-200',
  archived: 'bg-gray-50 text-gray-600 border-gray-200',
}

function PatientFormFields({ patient }: { patient?: any }) {
  return (
    <div className='grid gap-x-5 gap-y-4 md:grid-cols-2'>
      {patient && <input type='hidden' name='id' value={patient.id} />}

      <div>
        <label htmlFor={`full_name_${patient?.id ?? 'new'}`}>Nome completo *</label>
        <input
          id={`full_name_${patient?.id ?? 'new'}`}
          name='full_name'
          placeholder='João da Silva'
          defaultValue={patient?.full_name ?? ''}
          required
        />
      </div>

      <div>
        <label htmlFor={`phone_${patient?.id ?? 'new'}`}>Telefone *</label>
        <input
          id={`phone_${patient?.id ?? 'new'}`}
          name='phone'
          placeholder='(11) 99999-0000'
          defaultValue={patient?.phone ?? ''}
          required
        />
      </div>

      <div>
        <label htmlFor={`cpf_${patient?.id ?? 'new'}`}>CPF</label>
        <input
          id={`cpf_${patient?.id ?? 'new'}`}
          name='cpf'
          placeholder='000.000.000-00'
          defaultValue={patient?.cpf ?? ''}
        />
      </div>

      <div>
        <label htmlFor={`birth_date_${patient?.id ?? 'new'}`}>Data de nascimento</label>
        <input
          id={`birth_date_${patient?.id ?? 'new'}`}
          name='birth_date'
          type='date'
          defaultValue={patient?.birth_date ?? ''}
        />
      </div>

      <div>
        <label htmlFor={`email_${patient?.id ?? 'new'}`}>E-mail</label>
        <input
          id={`email_${patient?.id ?? 'new'}`}
          name='email'
          type='email'
          placeholder='paciente@email.com'
          defaultValue={patient?.email ?? ''}
        />
      </div>

      <div>
        <label htmlFor={`guardian_${patient?.id ?? 'new'}`}>Responsável</label>
        <input
          id={`guardian_${patient?.id ?? 'new'}`}
          name='guardian_name'
          placeholder='Nome do responsável'
          defaultValue={patient?.guardian_name ?? ''}
        />
      </div>

      <div className='md:col-span-2'>
        <label htmlFor={`address_${patient?.id ?? 'new'}`}>Endereço</label>
        <input
          id={`address_${patient?.id ?? 'new'}`}
          name='address'
          placeholder='Rua, número, complemento, bairro'
          defaultValue={patient?.address ?? ''}
        />
      </div>

      <div className='md:col-span-2'>
        <label htmlFor={`notes_${patient?.id ?? 'new'}`}>Observações clínicas</label>
        <textarea
          id={`notes_${patient?.id ?? 'new'}`}
          name='notes'
          rows={3}
          placeholder='Alergias, condições médicas relevantes…'
          defaultValue={patient?.notes ?? ''}
          className='resize-y'
        />
      </div>

      <div>
        <label htmlFor={`status_${patient?.id ?? 'new'}`}>Status</label>
        <select id={`status_${patient?.id ?? 'new'}`} name='status' defaultValue={patient?.status ?? 'active'}>
          {patientStatus.map(s => (
            <option key={s} value={s}>{statusLabels[s] ?? s}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  const params = (await searchParams) ?? {}
  const patients = await sql`select * from patients order by created_at desc limit 100`

  return (
    <section className='space-y-8'>
      {/* Page header */}
      <div>
        <p
          className='text-xs font-bold tracking-[0.1em] uppercase mb-1 text-[#30628a]'
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Cadastro
        </p>
        <h1 className='text-2xl font-extrabold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>
          Pacientes
        </h1>
        <p className='text-sm text-[#70787c] mt-1'>Cadastre, edite e exclua pacientes da clínica.</p>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      {/* New patient form */}
      <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
        <div className='px-6 py-4 border-b border-[#f2f4f5] flex items-center gap-3'>
          <span className='text-xl'>➕</span>
          <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>
            Cadastrar novo paciente
          </h2>
        </div>
        <form action={savePatient} className='px-6 py-6'>
          <PatientFormFields />
          <div className='mt-6 flex justify-end'>
            <SubmitButton label='✓ Cadastrar paciente' />
          </div>
        </form>
      </div>

      {/* Patient list */}
      <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
        <div className='px-6 py-4 border-b border-[#f2f4f5] flex items-center justify-between'>
          <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>
            Pacientes cadastrados{' '}
            <span className='ml-2 text-sm font-normal text-[#70787c]'>
              ({(patients as any[]).length})
            </span>
          </h2>
        </div>

        {(patients as any[]).length === 0 ? (
          <div className='px-6 py-16 text-center'>
            <div className='text-4xl mb-3'>👥</div>
            <p className='text-[#70787c] text-sm'>Nenhum paciente cadastrado ainda.</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[900px] text-sm'>
              <thead>
                <tr style={{ background: '#f8fafb', borderBottom: '1px solid #e6e8e9' }}>
                  {['Paciente', 'Telefone', 'E-mail', 'Status', 'Ações'].map(h => (
                    <th
                      key={h}
                      className='px-5 py-3 text-left text-[10px] font-bold tracking-[0.08em] uppercase text-[#70787c]'
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-[#f2f4f5]'>
                {(patients as any[]).map((patient, idx) => (
                  <tr key={patient.id} className='hover:bg-[#f8fafb] transition-colors align-top'>
                    <td className='px-5 py-4'>
                      <div className='flex items-center gap-3'>
                        <div
                          className='w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0'
                          style={{ background: `hsl(${(idx * 47 + 200) % 360}, 55%, 42%)` }}>
                          {patient.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className='font-semibold text-[#003441]'>{patient.full_name}</p>
                          {patient.cpf && <p className='text-xs text-[#70787c]'>{patient.cpf}</p>}
                        </div>
                      </div>
                    </td>
                    <td className='px-5 py-4 text-[#40484b]'>{patient.phone}</td>
                    <td className='px-5 py-4 text-[#40484b]'>{patient.email || '—'}</td>
                    <td className='px-5 py-4'>
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-1 rounded-full border ${statusBadge[patient.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {statusLabels[patient.status] ?? patient.status}
                      </span>
                    </td>
                    <td className='px-5 py-4'>
                      <div className='flex flex-col gap-2'>
                        {/* Edit expand */}
                        <details className='rounded-xl border border-[#e6e8e9] overflow-hidden'>
                          <summary
                            className='cursor-pointer px-3 py-2 text-xs font-bold text-[#003441] select-none hover:bg-[#f2f4f5] transition-colors'
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            ✏️ Editar
                          </summary>
                          <form action={savePatient} className='p-4 border-t border-[#e6e8e9]'>
                            <PatientFormFields patient={patient} />
                            <div className='mt-5 flex items-center gap-3 justify-end'>
                              <SubmitButton label='✓ Atualizar paciente' />
                            </div>
                          </form>
                        </details>

                        {/* Delete */}
                        <form action={deletePatient}>
                          <input type='hidden' name='id' value={patient.id} />
                          <DeleteConfirmButton message={`Excluir o paciente "${patient.full_name}"? Esta ação não pode ser desfeita.`} />
                        </form>
                      </div>
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
