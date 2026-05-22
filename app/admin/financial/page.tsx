'use client'

import { useEffect, useState, useCallback } from 'react'
import { FinanceiroRegistro, FinancialStatus, PaymentMethod } from '@/lib/types'

const STATUS_LABELS: Record<FinancialStatus, string> = {
  pendente: 'Pendente', parcial: 'Parcial', pago: 'Pago', vencido: 'Vencido', cancelado: 'Cancelado',
}
const STATUS_COLORS: Record<FinancialStatus, string> = {
  pendente: 'bg-amber-100 text-amber-700',
  parcial: 'bg-blue-100 text-blue-700',
  pago: 'bg-green-100 text-green-700',
  vencido: 'bg-red-100 text-red-700',
  cancelado: 'bg-gray-100 text-gray-500',
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  dinheiro: 'Dinheiro',
  cartao_debito: 'Cartão de débito',
  cartao_credito: 'Cartão de crédito',
  pix: 'PIX',
  transferencia: 'Transferência',
  parcelado: 'Parcelado',
  convenio: 'Convênio',
  outro: 'Outro',
}

const FINANCIAL_STATUSES = Object.keys(STATUS_LABELS) as FinancialStatus[]
const PAYMENT_METHODS = Object.keys(PAYMENT_LABELS) as PaymentMethod[]

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

type NewFormData = {
  paciente_id: string
  paciente_nome: string
  descricao: string
  valor_total: string
  forma_pagamento: PaymentMethod | ''
  data_vencimento: string
  numero_parcelas: string
  observacoes: string
}

