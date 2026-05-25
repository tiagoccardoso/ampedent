import { requireStaff } from '@/lib/authHelpers'
import { getDb } from '@/lib/db'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    const body = await req.json()
    const { procedimento_id, dente, faces, status, valor, observacoes, ordem } = body

    const sql = getDb()

    const plan = await sql`SELECT id FROM planos_tratamento WHERE id = ${id}`
    if (!plan.length) return Response.json({ message: 'Plano não encontrado.' }, { status: 404 })

    const rows = await sql`
      INSERT INTO itens_plano_tratamento
        (plano_id, procedimento_id, dente, faces, status, valor, observacoes, ordem)
      VALUES (
        ${id},
        ${procedimento_id ?? null},
        ${dente ?? null},
        ${faces ?? null},
        ${status ?? 'planejado'},
        ${Number(valor) || 0},
        ${observacoes ?? null},
        ${Number(ordem) || 0}
      )
      RETURNING *
    `
    return Response.json({ item: rows[0] }, { status: 201 })
  } catch (error: any) {
    if (error.message === 'Não autorizado') {
      return Response.json({ message: 'Não autorizado.' }, { status: 401 })
    }
    console.error('[treatment-plans/items POST]', error.message)
    return Response.json({ message: 'Erro ao adicionar item.' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    const url = new URL(req.url)
    const itemId = url.searchParams.get('item_id')

    if (!itemId) return Response.json({ message: 'item_id obrigatório.' }, { status: 400 })

    const sql = getDb()
    await sql`
      DELETE FROM itens_plano_tratamento
      WHERE id = ${itemId} AND plano_id = ${id}
    `
    return Response.json({ message: 'Item removido.' })
  } catch (error: any) {
    if (error.message === 'Não autorizado') {
      return Response.json({ message: 'Não autorizado.' }, { status: 401 })
    }
    console.error('[treatment-plans/items DELETE]', error.message)
    return Response.json({ message: 'Erro ao remover item.' }, { status: 500 })
  }
}
