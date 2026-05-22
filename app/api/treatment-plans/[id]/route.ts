import { requireStaff } from '@/lib/authHelpers'
import { supabaseRequest } from '@/lib/supabaseAdmin'
import { PlanoTratamento, ItemPlanoTratamento } from '@/lib/types'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params

    const [{ data: planos }, { data: itens }] = await Promise.all([
      supabaseRequest<PlanoTratamento[]>('planos_tratamento', {
        searchParams: { select: '*,pacientes(nome_completo)', id: `eq.${id}`, limit: 1 },
      }),
      supabaseRequest<ItemPlanoTratamento[]>('itens_plano_tratamento', {
        searchParams: {
          select: '*,procedimentos(nome,categoria)',
          plano_id: `eq.${id}`,
          order: 'ordem.asc',
        },
      }),
    ])

    if (!planos[0]) return Response.json({ message: 'Não encontrado' }, { status: 404 })
    return Response.json({ plano: planos[0], itens })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    const body = await req.json()
    const { itens, ...planoData } = body

    const { data } = await supabaseRequest<PlanoTratamento[]>('planos_tratamento', {
      method: 'PATCH',
      body: planoData,
      searchParams: { id: `eq.${id}`, select: '*' },
      headers: { Prefer: 'return=representation' },
    })

    return Response.json({ plano: data[0] })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    await supabaseRequest('planos_tratamento', {
      method: 'PATCH',
      body: { status: 'cancelado' },
      searchParams: { id: `eq.${id}` },
    })
    return Response.json({ message: 'Plano cancelado' })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}
