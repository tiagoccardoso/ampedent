import { requireStaff } from '@/lib/authHelpers'
import { supabaseRequest } from '@/lib/supabaseAdmin'
import { Paciente, Anamnese } from '@/lib/types'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    const url = new URL(req.url)
    const include = url.searchParams.get('include') ?? ''

    const { data: pacientes } = await supabaseRequest<Paciente[]>('pacientes', {
      searchParams: { select: '*', id: `eq.${id}`, limit: 1 },
    })

    if (!pacientes[0]) {
      return Response.json({ message: 'Paciente não encontrado' }, { status: 404 })
    }

    const result: Record<string, unknown> = { paciente: pacientes[0] }

    if (include.includes('anamnese')) {
      const { data } = await supabaseRequest<Anamnese[]>('anamneses', {
        searchParams: { select: '*', paciente_id: `eq.${id}`, limit: 1 },
      })
      result.anamnese = data[0] ?? null
    }

    return Response.json(result)
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    const body = await req.json()

    const { anamnese, ...pacienteData } = body

    const { data } = await supabaseRequest<Paciente[]>('pacientes', {
      method: 'PATCH',
      body: pacienteData,
      searchParams: { id: `eq.${id}`, select: '*' },
      headers: { Prefer: 'return=representation' },
    })

    if (anamnese !== undefined) {
      const { data: existing } = await supabaseRequest<Anamnese[]>('anamneses', {
        searchParams: { paciente_id: `eq.${id}`, limit: 1 },
      })
      if (existing[0]) {
        await supabaseRequest('anamneses', {
          method: 'PATCH',
          body: anamnese,
          searchParams: { paciente_id: `eq.${id}` },
        })
      } else {
        await supabaseRequest('anamneses', {
          method: 'POST',
          body: { ...anamnese, paciente_id: id },
          headers: { Prefer: 'return=minimal' },
        })
      }
    }

    return Response.json({ paciente: data[0] })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff()
    const { id } = await params
    await supabaseRequest('pacientes', {
      method: 'PATCH',
      body: { ativo: false },
      searchParams: { id: `eq.${id}` },
    })
    return Response.json({ message: 'Paciente desativado' })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 400 })
  }
}
