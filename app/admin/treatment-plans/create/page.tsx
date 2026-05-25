'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Paciente } from '@/lib/types'

function FieldError({ msg }: { msg: string }) {
  return <p className='mt-1 text-xs text-red-600'>{msg}</p>
}

export default function CreateTreatmentPlanPage() {
  const router = useRouter()

  const [pacienteSearch, setPacienteSearch] = useState('')
  const [pacienteSuggestions, setPacienteSuggestions] = useState<Paciente[]>([])
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const [titulo, setTitulo] = useState('')
  const [status, setStatus] = useState('planejado')
  const [valorTotal, setValorTotal] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFimPrevista, setDataFimPrevista] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    document.title = 'Novo Plano de Tratamento | Admin | DentalSys'
  }, [])

  // Patient autocomplete
  useEffect(() => {
    if (pacienteSearch.length < 2) { setPacienteSuggestions([]); return }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/patients?search=${encodeURIComponent(pacienteSearch)}&page=1`)
      if (res.ok) {
        const data = await res.json()
        setPacienteSuggestions(data.pacientes ?? [])
        setShowSuggestions(true)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [pacienteSearch])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectPaciente(p: Paciente) {
    setSelectedPaciente(p)
    setPacienteSearch(p.nome_completo)
    setShowSuggestions(false)
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!selectedPaciente) errs.paciente = 'Selecione um paciente.'
    if (!titulo.trim()) errs.titulo = 'Título é obrigatório.'
    if (valorTotal && isNaN(Number(valorTotal.replace(',', '.')))) errs.valor = 'Valor inválido.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/treatment-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_id: selectedPaciente!.id,
          titulo: titulo.trim(),
          status,
          valor_total: Number(valorTotal.replace(',', '.')) || 0,
          data_inicio: dataInicio || null,
          data_fim_prevista: dataFimPrevista || null,
          observacoes: observacoes || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message ?? 'Erro ao criar plano')
      router.push(`/admin/treatment-plans/${data.plano?.id ?? ''}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='space-y-6 max-w-2xl'>
      <div className='flex items-center gap-3'>
        <Link href='/admin/treatment-plans' className='text-gray-400 hover:text-gray-600 transition-colors'>
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
          </svg>
        </Link>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Novo plano de tratamento</h1>
          <p className='text-sm text-gray-500 mt-0.5'>Crie um plano ou orçamento para um paciente</p>
        </div>
      </div>

      {error && (
        <div className='rounded-md bg-red-50 border border-red-200 p-4'>
          <p className='text-red-700 text-sm'>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-5' noValidate>
        <fieldset className='bg-white rounded-xl border border-gray-200 p-5 space-y-4'>
          <legend className='text-sm font-semibold text-gray-700 px-1'>Paciente</legend>

          <div ref={searchRef} className='relative'>
            <label htmlFor='paciente'>Paciente <span className='text-red-500'>*</span></label>
            <input
              id='paciente'
              type='text'
              value={pacienteSearch}
              onChange={e => { setPacienteSearch(e.target.value); setSelectedPaciente(null) }}
              placeholder='Digite o nome do paciente...'
              autoComplete='off'
              disabled={isLoading}
            />
            {fieldErrors.paciente && <FieldError msg={fieldErrors.paciente} />}
            {showSuggestions && pacienteSuggestions.length > 0 && (
              <ul className='absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto'>
                {pacienteSuggestions.map(p => (
                  <li key={p.id}>
                    <button type='button' onClick={() => selectPaciente(p)}
                      className='w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors'>
                      <span className='font-medium text-gray-900'>{p.nome_completo}</span>
                      {p.cpf && <span className='ml-2 text-gray-400 text-xs'>CPF: {p.cpf}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {selectedPaciente && (
              <p className='mt-1 text-xs text-green-600'>✓ Paciente selecionado</p>
            )}
          </div>
        </fieldset>

        <fieldset className='bg-white rounded-xl border border-gray-200 p-5 space-y-4'>
          <legend className='text-sm font-semibold text-gray-700 px-1'>Dados do plano</legend>

          <div>
            <label htmlFor='titulo'>Título <span className='text-red-500'>*</span></label>
            <input id='titulo' type='text' value={titulo} onChange={e => setTitulo(e.target.value)}
              placeholder='Ex: Reabilitação oral completa' disabled={isLoading} />
            {fieldErrors.titulo && <FieldError msg={fieldErrors.titulo} />}
          </div>

          <div className='grid sm:grid-cols-2 gap-4'>
            <div>
              <label htmlFor='plan-status'>Status</label>
              <select id='plan-status' value={status} onChange={e => setStatus(e.target.value)} disabled={isLoading}>
                <option value='planejado'>Planejado</option>
                <option value='aprovado'>Aprovado</option>
                <option value='em_andamento'>Em andamento</option>
                <option value='concluido'>Concluído</option>
                <option value='cancelado'>Cancelado</option>
              </select>
            </div>
            <div>
              <label htmlFor='valor'>Valor total estimado (R$)</label>
              <input id='valor' type='text' value={valorTotal}
                onChange={e => setValorTotal(e.target.value)}
                placeholder='0,00' disabled={isLoading} />
              {fieldErrors.valor && <FieldError msg={fieldErrors.valor} />}
            </div>
          </div>

          <div className='grid sm:grid-cols-2 gap-4'>
            <div>
              <label htmlFor='data_inicio'>Data de início</label>
              <input id='data_inicio' type='date' value={dataInicio}
                onChange={e => setDataInicio(e.target.value)} disabled={isLoading} />
            </div>
            <div>
              <label htmlFor='data_fim'>Previsão de conclusão</label>
              <input id='data_fim' type='date' value={dataFimPrevista}
                onChange={e => setDataFimPrevista(e.target.value)} disabled={isLoading} />
            </div>
          </div>

          <div>
            <label htmlFor='observacoes'>Observações</label>
            <textarea id='observacoes' rows={3} value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder='Descrição do plano, objetivos, observações clínicas...'
              disabled={isLoading} />
          </div>
        </fieldset>

        <div className='flex flex-col sm:flex-row gap-3'>
          <button type='submit' disabled={isLoading}
            className='px-6 py-2.5 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2'>
            {isLoading ? (
              <>
                <svg className='animate-spin w-4 h-4' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                </svg>
                Salvando...
              </>
            ) : 'Criar plano'}
          </button>
          <Link href='/admin/treatment-plans'
            className='px-6 py-2.5 rounded-md border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center'>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
