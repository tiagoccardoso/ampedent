import { requireStaff } from '@/lib/authHelpers'
import { getDb } from '@/lib/db'
import { Paciente } from '@/lib/types'

export async function GET(req: Request) {
  try {
    await requireStaff()
    const url = new URL(req.url)
    const search = url.searchParams.get('search') ?? ''
    const page = Number(url.searchParams.get('page')) || 1
    const ativo = url.searchParams.get('ativo') ?? 'true'
    const pageSize = 20
    const offset = pageSize * (page - 1)
    const sql = getDb()

    const conditions: string[] = []
    const params: unknown[] = []

    if (ativo !== 'all') {
      params.push(ativo === 'true')
      conditions.push(`ativo = $${params.length}`)
    }

    if (search.trim()) {
      const term = `%${search.trim()}%`
      params.push(term, term, term, term, term)
      const n = params.length
      conditions.push(
        `(nome_completo ILIKE $${n - 4} OR cpf ILIKE $${n - 3} OR email ILIKE $${n - 2} OR telefone ILIKE $${n - 1} OR celular ILIKE $${n})`,
      )
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const countParams = [...params]

    params.push(pageSize, offset)
    const dataQ = `SELECT * FROM pacientes ${where} ORDER BY nome_completo ASC LIMIT $${params.length - 1} OFFSET $${params.length}`
    const countQ = `SELECT COUNT(*)::int AS count FROM pacientes ${where}`

    const [countRows, dataRows] = await Promise.all([
      sql.query(countQ, countParams as string[]),
      sql.query(dataQ, params as string[]),
    ])

    const count = (countRows[0] as { count: number }).count

    return Response.json({
      pacientes: dataRows as Paciente[],
      totalPages: Math.ceil(count / pageSize),
      total: count,
    })
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
      `INSERT INTO pacientes (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values as string[],
    )

    return Response.json({ paciente: rows[0] as Paciente }, { status: 201 })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}
