import { requireStaff } from '@/lib/authHelpers'
import { getDb } from '@/lib/db'
import { PlanoTratamento, ItemPlanoTratamento } from '@/lib/types'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    const sql = getDb()

    const [planoRows, itensRows] = await Promise.all([
      sql`
        SELECT pt.*, json_build_object('nome_completo', p.nome_completo) AS pacientes
        FROM planos_tratamento pt
        LEFT JOIN pacientes p ON p.id = pt.paciente_id
        WHERE pt.id = ${id} LIMIT 1
      `,
      sql`
        SELECT ipt.*,
          CASE WHEN ipt.procedimento_id IS NOT NULL
            THEN json_build_object('nome', pr.nome, 'categoria', pr.categoria)
            ELSE NULL
          END AS procedimentos
        FROM itens_plano_tratamento ipt
        LEFT JOIN procedimentos pr ON pr.id = ipt.procedimento_id
        WHERE ipt.plano_id = ${id}
        ORDER BY ipt.ordem ASC
      `,
    ])

    if (!planoRows[0]) return Response.json({ message: 'Não encontrado' }, { status: 404 })

    return Response.json({
      plano: planoRows[0] as PlanoTratamento,
      itens: itensRows as ItemPlanoTratamento[],
    })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    const body = await req.json()
    const { itens: _itens, ...planoData } = body
    const sql = getDb()

    const fields = Object.keys(planoData)
    const values = Object.values(planoData)
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ')
    values.push(id)

    const rows = await sql.query(
      `UPDATE planos_tratamento SET ${setClause}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values as string[],
    )

    return Response.json({ plano: rows[0] as PlanoTratamento })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    const sql = getDb()
    await sql`UPDATE planos_tratamento SET status = 'cancelado', updated_at = NOW() WHERE id = ${id}`
    return Response.json({ message: 'Plano cancelado' })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}
