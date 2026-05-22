import { requireStaff } from '@/lib/authHelpers'
import { getDb } from '@/lib/db'
import { FinanceiroRegistro } from '@/lib/types'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    const body = await req.json()
    const sql = getDb()

    const fields = Object.keys(body)
    const values = Object.values(body)
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ')
    values.push(id)

    const rows = await sql.query(
      `UPDATE financeiro_registros SET ${setClause}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values as string[],
    )

    return Response.json({ registro: rows[0] as FinanceiroRegistro })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    const sql = getDb()
    await sql`UPDATE financeiro_registros SET status = 'cancelado', updated_at = NOW() WHERE id = ${id}`
    return Response.json({ message: 'Registro cancelado' })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}