export default function FinancialPage() {
  const [registros, setRegistros] = useState<FinanceiroRegistro[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<NewFormData>({
    paciente_id: '', paciente_nome: '', descricao: '', valor_total: '',
    forma_pagamento: '', data_vencimento: '', numero_parcelas: '1', observacoes: '',
  })
  const [pacienteSuggestions, setPacienteSuggestions] = useState<{ id: string; nome_completo: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    document.title = 'Financeiro | DentalSys'
  }, [])

  const load = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/financial?${params}`)
      if (!res.ok) throw new Error('Erro ao carregar')
      const data = await res.json()
      setRegistros(data.registros)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [search, statusFilter, page])

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [load, search])

  async function searchPacientes(q: string) {
    if (!q.trim()) { setPacienteSuggestions([]); return }
    const res = await fetch(`/api/patients?search=${q}&page=1`)
    if (res.ok) {
      const data = await res.json()
      setPacienteSuggestions(data.pacientes.slice(0, 5))
    }
  }

  async function handleSave() {
    if (!form.paciente_id) { setFormError('Selecione um paciente'); return }
    if (!form.descricao.trim()) { setFormError('Descrição obrigatória'); return }
    if (!form.valor_total) { setFormError('Valor obrigatório'); return }
    setSaving(true)
    setFormError('')
    try {
      const body = {
        paciente_id: form.paciente_id,
        descricao: form.descricao,
        valor_total: Number(form.valor_total),
        valor_pago: 0,
        forma_pagamento: form.forma_pagamento || null,
        data_vencimento: form.data_vencimento || null,
        numero_parcelas: Number(form.numero_parcelas) || 1,
        observacoes: form.observacoes || null,
        status: 'pendente',
      }
      const res = await fetch('/api/financial', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.message ?? 'Erro ao salvar')
      }
      setShowForm(false)
      setForm({ paciente_id: '', paciente_nome: '', descricao: '', valor_total: '', forma_pagamento: '', data_vencimento: '', numero_parcelas: '1', observacoes: '' })
      load()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleMarkPaid(r: FinanceiroRegistro) {
    await fetch(`/api/financial/${r.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'pago', valor_pago: r.valor_total, data_pagamento: new Date().toISOString().split('T')[0] }),
    })
    load()
  }

  const pendingTotal = registros.filter(r => ['pendente', 'parcial', 'vencido'].includes(r.status))
    .reduce((acc, r) => acc + (r.valor_total - r.valor_pago), 0)

  return (
    <div className='space-y-5'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Financeiro</h1>
          <p className='text-sm text-gray-500 mt-0.5'>{total} registro{total !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormError('') }}
          className='inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors'>
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
          </svg>
          Novo lançamento
        </button>
      </div>

      {registros.length > 0 && (
        <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
          <div className='bg-red-50 rounded-xl border border-red-100 p-4'>
            <div className='text-xs text-red-500 font-medium'>A receber</div>
            <div className='text-xl font-bold text-red-700 mt-0.5'>{formatCurrency(pendingTotal)}</div>
          </div>
        </div>
      )}

      {showForm && (
        <div className='bg-white rounded-xl border border-blue-200 p-5 space-y-4'>
          <h3 className='font-semibold text-gray-900'>Novo lançamento financeiro</h3>
          <div className='relative'>
            <label>Paciente *</label>
            <input
              type='text'
              value={form.paciente_nome}
              placeholder='Digite o nome do paciente...'
              onChange={e => {
                setForm(f => ({ ...f, paciente_nome: e.target.value, paciente_id: '' }))
                searchPacientes(e.target.value)
              }}
            />
            {pacienteSuggestions.length > 0 && (
              <div className='absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 w-full'>
                {pacienteSuggestions.map(p => (
                  <button key={p.id} type='button' className='w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors'
                    onClick={() => {
                      setForm(f => ({ ...f, paciente_id: p.id, paciente_nome: p.nome_completo }))
                      setPacienteSuggestions([])
                    }}>
                    {p.nome_completo}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label>Descrição *</label>
            <input type='text' value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
          </div>
          <div className='grid sm:grid-cols-3 gap-4'>
            <div>
              <label>Valor total (R$) *</label>
              <input type='number' min='0' step='0.01' value={form.valor_total}
                onChange={e => setForm(f => ({ ...f, valor_total: e.target.value }))} />
            </div>
            <div>
              <label>Forma de pagamento</label>
              <select value={form.forma_pagamento}
                onChange={e => setForm(f => ({ ...f, forma_pagamento: e.target.value as PaymentMethod }))}>
                <option value=''>Selecionar</option>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{PAYMENT_LABELS[m]}</option>)}
              </select>
            </div>
            <div>
              <label>Vencimento</label>
              <input type='date' value={form.data_vencimento} onChange={e => setForm(f => ({ ...f, data_vencimento: e.target.value }))} />
            </div>
          </div>
          <div>
            <label>Observações</label>
            <textarea rows={2} value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} />
          </div>
          {formError && <p className='text-red-600 text-sm'>{formError}</p>}
          <div className='flex gap-3'>
            <button onClick={handleSave} disabled={saving}
              className='px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50'>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={() => setShowForm(false)}
              className='px-4 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50'>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className='flex gap-3 flex-wrap'>
        <input type='search' value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder='Buscar por descrição...' className='flex-1 min-w-[200px]' />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className='w-auto'>
          <option value=''>Todos os status</option>
          {FINANCIAL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {error && <div className='rounded-md bg-red-50 border border-red-200 p-4'><p className='text-red-700 text-sm'>{error}</p></div>}

      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50 border-b border-gray-200'>
                <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide'>Paciente / Descrição</th>
                <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell'>Valor</th>
                <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell'>Vencimento</th>
                <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide'>Status</th>
                <th className='px-4 py-3' />
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className='px-4 py-3'><div className='h-4 bg-gray-200 rounded animate-pulse' /></td>
                    ))}
                  </tr>
                ))
              ) : registros.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-4 py-12 text-center text-gray-400 text-sm'>
                    Nenhum registro financeiro encontrado
                  </td>
                </tr>
              ) : (
                registros.map(r => (
                  <tr key={r.id} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-4 py-3'>
                      {r.pacientes && <div className='font-medium text-gray-900'>{r.pacientes.nome_completo}</div>}
                      <div className='text-xs text-gray-500'>{r.descricao}</div>
                    </td>
                    <td className='px-4 py-3 hidden sm:table-cell'>
                      <div className='font-medium text-gray-900'>{formatCurrency(r.valor_total)}</div>
                      {r.valor_pago > 0 && r.valor_pago < r.valor_total && (
                        <div className='text-xs text-green-600'>Pago: {formatCurrency(r.valor_pago)}</div>
                      )}
                    </td>
                    <td className='px-4 py-3 text-gray-500 hidden md:table-cell'>
                      {r.data_vencimento ? formatDate(r.data_vencimento) : '—'}
                    </td>
                    <td className='px-4 py-3'>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[r.status]}`}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-right'>
                      {['pendente', 'parcial', 'vencido'].includes(r.status) && (
                        <button
                          onClick={() => handleMarkPaid(r)}
                          className='text-xs px-2.5 py-1 rounded border border-green-300 text-green-600 hover:bg-green-50 transition-colors'>
                          Receber
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-2'>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className='px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50'>
            Anterior
          </button>
          <span className='text-sm text-gray-600'>Página {page} de {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className='px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50'>
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}
