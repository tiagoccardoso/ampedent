import { requireAdmin } from '@/lib/authHelpers'
import { getDb } from '@/lib/db'

export async function GET(req: Request) {
  try {
    await requireAdmin()
    const sql = getDb()

    const url = new URL(req.url)
    const from = url.searchParams.get('from') ?? new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
    const to = url.searchParams.get('to') ?? new Date().toISOString().split('T')[0]

    const toEnd = `${to} 23:59:59`

    const [
      bookingStats,
      patientStats,
      financialStats,
      clinicalStats,
      topProcedures,
    ] = await Promise.all([
      // Bookings by status in period
      sql`
        SELECT status, COUNT(*)::int AS count
        FROM bookings
        WHERE created_at >= ${from} AND created_at <= ${toEnd}
        GROUP BY status
      `,

      // Patient stats
      sql`
        SELECT
          COUNT(*)::int AS total_geral,
          COUNT(*) FILTER (WHERE created_at >= ${from} AND created_at <= ${toEnd})::int AS novos_periodo,
          COUNT(*) FILTER (WHERE ativo = TRUE)::int AS ativos
        FROM pacientes
      `,

      // Financial stats in period
      sql`
        SELECT
          COUNT(*)::int AS total_registros,
          COALESCE(SUM(valor_total), 0)::numeric AS valor_total,
          COALESCE(SUM(valor_pago), 0)::numeric AS valor_pago,
          COALESCE(SUM(valor_total) FILTER (WHERE status = 'pendente'), 0)::numeric AS pendente,
          COALESCE(SUM(valor_pago) FILTER (WHERE status = 'pago'), 0)::numeric AS recebido,
          COALESCE(SUM(valor_total) FILTER (WHERE status = 'vencido'), 0)::numeric AS vencido
        FROM financeiro_registros
        WHERE created_at >= ${from} AND created_at <= ${toEnd}
      `,

      // Clinical records in period
      sql`
        SELECT COUNT(*)::int AS total
        FROM evolucoes_clinicas
        WHERE created_at >= ${from} AND created_at <= ${toEnd}
      `,

      // Top procedures by frequency (from itens_plano_tratamento + clinical)
      sql`
        SELECT p.nome, p.categoria, COUNT(i.id)::int AS uso
        FROM procedimentos p
        LEFT JOIN itens_plano_tratamento i ON i.procedimento_id = p.id
          AND i.created_at >= ${from} AND i.created_at <= ${toEnd}
        WHERE p.ativo = TRUE
        GROUP BY p.id, p.nome, p.categoria
        ORDER BY uso DESC
        LIMIT 10
      `,
    ])

    const bookingByStatus: Record<string, number> = {}
    for (const row of bookingStats as any[]) {
      bookingByStatus[row.status] = row.count
    }
    const totalBookings = Object.values(bookingByStatus).reduce((a, b) => a + b, 0)

    return Response.json({
      period: { from, to },
      bookings: {
        total: totalBookings,
        by_status: bookingByStatus,
      },
      patients: (patientStats as any[])[0],
      financial: (financialStats as any[])[0],
      clinical_records: (clinicalStats as any[])[0]?.total ?? 0,
      top_procedures: topProcedures,
    })
  } catch (error: any) {
    if (error.message === 'Não autorizado') {
      return Response.json({ message: 'Não autorizado.' }, { status: 401 })
    }
    console.error('[/api/reports]', error.message)
    return Response.json({ message: 'Erro ao gerar relatório.' }, { status: 500 })
  }
}
