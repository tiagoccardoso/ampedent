import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { supabaseRequest } from '@/lib/supabaseAdmin'

async function requireAuth() {
  const role = await isSuperAdmin()
  if (role !== 'admin' && role !== 'superadmin') throw new Error('Não autorizado')
}

async function countTable(table: string, filter?: Record<string, string>) {
  const searchParams: Record<string, string> = { select: 'id', ...filter }
  const { count } = await supabaseRequest<unknown[]>(table, {
    searchParams,
    headers: { Prefer: 'count=exact' },
  })
  return count ?? 0
}

export async function GET() {
  try {
    await requireAuth()

    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

    const [totalPacientes, agendamentosPendentes, pacientesMes] = await Promise.all([
      countTable('pacientes', { ativo: 'eq.true' }),
      countTable('bookings', { status: 'eq.pending' }),
      countTable('pacientes', { created_at: `gte.${firstOfMonth}`, ativo: 'eq.true' }),
    ])

    const { data: financeiro } = await supabaseRequest<{ valor_total: number; valor_pago: number; status: string }[]>(
      'financeiro_registros',
      {
        searchParams: {
          select: 'valor_total,valor_pago,status',
          status: 'in.(pendente,parcial,vencido)',
        },
      },
    )

    const receitaPendente = financeiro.reduce((acc, r) => acc + (r.valor_total - r.valor_pago), 0)

    const { data: financeiroMes } = await supabaseRequest<{ valor_pago: number }[]>(
      'financeiro_registros',
      {
        searchParams: {
          select: 'valor_pago',
          status: 'eq.pago',
          data_pagamento: `gte.${firstOfMonth}`,
        },
      },
    )

    const receitaMes = financeiroMes.reduce((acc, r) => acc + r.valor_pago, 0)

    return Response.json({
      totalPacientes,
      agendamentosPendentes,
      receitaPendente,
      receitaMes,
      pacientesMes,
    })
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 401 })
  }
}
