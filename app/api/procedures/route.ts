import { requireStaff } from '@/lib/authHelpers'
import { supabaseRequest } from '@/lib/supabaseAdmin'
import { Procedimento } from '@/lib/types'

export async function GET(req: Request) {
  try {
    await requireStaff()
    const url = new URL(req.url)
    const categoria = url.searchParams.get('categoria') ?? ''
    const search = url.searchParams.get('search') ?? ''
    const ativo = url.searchParams.get('ativo') ?? 'true'
    const all = url.searchParams.get('all') === 'true'

    const searchParams: Record<string, string | number | undefined> = {
      select: '*',
      order: 'categoria.asc,nome.asc',
    }

    if (!all) {
      searchParams.limit = 100
    }

    if (ativo !== 'all') {
      searchParams.ativo = `eq.${ativo}`
    }

    if (categoria) {
      searchParams.categoria = `eq.${categoria}`
    }

    if (search.trim()) {
      searchParams.nome = `ilike.*${search.trim()}*`
    }

    const { data } = await supabaseRequest<Procedimento[]>('procedimentos', { searchParams })
    return Response.json({ procedimentos: data })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 401 })
  }
}

export async function POST(req: Request) {
  try {
    await requireStaff()
    const body = await req.json()
    const { data } = await supabaseRequest<Procedimento[]>('procedimentos', {
      method: 'POST',
      body,
      searchParams: { select: '*' },
      headers: { Prefer: 'return=representation' },
    })
    return Response.json({ procedimento: data[0] }, { status: 201 })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}
