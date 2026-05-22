import { requireStaff } from '@/lib/authHelpers'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    await requireStaff()
    const sql = getDb()

    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

    const [
      totalPacientesRows,
      pendingRows,
      pacientesMesRows,
      financeiroRows,
      receitaMesRows,
    ] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM pacientes WHERE ativo = true`,
      sql`SELECT COUNT(*)::int AS count FROM bookings WHERE status = 'pending'`,
      sql`SELECT COUNT(*)::int AS count FROM pacientes WHERE ativo = true AND created_at >= ${firstOfMonth}`,
      sql`SELECT valor_total, valor_pago FROM financeiro_registros WHERE status IN ('pendente', 'parcial', 'vencido')`,
      sql`SELECT valor_pago FROM financeiro_registros WHERE status = 'pago' AND data_pagamento >= ${firstOfMonth}`,
    ])

    const totalPacientes = (totalPacientesRows[0] as { count: number }).count
    const agendamentosPendentes = (pendingRows[0] as { count: number }).count
    const pacientesMes = (pacientesMesRows[0] as { count: number }).count

    const receitaPendente = (financeiroRows as { valor_total: number; valor_pago: number }[])
      .reduce((acc, r) => acc + (r.valor_total - r.valor_pago), 0)

    const receitaMes = (receitaMesRows as { valor_pago: number }[])
      .reduce((acc, r) => acc + r.valor_pago, 0)

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
