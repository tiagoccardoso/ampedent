import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { supabaseRequest } from '@/lib/supabaseAdmin'
import { OdontogramaRegistro } from '@/lib/types'

async function requireAuth() {
  const role = await isSuperAdmin()
  if (role !== 'admin' && role !== 'superadmin') throw new Error('Não autorizado')
}

export async function GET(req: Request) {
  try {
    await requireAuth()
    const url = new URL(req.url)
    const pacienteId = url.searchParams.get('paciente_id')
    if (!pacienteId) return Response.json({ message: 'paciente_id obrigatório' }, { status: 400 })

    const { data } = await supabaseRequest<OdontogramaRegistro[]>('odontograma_registros', {
      searchParams: {
        select: '*,procedimentos(nome)',
        paciente_id: `eq.${pacienteId}`,
        order: 'dente_numero.asc,registrado_em.desc',
      },
    })

    return Response.json({ registros: data })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 401 })
  }
}

export async function POST(req: Request) {
  try {
    await requireAuth()
    const body = await req.json()
    const { data } = await supabaseRequest<OdontogramaRegistro[]>('odontograma_registros', {
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
