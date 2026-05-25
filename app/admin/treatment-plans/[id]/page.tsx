'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PlanoTratamento, ItemPlanoTratamento, Procedimento } from '@/lib/types'
import Spinner from '@/app/components/Spinner'

const STATUS_LABELS: Record<string, string> = {
  planejado: 'Planejado', aprovado: 'Aprovado', em_andamento: 'Em andamento',
  concluido: 'Concluído', cancelado: 'Cancelado',
}
const STATUS_CLASSES: Record<string, string> = {
  planejado: 'bg-gray-100 text-gray-600', aprovado: 'bg-blue-100 text-blue-700',
  em_andamento: 'bg-purple-100 text-purple-700', concluido: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-600',
}
const ITEM_STATUS_LABELS: Record<string, string> = {
  planejado: 'Planejado', em_andamento: 'Em andamento', concluido: 'Concluído', cancelado: 'Cancelado',
}

function formatCurrency(v: number | string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v))
}

function formatDateBR(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

export default function TreatmentPlanDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [plan, setPlan] = useState<PlanoTratamento & { itens?: ItemPlanoTratamento[] } | null>(null)
  const [procedures, setProcedures] = useState<Procedimento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // New item form
  const [showAddItem, setShowAddItem] = useState(false)
  const [itemProcedure, setItemProcedure] = useState('')
  const [itemDente, setItemDente] = useState('')
  const [itemFaces, setItemFaces] = useState('')
  const [itemStatus, setItemStatus] = useState('planejado')
  const [itemValor, setItemValor] = useState('')
  const [itemObs, setItemObs] = useState('')
  const [savingItem, setSavingItem] = useState(false)
  const [itemError, setItemError] = useState('')

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    document.title = 'Plano de Tratamento | Admin | DentalSys'
    load()
    loadProcedures()
  }, [params.id])

  async function load() {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/treatment-plans/${params.id}`)
      if (!res.ok) throw new Error('Plano não encontrado')
      const data = await res.json()
      // Merge itens into plan object
      setPlan({ ...data.plano, itens: data.itens ?? [] })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadProcedures() {
    const res = await fetch('/api/procedures?ativo=true&all=true')
    if (res.ok) {
      const data = await res.json()
      setProcedures(data.procedimentos ?? [])
    }
  }

  async function changeStatus(newStatus: string) {
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/treatment-plans/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) await load()
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function addItem() {
    if (!itemProcedure && !itemDente) {
      setItemError('Informe ao menos o procedimento ou o dente.')
      return
    }
    setSavingItem(true)
    setItemError('')
    try {
      const proc = procedures.find(p => p.id === itemProcedure)
      const res = await fetch(`/api/treatment-plans/${params.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          procedimento_id: itemProcedure || null,
          dente: itemDente || null,
          faces: itemFaces || null,
          status: itemStatus,
          valor: Number(itemValor.replace(',', '.')) || proc?.valor || 0,
          observacoes: itemObs || null,
          ordem: plan?.itens?.length ?? 0,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message ?? 'Erro ao adicionar item')
      // Reset form
      setItemProcedure(''); setItemDente(''); setItemFaces('')
      setItemStatus('planejado'); setItemValor(''); setItemObs('')
      setShowAddItem(false)
      await load()
    } catch (err: any) {
      setItemError(err.message)
    } finally {
      setSavingItem(false)
    }
  }

  async function removeItem(itemId: string) {
    if (!confirm('Remover este item do plano?')) return
    try {
      await fetch(`/api/treatment-plans/${params.id}/items?item_id=${itemId}`, { method: 'DELETE' })
      await load()
    } catch {}
  }

  if (isLoading) return <div className='flex justify-center py-16'><Spinner /></div>

  if (error || !plan) return (
    <div className='space-y-4'>
      <Link href='/admin/treatment-plans' className='text-gray-400 hover:text-gray-600 inline-flex items-center gap-1'>
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
        </svg>
        Voltar
      </Link>
      <div className='rounded-md bg-red-50 border border-red-200 p-4'>
        <p className='text-red-700 text-sm'>{error || 'Plano não encontrado.'}</p>
      </div>
    </div>
  )

  const itens = plan.itens ?? []
  const totalItens = itens.reduce((acc, i) => acc + Number(i.valor), 0)
  const paciente = (plan as any).pacientes

  return (
    <div className='space-y-6 max-w-4xl'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <Link href='/admin/treatment-plans' className='text-gray-400 hover:text-gray-600 transition-colors mt-1'>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
          </Link>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>{plan.titulo}</h1>
            {paciente && (
              <p className='text-sm text-gray-500 mt-0.5'>
                Paciente:{' '}
                <Link href={`/admin/patients/${plan.paciente_id}`} className='text-blue-600 hover:underline'>
                  {paciente.nome_completo}
                </Link>
              </p>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold mt-1 ${STATUS_CLASSES[plan.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABELS[plan.status] ?? plan.status}
        </span>
      </div>

      {/* Info card */}
      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
        <div className='grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100'>
          <div className='p-4'>
            <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1'>Valor estimado</p>
            <p className='text-xl font-bold text-gray-900'>{formatCurrency(plan.valor_total)}</p>
          </div>
          <div className='p-4'>
            <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1'>Início</p>
            <p className='text-gray-700'>{formatDateBR(plan.data_inicio)}</p>
          </div>
          <div className='p-4'>
            <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1'>Previsão de conclusão</p>
            <p className='text-gray-700'>{formatDateBR(plan.data_fim_prevista)}</p>
          </div>
        </div>
        {plan.observacoes && (
          <div className='border-t border-gray-100 p-4'>
            <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1'>Observações</p>
            <p className='text-gray-700 text-sm whitespace-pre-wrap'>{plan.observacoes}</p>
          </div>
        )}
      </div>

      {/* Status transition buttons */}
      {plan.status !== 'concluido' && plan.status !== 'cancelado' && (
        <div className='flex flex-wrap gap-2'>
          {plan.status === 'planejado' && (
            <button onClick={() => changeStatus('aprovado')} disabled={updatingStatus}
              className='px-4 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors'>
              Aprovar plano
            </button>
          )}
          {plan.status === 'aprovado' && (
            <button onClick={() => changeStatus('em_andamento')} disabled={updatingStatus}
              className='px-4 py-2 rounded-md text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors'>
              Iniciar tratamento
            </button>
          )}
          {plan.status === 'em_andamento' && (
            <button onClick={() => changeStatus('concluido')} disabled={updatingStatus}
              className='px-4 py-2 rounded-md text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors'>
              Concluir plano
            </button>
          )}
          <button onClick={() => changeStatus('cancelado')} disabled={updatingStatus}
            className='px-4 py-2 rounded-md text-sm font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors'>
            Cancelar plano
          </button>
        </div>
      )}

      {/* Items */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-gray-900'>Itens do plano</h2>
          <button onClick={() => setShowAddItem(v => !v)}
            className='px-3 py-1.5 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors'>
            {showAddItem ? 'Cancelar' : '+ Adicionar item'}
          </button>
        </div>

        {/* Add item form */}
        {showAddItem && (
          <div className='bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4'>
            <h3 className='text-sm font-semibold text-blue-800'>Novo item</h3>
            {itemError && <p className='text-red-700 text-xs'>{itemError}</p>}
            <div className='grid sm:grid-cols-2 gap-4'>
              <div>
                <label className='block text-gray-700 text-sm font-medium mb-1'>Procedimento</label>
                <select value={itemProcedure} onChange={e => {
                  setItemProcedure(e.target.value)
                  const proc = procedures.find(p => p.id === e.target.value)
                  if (proc && !itemValor) setItemValor(String(proc.valor))
                }} disabled={savingItem}>
                  <option value=''>Selecionar...</option>
                  {procedures.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} ({formatCurrency(p.valor)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-gray-700 text-sm font-medium mb-1'>Dente (nº)</label>
                <input type='text' value={itemDente} onChange={e => setItemDente(e.target.value)}
                  placeholder='Ex: 16' disabled={savingItem} />
              </div>
            </div>
            <div className='grid sm:grid-cols-3 gap-4'>
              <div>
                <label className='block text-gray-700 text-sm font-medium mb-1'>Faces</label>
                <input type='text' value={itemFaces} onChange={e => setItemFaces(e.target.value)}
                  placeholder='MOD, V...' disabled={savingItem} />
              </div>
              <div>
                <label className='block text-gray-700 text-sm font-medium mb-1'>Status</label>
                <select value={itemStatus} onChange={e => setItemStatus(e.target.value)} disabled={savingItem}>
                  <option value='planejado'>Planejado</option>
                  <option value='em_andamento'>Em andamento</option>
                  <option value='concluido'>Concluído</option>
                  <option value='cancelado'>Cancelado</option>
                </select>
              </div>
              <div>
                <label className='block text-gray-700 text-sm font-medium mb-1'>Valor (R$)</label>
                <input type='text' value={itemValor} onChange={e => setItemValor(e.target.value)}
                  placeholder='0,00' disabled={savingItem} />
              </div>
            </div>
            <div>
              <label className='block text-gray-700 text-sm font-medium mb-1'>Observações</label>
              <input type='text' value={itemObs} onChange={e => setItemObs(e.target.value)}
                placeholder='Observações adicionais...' disabled={savingItem} />
            </div>
            <button onClick={addItem} disabled={savingItem}
              className='px-5 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors'>
              {savingItem ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>
        )}

        {itens.length === 0 ? (
          <div className='bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400'>
            Nenhum item adicionado ainda.
          </div>
        ) : (
          <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='bg-gray-50'>
                  <tr className='border-b border-gray-200'>
                    <th className='h-10 px-4 text-left font-semibold text-gray-600'>Procedimento</th>
                    <th className='h-10 px-4 text-left font-semibold text-gray-600 hidden sm:table-cell'>Dente</th>
                    <th className='h-10 px-4 text-left font-semibold text-gray-600'>Status</th>
                    <th className='h-10 px-4 text-right font-semibold text-gray-600'>Valor</th>
                    <th className='h-10 px-4 text-right font-semibold text-gray-600'></th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {itens.map(item => (
                    <tr key={item.id} className='hover:bg-gray-50'>
                      <td className='px-4 py-3 text-gray-900'>
                        {(item.procedimentos as any)?.nome ?? '—'}
                        {item.observacoes && (
                          <div className='text-xs text-gray-400'>{item.observacoes}</div>
                        )}
                      </td>
                      <td className='px-4 py-3 text-gray-600 hidden sm:table-cell'>
                        {item.dente ?? '—'}
                        {item.faces && <span className='text-xs text-gray-400 ml-1'>({item.faces})</span>}
                      </td>
                      <td className='px-4 py-3'>
                        <span className='text-xs text-gray-600'>{ITEM_STATUS_LABELS[item.status] ?? item.status}</span>
                      </td>
                      <td className='px-4 py-3 text-right font-medium text-gray-900'>{formatCurrency(item.valor)}</td>
                      <td className='px-4 py-3 text-right'>
                        <button onClick={() => removeItem(item.id)}
                          className='text-xs text-red-500 hover:text-red-700 transition-colors'>
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className='border-t border-gray-200 bg-gray-50'>
                  <tr>
                    <td colSpan={3} className='px-4 py-3 text-sm font-semibold text-gray-700'>Total dos itens</td>
                    <td className='px-4 py-3 text-right font-bold text-gray-900'>{formatCurrency(totalItens)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
