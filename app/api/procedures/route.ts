import { requireStaff } from '@/lib/authHelpers'
import { getDb } from '@/lib/db'
import { Procedimento } from '@/lib/types'

export async function GET(req: Request) {
  try {
    await requireStaff()
    const url = new URL(req.url)
    const categoria = url.searchParams.get('categoria') ?? ''
    const search = url.searchParams.get('search') ?? ''
    const ativo = url.searchParams.get('ativo') ?? 'true'
    const all = url.searchParams.get('all') === 'true'
    const sql = getDb()

    const conditions: string[] = []
    const params: unknown[] = []

    if (ativo !== 'all') {
      params.push(ativo === 'true')
      conditions.push(`ativo = $${params.length}`)
    }

    if (categoria) {
      params.push(categoria)
      conditions.push(`categoria = $${params.length}`)
    }

    if (search.trim()) {
      params.push(`%${search.trim()}%`)
      conditions.push(`nome ILIKE $${params.length}`)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const limit = all ? '' : `LIMIT 100`

    const rows = await sql.query(
      `SELECT * FROM procedimentos ${where} ORDER BY categoria ASC, nome ASC ${limit}`,
      params as string[],
    )

    return Response.json({ procedimentos: rows as Procedimento[] })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 401 })
  }
}

export async function POST(req: Request) {
  try {
    await requireStaff()
    const body = await req.json()
    const sql = getDb()

    const fields = Object.keys(body)
    const values = Object.values(body)
    const placeholders = values.map((_, i) => `$${i + 1}`)

    const rows = await sql.query(
      `INSERT INTO procedimentos (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values as string[],
    )

    return Response.json({ procedimento: rows[0] as Procedimento }, { status: 201 })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}
