import { requireStaff } from '@/lib/authHelpers'
import { getDb } from '@/lib/db'
import { OdontogramaRegistro } from '@/lib/types'

export async function GET(req: Request) {
  try {
    await requireStaff()
    const url = new URL(req.url)
    const pacienteId = url.searchParams.get('paciente_id')
    if (!pacienteId) return Response.json({ message: 'paciente_id obrigatório' }, { status: 400 })

    const sql = getDb()
    const rows = await sql`
      SELECT oreg.*,
        CASE WHEN oreg.procedimento_id IS NOT NULL
          THEN json_build_object('nome', pr.nome)
          ELSE NULL
        END AS procedimentos
      FROM odontograma_registros oreg
      LEFT JOIN procedimentos pr ON pr.id = oreg.procedimento_id
      WHERE oreg.paciente_id = ${pacienteId}
      ORDER BY oreg.dente_numero ASC, oreg.registrado_em DESC
    ` as OdontogramaRegistro[]

    return Response.json({ registros: rows })
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
      `INSERT INTO odontograma_registros (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values as string[],
    )

    return Response.json({ registro: rows[0] as OdontogramaRegistro }, { status: 201 })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}
