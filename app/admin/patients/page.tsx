import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { sql } from '@/lib/neon'
import { revalidatePath } from 'next/cache'
import { patientStatus } from '@/lib/clinic'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'

async function savePatient(formData: FormData) {
  'use server'
  const full_name = String(formData.get('full_name') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  if (!full_name || !phone) redirect('/admin/patients?error=Verifique+os+campos+obrigat%C3%B3rios')
  try {
    await sql`insert into patients (full_name, phone, cpf, birth_date, email, address, guardian_name, notes, status) values (${full_name}, ${phone}, ${String(formData.get('cpf')||'')||null}, ${String(formData.get('birth_date')||'')||null}, ${String(formData.get('email')||'')||null}, ${String(formData.get('address')||'')||null}, ${String(formData.get('guardian_name')||'')||null}, ${String(formData.get('notes')||'')||null}, ${String(formData.get('status') || 'active')}::patient_status)`
  } catch (e) {
    console.error('patients.save', e)
    redirect('/admin/patients?error=N%C3%A3o+foi+poss%C3%ADvel+salvar.+Verifique+os+dados+e+tente+novamente')
  }
  revalidatePath('/admin/patients')
  redirect('/admin/patients?ok=Paciente+cadastrado+com+sucesso')
}

const statusLabel: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  archived: 'Arquivado',
}

const statusClass: Record<string, string> = {
  active: 'badge badge-success',
  inactive: 'badge badge-pending',
  archived: 'badge badge-error',
}

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  const params = (await searchParams) ?? {}
  const patients = await sql`select * from patients order by created_at desc limit 100`

  return (
    <section className='space-y-6'>
      <div className='page-header'>
        <h1 className='page-title'>Pacientes</h1>
        <p className='page-subtitle'>Cadastro e listagem de pacientes da clínica</p>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[#0f172a]'>Novo paciente</h2>
        </div>
        <div className='section-card-body'>
          <form action={savePatient} className='grid md:grid-cols-2 gap-3'>
            <div><label htmlFor='full_name'>Nome completo *</label><input id='full_name' name='full_name' placeholder='Nome completo' required /></div>
            <div><label htmlFor='phone'>Telefone *</label><input id='phone' name='phone' placeholder='(11) 99999-9999' required /></div>
            <div><label htmlFor='cpf'>CPF</label><input id='cpf' name='cpf' placeholder='000.000.000-00' /></div>
            <div><label htmlFor='birth_date'>Data de nascimento</label><input id='birth_date' name='birth_date' type='date' /></div>
            <div><label htmlFor='email'>E-mail</label><input id='email' name='email' type='email' placeholder='paciente@email.com' /></div>
            <div><label htmlFor='guardian_name'>Responsável</label><input id='guardian_name' name='guardian_name' placeholder='Nome do responsável' /></div>
            <div className='md:col-span-2'><label htmlFor='address'>Endereço</label><input id='address' name='address' placeholder='Rua, número, bairro, cidade' /></div>
            <div className='md:col-span-2'><label htmlFor='notes'>Observações</label><textarea id='notes' name='notes' rows={3} placeholder='Observações clínicas ou alergias...' /></div>
            <div><label htmlFor='status'>Status</label><select id='status' name='status'>{patientStatus.map(s => <option key={s} value={s}>{statusLabel[s] ?? s}</option>)}</select></div>
            <div className='flex items-end'><SubmitButton label='Cadastrar paciente' /></div>
          </form>
        </div>
      </div>

      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[#0f172a]'>Lista de pacientes</h2>
          <span className='text-xs text-[#64748b]'>{(patients as any[]).length} registros</span>
        </div>
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
              {(patients as any[]).length === 0 && (
                <tr><td colSpan={5} className='text-center py-8 text-[#64748b] text-sm'>Nenhum paciente cadastrado.</td></tr>
              )}
              {(patients as any[]).map(p => (
                <tr key={p.id}>
                  <td className='font-medium text-[#0f172a]'>{p.full_name}</td>
                  <td>{p.phone}</td>
                  <td>{p.cpf ?? '—'}</td>
                  <td>{p.email ?? '—'}</td>
                  <td><span className={statusClass[p.status] ?? 'badge'}>{statusLabel[p.status] ?? p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
