import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { supabaseRequest } from '@/lib/supabaseAdmin'
import { Paciente } from '@/lib/types'

async function requireAuth() {
  const role = await isSuperAdmin()
  if (role !== 'admin' && role !== 'superadmin') {
    throw new Error('Não autorizado')
  }
}

export async function GET(req: Request) {
  try {
    await requireAuth()
    const url = new URL(req.url)
    const search = url.searchParams.get('search') ?? ''
    const page = Number(url.searchParams.get('page')) || 1
    const ativo = url.searchParams.get('ativo') ?? 'true'
    const pageSize = 20
    const offset = pageSize * (page - 1)

    const searchParams: Record<string, string | number | undefined> = {
      select: '*',
      limit: pageSize,
      offset,
      order: 'nome_completo.asc',
    }

    if (ativo !== 'all') {
      searchParams.ativo = `eq.${ativo}`
    }

    if (search.trim()) {
      searchParams.or = `(nome_completo.ilike.*${search.trim()}*,cpf.ilike.*${search.trim()}*,email.ilike.*${search.trim()}*,telefone.ilike.*${search.trim()}*,celular.ilike.*${search.trim()}*)`
    }

    const { data, count } = await supabaseRequest<Paciente[]>('pacientes', {
      searchParams,
      headers: { Prefer: 'count=exact' },
    })

    return Response.json({
      pacientes: data,
      totalPages: Math.ceil((count ?? 0) / pageSize),
      total: count ?? 0,
    })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 401 })
  }
}

export async function POST(req: Request) {
  try {
    await requireAuth()
    const body = await req.json()
    const { data } = await supabaseRequest<Paciente[]>('pacientes', {
      method: 'POST',
      body,
      searchParams: { select: '*' },
      headers: { Prefer: 'return=representation' },
    })
    return Response.json({ paciente: data[0] }, { status: 201 })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}
