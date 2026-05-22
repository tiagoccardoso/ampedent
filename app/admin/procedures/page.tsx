'use client'

import { useEffect, useState } from 'react'
import { Procedimento, ProcedureCategory } from '@/lib/types'

const CATEGORY_LABELS: Record<ProcedureCategory, string> = {
  preventivo: 'Preventivo',
  restaurador: 'Restaurador',
  endodontia: 'Endodontia',
  periodontia: 'Periodontia',
  cirurgia: 'Cirurgia',
  ortodontia: 'Ortodontia',
  protese: 'Prótese',
  implantodontia: 'Implantodontia',
  estetica: 'Estética',
  odontopediatria: 'Odontopediatria',
  radiologia: 'Radiologia',
  outro: 'Outro',
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProcedureCategory[]

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

type FormData = {
  nome: string
  categoria: ProcedureCategory
  duracao_minutos: string
  valor: string
  descricao: string
}

const EMPTY_FORM: FormData = {
  nome: '', categoria: 'outro', duracao_minutos: '60', valor: '', descricao: '',
}

export default function ProceduresPage() {
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([])
  const [search, setSearch] = useState('')
  const [categoria, setCategoria] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    document.title = 'Procedimentos | AmpeDent'
  }, [])

  async function load() {
    setIsLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ ativo: 'all', all: 'true' })
      if (categoria) params.set('categoria', categoria)
      if (search) params.set('search', search)
      const res = await fetch(`/api/procedures?${params}`)
      if (!res.ok) throw new Error('Erro ao carregar')
      const data = await res.json()
      setProcedimentos(data.procedimentos)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [search, categoria])

  function handleEdit(p: Procedimento) {
    setEditingId(p.id)
    setForm({
      nome: p.nome,
      categoria: p.categoria,
      duracao_minutos: String(p.duracao_minutos),
      valor: String(p.valor),
      descricao: p.descricao ?? '',
    })
    setShowForm(true)
    setFormError('')
  }

  async function handleSave() {
    if (!form.nome.trim()) { setFormError('Nome obrigatório'); return }
    setSaving(true)
    setFormError('')
    try {
      const body = {
        nome: form.nome.trim(),
        categoria: form.categoria,
        duracao_minutos: Number(form.duracao_minutos),
        valor: Number(form.valor),
        descricao: form.descricao || null,
      }
      let res: Response
      if (editingId) {
        res = await fetch(`/api/procedures/${editingId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/procedures', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
      }
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.message ?? 'Erro ao salvar')
      }
      setShowForm(false)
      setEditingId(null)
      setForm(EMPTY_FORM)
      load()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleAtivo(p: Procedimento) {
    await fetch(`/api/procedures/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !p.ativo }),
    })
    load()
  }

  const byCategory = CATEGORIES.reduce((acc, cat) => {
    const items = procedimentos.filter(p => p.categoria === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {} as Record<ProcedureCategory, Procedimento[]>)

  return (
    <div className='space-y-5'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Procedimentos</h1>
          <p className='text-sm text-gray-500 mt-0.5'>Tabela de preços</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); setFormError('') }}
          className='inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors'>
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
          </svg>
          Novo procedimento
        </button>
      </div>

      {showForm && (
        <div className='bg-white rounded-xl border border-blue-200 p-5 space-y-4'>
          <h3 className='font-semibold text-gray-900'>{editingId ? 'Editar procedimento' : 'Novo procedimento'}</h3>
          <div className='grid sm:grid-cols-2 gap-4'>
            <div className='sm:col-span-2'>
              <label>Nome *</label>
              <input type='text' value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div>
              <label>Categoria</label>
              <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value as ProcedureCategory }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label>Duração (minutos)</label>
              <input type='number' min='5' step='5' value={form.duracao_minutos}
                onChange={e => setForm(f => ({ ...f, duracao_minutos: e.target.value }))} />
            </div>
            <div>
              <label>Valor (R$)</label>
              <input type='number' min='0' step='0.01' value={form.valor}
                onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} />
            </div>
            <div>
              <label>Descrição</label>
              <input type='text' value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
            </div>
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

      <div className='flex gap-3'>
        <input type='search' value={search} onChange={e => setSearch(e.target.value)}
          placeholder='Buscar procedimento...' className='flex-1' />
        <select value={categoria} onChange={e => setCategoria(e.target.value)} className='w-auto min-w-[160px]'>
          <option value=''>Todas as categorias</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
      </div>

      {error && <div className='rounded-md bg-red-50 border border-red-200 p-4'><p className='text-red-700 text-sm'>{error}</p></div>}

      {isLoading ? (
        <div className='space-y-3'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='bg-white rounded-xl border border-gray-200 p-4 animate-pulse h-16' />
          ))}
        </div>
      ) : procedimentos.length === 0 ? (
        <div className='bg-white rounded-xl border border-gray-200 py-12 text-center text-gray-400 text-sm'>
          Nenhum procedimento encontrado
        </div>
      ) : (
        <div className='space-y-6'>
          {(Object.entries(byCategory) as [ProcedureCategory, Procedimento[]][]).map(([cat, items]) => (
            <div key={cat}>
              <h2 className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2'>{CATEGORY_LABELS[cat]}</h2>
              <div className='bg-white rounded-xl border border-gray-200 divide-y divide-gray-100'>
                {items.map(p => (
                  <div key={p.id} className={`flex items-center justify-between px-4 py-3 gap-3 ${!p.ativo ? 'opacity-50' : ''}`}>
                    <div className='flex-1 min-w-0'>
                      <div className='font-medium text-gray-900 text-sm'>{p.nome}</div>
                      <div className='text-xs text-gray-400'>{p.duracao_minutos} min</div>
                    </div>
                    <div className='font-semibold text-gray-900 text-sm whitespace-nowrap'>{formatCurrency(p.valor)}</div>
                    <div className='flex gap-2'>
                      <button onClick={() => handleEdit(p)}
                        className='text-xs px-2.5 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50'>
                        Editar
                      </button>
                      <button onClick={() => handleToggleAtivo(p)}
                        className={`text-xs px-2.5 py-1 rounded border ${p.ativo ? 'border-gray-300 text-gray-600 hover:bg-gray-50' : 'border-green-300 text-green-600 hover:bg-green-50'}`}>
                        {p.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
