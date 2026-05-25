import { sql } from '@/lib/neon'
import { AdminRole, AdminUserRow, BookingRow } from '@/lib/types'

type AdminWithPassword = AdminUserRow & { password_hash: string | null }

function isMissingColumn(error: unknown, column: string) {
  const msg = error instanceof Error ? error.message.toLowerCase() : ''
  return msg.includes(`column \"${column.toLowerCase()}\"`) && msg.includes('does not exist')
}

export async function getAdminByEmail(email: string) {
  try {
    const rows = await sql`SELECT id, email, name, role, password_hash FROM "user" WHERE email = ${email} LIMIT 1`
    return (rows as AdminWithPassword[])[0] ?? null
  } catch (error) {
    if (!isMissingColumn(error, 'role') && !isMissingColumn(error, 'password_hash')) throw error

    const rows = await sql`
      SELECT
        id,
        email,
        COALESCE(name, split_part(email, '@', 1)) as name,
        'admin'::text as role,
        COALESCE(password_hash, password) as password_hash
      FROM "user"
      WHERE email = ${email}
      LIMIT 1
    `
    return (rows as AdminWithPassword[])[0] ?? null
  }
}

export async function createAdminUser(email: string, name: string, role: AdminRole, passwordHash: string) {
  try {
    const rows = await sql`INSERT INTO "user" (email, name, role, password_hash) VALUES (${email}, ${name}, ${role}, ${passwordHash}) RETURNING id, email, name, role`
    return (rows as AdminUserRow[])[0]
  } catch (error) {
    const rows = await sql`
      INSERT INTO "user" (email, name, password)
      VALUES (${email}, ${name}, ${passwordHash})
      RETURNING id, email, name, 'admin'::text as role
    `
    return (rows as AdminUserRow[])[0]
  }
}

export async function updateAdminUserPassword(id: string, passwordHash: string) {
  try {
    await sql`UPDATE "user" SET password_hash = ${passwordHash}, updated_at = NOW() WHERE id = ${id}`
  } catch {
    await sql`UPDATE "user" SET password = ${passwordHash}, updated_at = NOW() WHERE id = ${id}`
  }
}

export async function listAdminUsers() {
  try {
    const rows = await sql`SELECT id, email, name, role FROM "user" ORDER BY created_at ASC`
    return rows as AdminUserRow[]
  } catch {
    const rows = await sql`SELECT id, email, COALESCE(name, split_part(email, '@', 1)) as name, 'admin'::text as role FROM "user" ORDER BY id ASC`
    return rows as AdminUserRow[]
  }
}

export async function getAdminById(id: string) {
  try {
    const rows = await sql`SELECT id, role FROM "user" WHERE id = ${id} LIMIT 1`
    return (rows as AdminUserRow[])[0] ?? null
  } catch {
    const rows = await sql`SELECT id, 'admin'::text as role FROM "user" WHERE id = ${id} LIMIT 1`
    return (rows as AdminUserRow[])[0] ?? null
  }
}

export async function deleteAdminById(id: string) { await sql`DELETE FROM "user" WHERE id = ${id}` }

export async function listBookings() {
  const rows = await sql`SELECT * FROM bookings ORDER BY status DESC, date ASC, time ASC`
  return rows as BookingRow[]
}
