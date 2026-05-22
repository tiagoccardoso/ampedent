import { requireStaff } from '@/lib/authHelpers'
import { getDb } from '@/lib/db'
import { FinanceiroRegistro } from '@/lib/types'

export async function GET(req: Request) {
  try {
    await requireStaff()
    const url = new URL(req.url)
    const pacienteId = url.searchParams.get('paciente_id') ?? ''
    const status = url.searchParams.get('status') ?? ''
    const search = url.searchParams.get('search') ?? ''
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = 20
    const offset = pageSize * (page - 1)
    const sql = getDb()

    const conditions: string[] = []
    const params: unknown[] = []

    if (pacienteId) {
      params.push(pacienteId)
      conditions.push(`fr.paciente_id = $${params.length}`)
    }
    if (status) {
      params.push(status)
      conditions.push(`fr.status = $${params.length}`)
    }
    if (search.trim()) {
      params.push(`%${search.trim()}%`)
      conditions.push(`fr.descricao ILIKE $${params.length}`)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const countParams = [...params]

    params.push(pageSize, offset)
    const dataQ = `
      SELECT fr.*,
        CASE WHEN fr.paciente_id IS NOT NULL
          THEN json_build_object('nome_completo', p.nome_completo)
          ELSE NULL
        END AS pacientes
      FROM financeiro_registros fr
      LEFT JOIN pacientes p ON p.id = fr.paciente_id
      ${where}
      ORDER BY fr.data_vencimento ASC, fr.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `
    const countQ = `SELECT COUNT(*)::int AS count FROM financeiro_registros fr ${where}`

    const [countRows, dataRows] = await Promise.all([
      sql.query(countQ, countParams as string[]),
      sql.query(dataQ, params as string[]),
    ])

    const count = (countRows[0] as { count: number }).count

    return Response.json({
      registros: dataRows as FinanceiroRegistro[],
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
      `INSERT INTO financeiro_registros (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values as string[],
    )

    return Response.json({ registro: rows[0] as FinanceiroRegistro }, { status: 201 })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}
