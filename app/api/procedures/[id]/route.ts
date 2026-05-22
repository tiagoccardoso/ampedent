import { requireStaff } from '@/lib/authHelpers'
import { getDb } from '@/lib/db'
import { Procedimento } from '@/lib/types'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    const sql = getDb()
    const rows = await sql`SELECT * FROM procedimentos WHERE id = ${id} LIMIT 1` as Procedimento[]
    if (!rows[0]) return Response.json({ message: 'Não encontrado' }, { status: 404 })
    return Response.json({ procedimento: rows[0] })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}

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
      `UPDATE procedimentos SET ${setClause}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values as string[],
    )

    return Response.json({ procedimento: rows[0] as Procedimento })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    const sql = getDb()
    await sql`UPDATE procedimentos SET ativo = false, updated_at = NOW() WHERE id = ${id}`
    return Response.json({ message: 'Procedimento desativado' })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}
