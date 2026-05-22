import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { supabaseRequest } from '@/lib/supabaseAdmin'
import { Procedimento } from '@/lib/types'

async function requireAuth() {
  const role = await isSuperAdmin()
  if (role !== 'admin' && role !== 'superadmin') throw new Error('Não autorizado')
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params
    const { data } = await supabaseRequest<Procedimento[]>('procedimentos', {
      searchParams: { select: '*', id: `eq.${id}`, limit: 1 },
    })
    if (!data[0]) return Response.json({ message: 'Não encontrado' }, { status: 404 })
    return Response.json({ procedimento: data[0] })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params
    const body = await req.json()
    const { data } = await supabaseRequest<Procedimento[]>('procedimentos', {
      method: 'PATCH',
      body,
      searchParams: { id: `eq.${id}`, select: '*' },
      headers: { Prefer: 'return=representation' },
    })
    return Response.json({ procedimento: data[0] })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params
    await supabaseRequest('procedimentos', {
      method: 'PATCH',
      body: { ativo: false },
      searchParams: { id: `eq.${id}` },
    })
    return Response.json({ message: 'Procedimento desativado' })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}
