import { requireStaff } from '@/lib/authHelpers'
import { getDb } from '@/lib/db'
import { EvolucaoClinica } from '@/lib/types'

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
      `UPDATE evolucoes_clinicas SET ${setClause}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values as string[],
    )

    return Response.json({ evolucao: rows[0] as EvolucaoClinica })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    const sql = getDb()
    await sql`DELETE FROM evolucoes_clinicas WHERE id = ${id}`
    return Response.json({ message: 'Registro excluído' })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}
