import { requireStaff } from '@/lib/authHelpers'
import { supabaseRequest } from '@/lib/supabaseAdmin'
import { FinanceiroRegistro } from '@/lib/types'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    const body = await req.json()
    const { data } = await supabaseRequest<FinanceiroRegistro[]>('financeiro_registros', {
      method: 'PATCH',
      body,
      searchParams: { id: `eq.${id}`, select: '*' },
      headers: { Prefer: 'return=representation' },
    })
    return Response.json({ registro: data[0] })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    await supabaseRequest('financeiro_registros', {
      method: 'PATCH',
      body: { status: 'cancelado' },
      searchParams: { id: `eq.${id}` },
    })
    return Response.json({ message: 'Registro cancelado' })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}
