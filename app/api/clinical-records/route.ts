import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { supabaseRequest } from '@/lib/supabaseAdmin'
import { EvolucaoClinica } from '@/lib/types'

async function requireAuth() {
  const role = await isSuperAdmin()
  if (role !== 'admin' && role !== 'superadmin') throw new Error('Não autorizado')
}

export async function GET(req: Request) {
  try {
    await requireAuth()
    const url = new URL(req.url)
    const pacienteId = url.searchParams.get('paciente_id') ?? ''
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = 20
    const offset = pageSize * (page - 1)

    const searchParams: Record<string, string | number | undefined> = {
      select: '*,admin_users(name)',
      limit: pageSize,
      offset,
      order: 'data_atendimento.desc,created_at.desc',
    }

    if (pacienteId) searchParams.paciente_id = `eq.${pacienteId}`

    const { data, count } = await supabaseRequest<EvolucaoClinica[]>('evolucoes_clinicas', {
      searchParams,
      headers: { Prefer: 'count=exact' },
    })

    return Response.json({
      evolucoes: data,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 401 })
  }
}

export async function POST(req: Request) {
  try {
    await requireAuth()
    const body = await req.json()
    const { data } = await supabaseRequest<EvolucaoClinica[]>('evolucoes_clinicas', {
      method: 'POST',
      body,
      searchParams: { select: '*' },
      headers: { Prefer: 'return=representation' },
    })
    return Response.json({ evolucao: data[0] }, { status: 201 })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}
