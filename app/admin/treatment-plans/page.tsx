'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/components/AppProvider'
import { useRouter } from 'next/navigation'
import { PlanoTratamento, TreatmentPlanStatus } from '@/lib/types'
import Spinner from '@/app/components/Spinner'
import Pagination from '@/app/components/admin/Pagination'

const STATUS_LABELS: Record<string, string> = {
  planejado: 'Planejado',
  aprovado: 'Aprovado',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

const STATUS_CLASSES: Record<string, string> = {
  planejado: 'bg-gray-100 text-gray-600',
  aprovado: 'bg-blue-100 text-blue-700',
  em_andamento: 'bg-purple-100 text-purple-700',
  concluido: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-600',
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function formatDateBR(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

export default function TreatmentPlansPage() {
  const { status, session } = useAuth()
  const router = useRouter()

  const [plans, setPlans] = useState<PlanoTratamento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    document.title = 'Planos de Tratamento | Admin | DentalSys'
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin')
  }, [status, router])

  useEffect(() => {
    setPage(1)
  }, [statusFilter])

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const params = new URLSearchParams({ page: String(page) })
        if (statusFilter !== 'all') params.set('status', statusFilter)
        const res = await fetch(`/api/treatment-plans?${params}`)
        if (!res.ok) throw new Error('Erro ao carregar planos')
        const data = await res.json()
        setPlans(data.planos ?? [])
        setPages(data.totalPages ?? 1)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    if (status === 'authenticated') load()
  }, [statusFilter, page, status])

  const canCreate = session?.role !== 'paciente'

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Planos de Tratamento</h1>
          <p className='text-sm text-gray-500 mt-0.5'>Gerencie os planos e orçamentos dos pacientes</p>
        </div>
        {canCreate && (
          <Link href='/admin/treatment-plans/create'
            className='px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors'>
            + Novo plano
          </Link>
        )}
      </div>

      {error && (
        <div className='rounded-md bg-red-50 border border-red-200 p-4'>
          <p className='text-red-700 text-sm'>{error}</p>
        </div>
      )}

      <div className='flex gap-2 flex-wrap'>
        {['all', 'planejado', 'aprovado', 'em_andamento', 'concluido', 'cancelado'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              statusFilter === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}>
            {s === 'all' ? 'Todos' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className='flex justify-center py-12'><Spinner /></div>
      ) : plans.length === 0 ? (
        <div className='rounded-xl border border-gray-200 bg-white p-12 text-center'>
          <svg className='mx-auto w-10 h-10 text-gray-300 mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5}
              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
          </svg>
          <p className='text-sm text-gray-500'>Nenhum plano encontrado</p>
          {canCreate && (
            <Link href='/admin/treatment-plans/create'
              className='mt-3 inline-block text-sm text-blue-600 hover:underline'>
              Criar primeiro plano
            </Link>
          )}
        </div>
      ) : (
        <div className='rounded-lg border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50'>
                <tr className='border-b border-gray-200'>
                  <th className='h-11 px-4 text-left font-semibold text-gray-600'>Paciente</th>
                  <th className='h-11 px-4 text-left font-semibold text-gray-600 hidden md:table-cell'>Título</th>
                  <th className='h-11 px-4 text-left font-semibold text-gray-600'>Status</th>
                  <th className='h-11 px-4 text-left font-semibold text-gray-600 hidden sm:table-cell'>Valor total</th>
                  <th className='h-11 px-4 text-left font-semibold text-gray-600 hidden lg:table-cell'>Início</th>
                  <th className='h-11 px-4 text-right font-semibold text-gray-600'>Ação</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {plans.map(p => (
                  <tr key={p.id} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-4 py-3 font-medium text-gray-900'>
                      {(p.pacientes as any)?.nome_completo ?? '—'}
                      <div className='text-xs text-gray-500 md:hidden'>{p.titulo}</div>
                    </td>
                    <td className='px-4 py-3 text-gray-600 hidden md:table-cell'>{p.titulo}</td>
                    <td className='px-4 py-3'>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-gray-700 hidden sm:table-cell'>{formatCurrency(Number(p.valor_total))}</td>
                    <td className='px-4 py-3 text-gray-500 hidden lg:table-cell'>{formatDateBR(p.data_inicio)}</td>
                    <td className='px-4 py-3 text-right'>
                      <Link href={`/admin/treatment-plans/${p.id}`}
                        className='btn text-xs px-3 py-1.5'>
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pages > 1 && <Pagination page={page} setPage={setPage} pages={pages} />}
    </div>
  )
}
