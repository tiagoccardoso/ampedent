import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { supabaseRequest } from '@/lib/supabaseAdmin'
import { EvolucaoClinica } from '@/lib/types'

async function requireAuth() {
  const role = await isSuperAdmin()
  if (role !== 'admin' && role !== 'superadmin') throw new Error('Não autorizado')
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
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
    await requireAuth()
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
