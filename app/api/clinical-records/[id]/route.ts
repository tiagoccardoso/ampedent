import { requireStaff } from '@/lib/authHelpers'
import { supabaseRequest } from '@/lib/supabaseAdmin'
import { EvolucaoClinica } from '@/lib/types'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    const body = await req.json()
    const { data } = await supabaseRequest<EvolucaoClinica[]>('evolucoes_clinicas', {
      method: 'PATCH',
      body,
      searchParams: { id: `eq.${id}`, select: '*' },
      headers: { Prefer: 'return=representation' },
    })
    return Response.json({ evolucao: data[0] })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    await supabaseRequest('evolucoes_clinicas', {
      method: 'DELETE',
      searchParams: { id: `eq.${id}` },
    })
    return Response.json({ message: 'Registro excluído' })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}
