import { requireStaff } from '@/lib/authHelpers'
import { supabaseRequest } from '@/lib/supabaseAdmin'
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

    const searchParams: Record<string, string | number | undefined> = {
      select: '*,pacientes(nome_completo)',
      limit: pageSize,
      offset,
      order: 'data_vencimento.asc,created_at.desc',
    }

    if (pacienteId) searchParams.paciente_id = `eq.${pacienteId}`
    if (status) searchParams.status = `eq.${status}`
    if (search.trim()) searchParams.descricao = `ilike.*${search.trim()}*`

    const { data, count } = await supabaseRequest<FinanceiroRegistro[]>('financeiro_registros', {
      searchParams,
      headers: { Prefer: 'count=exact' },
    })

    return Response.json({
      registros: data,
      totalPages: Math.ceil((count ?? 0) / pageSize),
      total: count ?? 0,
    })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 401 })
  }
}

export async function POST(req: Request) {
  try {
    await requireStaff()
    const body = await req.json()
    const { data } = await supabaseRequest<FinanceiroRegistro[]>('financeiro_registros', {
      method: 'POST',
      body,
      searchParams: { select: '*' },
      headers: { Prefer: 'return=representation' },
    })
    return Response.json({ registro: data[0] }, { status: 201 })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}
