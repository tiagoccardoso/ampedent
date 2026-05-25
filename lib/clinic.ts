import { sql } from '@/lib/neon'

export const patientStatus = ['active','inactive'] as const
export const appointmentStatus = ['scheduled','confirmed','in_progress','completed','canceled','no_show'] as const
export const budgetStatus = ['draft','sent','approved','rejected','canceled'] as const
export const financeStatus = ['pending','paid','overdue','canceled'] as const

export async function listLookup() {
  const [patients, professionals, procedures, budgets] = await Promise.all([
    sql`select id, full_name from patients order by full_name`,
    sql`select id, full_name from professionals where is_active = true order by full_name`,
    sql`select id, name from procedures where is_active = true order by name`,
    sql`select id from budgets order by created_at desc limit 200`,
  ])
  return { patients: patients as any[], professionals: professionals as any[], procedures: procedures as any[], budgets: budgets as any[] }
}
