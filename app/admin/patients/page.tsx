import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { sql } from '@/lib/neon'
import { revalidatePath } from 'next/cache'
import { patientStatus } from '@/lib/clinic'
import { SubmitButton } from './submit-button'
import { FormFeedback } from '../_components/form-feedback'

async function savePatient(formData: FormData) {
  'use server'
  try {
    const full_name = String(formData.get('full_name') || '').trim(); const phone = String(formData.get('phone') || '').trim(); if (!full_name || !phone) redirect('/admin/patients?error=Verifique+os+campos+obrigat%C3%B3rios')
    await sql`insert into patients (full_name, phone, cpf, birth_date, email, address, guardian_name, notes, status) values (${full_name}, ${phone}, ${String(formData.get('cpf')||'')||null}, ${String(formData.get('birth_date')||'')||null}, ${String(formData.get('email')||'')||null}, ${String(formData.get('address')||'')||null}, ${String(formData.get('guardian_name')||'')||null}, ${String(formData.get('notes')||'')||null}, ${String(formData.get('status') || 'active')}::patient_status)`
    revalidatePath('/admin/patients'); redirect('/admin/patients?ok=Paciente+cadastrado+com+sucesso')
  } catch (e) { console.error('patients.save', e); redirect('/admin/patients?error=N%C3%A3o+foi+poss%C3%ADvel+salvar.+Verifique+os+dados+e+tente+novamente') }
}

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const admin = await getCurrentAdminProfile(); if (!admin) redirect('/admin')
  const params = (await searchParams) ?? {}
  const patients = await sql`select * from patients order by created_at desc limit 100`
  return <section className='space-y-4'><h1 className='text-2xl font-bold'>Pacientes</h1><FormFeedback ok={params.ok} error={params.error} /><form action={savePatient} className='grid md:grid-cols-2 gap-3'><input name='full_name' placeholder='Nome completo *' required /><input name='phone' placeholder='Telefone *' required /><input name='cpf' placeholder='cpf' /><input name='birth_date' type='date' /><input name='email' type='email' placeholder='email' /><input name='guardian_name' placeholder='Responsável' /><input name='address' className='md:col-span-2' placeholder='Endereço' /><textarea name='notes' className='md:col-span-2' placeholder='Observações' /><select name='status'>{patientStatus.map(s => <option key={s} value={s}>{s}</option>)}</select><SubmitButton /></form><div className='overflow-auto'><table className='w-full text-sm'><thead><tr><th>Nome</th><th>Telefone</th><th>Status</th></tr></thead><tbody>{(patients as any[]).map(p => <tr key={p.id}><td>{p.full_name}</td><td>{p.phone}</td><td>{p.status}</td></tr>)}</tbody></table></div></section>
}
