import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/neon'
import { OdontogramClient } from './OdontogramClient'

async function saveEntry(fd: FormData) {
  'use server'
  const patient_id = String(fd.get('patient_id') || '').trim()
  const tooth_code = String(fd.get('tooth_code') || '').trim()
  if (!patient_id || !tooth_code) throw new Error('Campos obrigatórios ausentes')
  await sql`
    insert into odontogram_entries
      (patient_id, tooth_code, condition, planned_procedure, performed_procedure, notes)
    values
      (${patient_id}::uuid, ${tooth_code},
       ${String(fd.get('condition') || '') || null},
       ${String(fd.get('planned_procedure') || '') || null},
       ${String(fd.get('performed_procedure') || '') || null},
       ${String(fd.get('notes') || '') || null})`
  revalidatePath('/admin/odontogram')
}

async function deleteEntry(fd: FormData) {
  'use server'
  const id = String(fd.get('id') || '').trim()
  if (!id) throw new Error('ID ausente')
  await sql`delete from odontogram_entries where id = ${id}::uuid`
  revalidatePath('/admin/odontogram')
}

export default async function Page() {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  const [entries, patients] = await Promise.all([
    sql`
      select o.*, p.full_name as patient_name
      from odontogram_entries o
      join patients p on p.id = o.patient_id
      order by o.created_at desc
      limit 200`,
    sql`select id, full_name from patients order by full_name`,
  ])

  return (
    <OdontogramClient
      patients={patients as any[]}
      entries={entries as any[]}
      saveAction={saveEntry}
      deleteAction={deleteEntry}
    />
  )
}
