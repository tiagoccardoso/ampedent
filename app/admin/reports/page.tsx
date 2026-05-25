'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/components/AppProvider'
import { useRouter } from 'next/navigation'
import Spinner from '@/app/components/Spinner'

type ReportData = {
  period: { from: string; to: string }
  bookings: { total: number; by_status: Record<string, number> }
  patients: { total_geral: number; novos_periodo: number; ativos: number }
  financial: {
    total_registros: number
    valor_total: number
    valor_pago: number
    pendente: number
    recebido: number
    vencido: number
  }
  clinical_records: number
  top_procedures: { nome: string; categoria: string; uso: number }[]
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente', confirmada: 'Confirmada', em_atendimento: 'Em atendimento',
  completed: 'Concluído', canceled: 'Cancelado', faltou: 'Faltou',
}

function formatCurrency(v: number | string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v))
}

function formatDateBR(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

const PERIOD_OPTIONS = [
  { label: 'Últimos 7 dias', days: 7 },
  { label: 'Últimos 30 dias', days: 30 },
  { label: 'Últimos 90 dias', days: 90 },
  { label: 'Este ano', days: 365 },
]

function StatCard({ label, value, sub, color = 'text-gray-900' }: {
  label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-5'>
      <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1'>{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className='text-xs text-gray-400 mt-0.5'>{sub}</p>}
    </div>
  )
}

export default function ReportsPage() {
  const { status, session } = useAuth()
  const router = useRouter()

  const [data, setData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const [from, setFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 29)
    return d.toISOString().split('T')[0]
  })
  const [to, setTo] = useState(today)
  const [selectedPreset, setSelectedPreset] = useState(1) // 30 days default

  useEffect(() => {
    document.title = 'Relatórios | Admin | DentalSys'
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin')
    if (status === 'authenticated' && session?.role !== 'admin' && session?.role !== 'superadmin') {
      router.push('/admin/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated') load()
  }, [from, to, status])

  async function load() {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/reports?from=${from}&to=${to}`)
      if (!res.ok) throw new Error('Erro ao carregar relatório')
      setData(await res.json())
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  function applyPreset(days: number, idx: number) {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - (days - 1))
    setTo(end.toISOString().split('T')[0])
    setFrom(start.toISOString().split('T')[0])
    setSelectedPreset(idx)
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Relatórios</h1>
        <p className='text-sm text-gray-500 mt-0.5'>Análise de desempenho da clínica</p>
      </div>

      {/* Period selector */}
      <div className='bg-white rounded-xl border border-gray-200 p-4 space-y-4'>
        <div className='flex flex-wrap gap-2'>
          {PERIOD_OPTIONS.map((opt, i) => (
            <button key={i} onClick={() => applyPreset(opt.days, i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                selectedPreset === i
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
        <div className='flex flex-wrap items-end gap-4'>
          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>De</label>
            <input type='date' value={from} max={to}
              onChange={e => { setFrom(e.target.value); setSelectedPreset(-1) }}
              className='text-sm' />
          </div>
          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>Até</label>
            <input type='date' value={to} min={from} max={today}
              onChange={e => { setTo(e.target.value); setSelectedPreset(-1) }}
              className='text-sm' />
          </div>
          {data && (
            <p className='text-xs text-gray-400 pb-2'>
              {formatDateBR(data.period.from)} – {formatDateBR(data.period.to)}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className='rounded-md bg-red-50 border border-red-200 p-4'>
          <p className='text-red-700 text-sm'>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className='flex justify-center py-16'><Spinner /></div>
      ) : data ? (
        <div className='space-y-6'>
          {/* Patients */}
          <section>
            <h2 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3'>Pacientes</h2>
            <div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
              <StatCard label='Total geral' value={data.patients.total_geral} color='text-blue-600' />
              <StatCard label='Novos no período' value={data.patients.novos_periodo} color='text-blue-600' />
              <StatCard label='Ativos' value={data.patients.ativos} color='text-green-600' />
            </div>
          </section>

          {/* Bookings */}
          <section>
            <h2 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3'>Agendamentos no período</h2>
            <div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
              <StatCard label='Total' value={data.bookings.total} color='text-gray-900' />
              {Object.entries(data.bookings.by_status).map(([s, count]) => (
                <StatCard key={s} label={STATUS_LABELS[s] ?? s} value={count} />
              ))}
            </div>
          </section>

          {/* Financial */}
          <section>
            <h2 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3'>Financeiro no período</h2>
            <div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
              <StatCard label='Total faturado' value={formatCurrency(data.financial.valor_total)} color='text-gray-900' />
              <StatCard label='Recebido' value={formatCurrency(data.financial.recebido)} color='text-green-600' />
              <StatCard label='Pendente' value={formatCurrency(data.financial.pendente)} color='text-amber-600' />
              <StatCard label='Vencido' value={formatCurrency(data.financial.vencido)} color='text-red-600' />
              <StatCard label='Registros financeiros' value={data.financial.total_registros} />
            </div>
          </section>

          {/* Clinical records */}
          <section>
            <h2 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3'>Atendimentos clínicos</h2>
            <div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
              <StatCard label='Evoluções registradas' value={data.clinical_records} color='text-purple-600' />
            </div>
          </section>

          {/* Top procedures */}
          {data.top_procedures.filter(p => p.uso > 0).length > 0 && (
            <section>
              <h2 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3'>Procedimentos mais utilizados</h2>
              <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
                <table className='w-full text-sm'>
                  <thead className='bg-gray-50'>
                    <tr className='border-b border-gray-200'>
                      <th className='h-10 px-4 text-left font-semibold text-gray-600'>Procedimento</th>
                      <th className='h-10 px-4 text-left font-semibold text-gray-600 hidden sm:table-cell'>Categoria</th>
                      <th className='h-10 px-4 text-right font-semibold text-gray-600'>Usos</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {data.top_procedures.filter(p => p.uso > 0).map((p, i) => (
                      <tr key={i} className='hover:bg-gray-50'>
                        <td className='px-4 py-3 text-gray-900'>{p.nome}</td>
                        <td className='px-4 py-3 text-gray-500 hidden sm:table-cell capitalize'>{p.categoria}</td>
                        <td className='px-4 py-3 text-right font-semibold text-gray-900'>{p.uso}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      ) : null}
    </div>
  )
}
