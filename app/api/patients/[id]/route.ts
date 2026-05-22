import { requireStaff } from '@/lib/authHelpers'
import { getDb } from '@/lib/db'
import { Paciente, Anamnese } from '@/lib/types'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    const url = new URL(req.url)
    const include = url.searchParams.get('include') ?? ''
    const sql = getDb()

    const pacientes = await sql`SELECT * FROM pacientes WHERE id = ${id} LIMIT 1` as Paciente[]
    if (!pacientes[0]) {
      return Response.json({ message: 'Paciente não encontrado' }, { status: 404 })
    }

    const result: Record<string, unknown> = { paciente: pacientes[0] }

    if (include.includes('anamnese')) {
      const rows = await sql`SELECT * FROM anamneses WHERE paciente_id = ${id} LIMIT 1` as Anamnese[]
      result.anamnese = rows[0] ?? null
    }

    return Response.json(result)
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    const body = await req.json()
    const { anamnese, ...pacienteData } = body
    const sql = getDb()

    const pacFields = Object.keys(pacienteData)
    const pacValues = Object.values(pacienteData)

    let paciente: Paciente | undefined
    if (pacFields.length > 0) {
      const setClause = pacFields.map((f, i) => `${f} = $${i + 1}`).join(', ')
      pacValues.push(id)
      const rows = await sql.query(
        `UPDATE pacientes SET ${setClause}, updated_at = NOW() WHERE id = $${pacValues.length} RETURNING *`,
        pacValues as string[],
      )
      paciente = rows[0] as Paciente
    }

    if (anamnese !== undefined) {
      const existing = await sql`SELECT id FROM anamneses WHERE paciente_id = ${id} LIMIT 1`
      if (existing[0]) {
        const aFields = Object.keys(anamnese)
        const aValues = Object.values(anamnese)
        if (aFields.length > 0) {
          const setClause = aFields.map((f, i) => `${f} = $${i + 1}`).join(', ')
          aValues.push(id)
          await sql.query(
            `UPDATE anamneses SET ${setClause}, updated_at = NOW() WHERE paciente_id = $${aValues.length}`,
            aValues as string[],
          )
        }
      } else {
        const aFields = ['paciente_id', ...Object.keys(anamnese)]
        const aValues = [id, ...Object.values(anamnese)]
        const placeholders = aValues.map((_, i) => `$${i + 1}`)
        await sql.query(
          `INSERT INTO anamneses (${aFields.join(', ')}) VALUES (${placeholders.join(', ')})`,
          aValues as string[],
        )
      }
    }

    return Response.json({ paciente })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    const sql = getDb()
    await sql`UPDATE pacientes SET ativo = false, updated_at = NOW() WHERE id = ${id}`
    return Response.json({ message: 'Paciente desativado' })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}
