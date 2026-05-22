'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Paciente, Anamnese, EvolucaoClinica, OdontogramaRegistro,
  FinanceiroRegistro, PlanoTratamento, ToothCondition,
} from '@/lib/types'
import OdontogramChart from '@/app/components/admin/OdontogramChart'

type Tab = 'dados' | 'anamnese' | 'evolucoes' | 'odontograma' | 'financeiro' | 'planos'

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}
function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

const TAB_LABELS: { key: Tab; label: string }[] = [
  { key: 'dados', label: 'Dados' },
  { key: 'anamnese', label: 'Anamnese' },
  { key: 'evolucoes', label: 'Prontuário' },
  { key: 'odontograma', label: 'Odontograma' },
  { key: 'planos', label: 'Planos' },
  { key: 'financeiro', label: 'Financeiro' },
]

const STATUS_FINANCIAL_LABELS: Record<string, string> = {
  pendente: 'Pendente', parcial: 'Parcial', pago: 'Pago', vencido: 'Vencido', cancelado: 'Cancelado',
}
const STATUS_FINANCIAL_COLORS: Record<string, string> = {
  pendente: 'bg-amber-100 text-amber-700',
  parcial: 'bg-blue-100 text-blue-700',
  pago: 'bg-green-100 text-green-700',
  vencido: 'bg-red-100 text-red-700',
  cancelado: 'bg-gray-100 text-gray-500',
}

const TOOTH_CONDITIONS: ToothCondition[] = [
  'higido', 'carie', 'restaurado', 'extracao_indicada', 'extraido',
  'ausente', 'coroa', 'implante', 'tratamento_canal', 'faceta',
  'selante', 'fraturado', 'manchado', 'outro',
]
const TOOTH_CONDITION_LABELS: Record<ToothCondition, string> = {
  higido: 'Hígido', carie: 'Cárie', restaurado: 'Restaurado',
  extracao_indicada: 'Extração indicada', extraido: 'Extraído', ausente: 'Ausente',
  coroa: 'Coroa', implante: 'Implante', tratamento_canal: 'Tratamento de canal',
  faceta: 'Faceta', selante: 'Selante', fraturado: 'Fraturado',
  manchado: 'Manchado', outro: 'Outro',
}

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('dados')
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [anamnese, setAnamnese] = useState<Anamnese | null>(null)
  const [evolucoes, setEvolucoes] = useState<EvolucaoClinica[]>([])
  const [odontograma, setOdontograma] = useState<OdontogramaRegistro[]>([])
  const [financeiro, setFinanceiro] = useState<FinanceiroRegistro[]>([])
  const [planos, setPlanos] = useState<PlanoTratamento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Odontogram interaction
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
  const [toothCondition, setToothCondition] = useState<ToothCondition>('higido')
  const [toothObs, setToothObs] = useState('')
  const [savingTooth, setSavingTooth] = useState(false)

  // New clinical record
  const [showNewEvolucao, setShowNewEvolucao] = useState(false)
  const [evolucaoForm, setEvolucaoForm] = useState({
    data_atendimento: new Date().toISOString().split('T')[0],
    queixa_principal: '',
    tratamento_realizado: '',
    prescricao: '',
    orientacoes: '',
    proximo_retorno: '',
    observacoes: '',
  })
  const [savingEvolucao, setSavingEvolucao] = useState(false)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const [pacRes, evRes, odoRes, finRes, plaRes] = await Promise.all([
          fetch(`/api/patients/${id}?include=anamnese`),
          fetch(`/api/clinical-records?paciente_id=${id}`),
          fetch(`/api/odontogram?paciente_id=${id}`),
          fetch(`/api/financial?paciente_id=${id}`),
          fetch(`/api/treatment-plans?paciente_id=${id}`),
        ])
        if (!pacRes.ok) throw new Error('Paciente não encontrado')
        const [pacData, evData, odoData, finData, plaData] = await Promise.all([
          pacRes.json(), evRes.json(), odoRes.json(), finRes.json(), plaRes.json(),
        ])
        setPaciente(pacData.paciente)
        setAnamnese(pacData.anamnese)
        setEvolucoes(evData.evolucoes ?? [])
        setOdontograma(odoData.registros ?? [])
        setFinanceiro(finData.registros ?? [])
        setPlanos(plaData.planos ?? [])
        document.title = `${pacData.paciente.nome_completo} | AmpeDent`
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  async function handleToothSave() {
    if (!selectedTooth) return
    setSavingTooth(true)
    try {
      await fetch('/api/odontogram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_id: id,
          dente_numero: selectedTooth,
          condicao: toothCondition,
          observacoes: toothObs || null,
        }),
      })
      const res = await fetch(`/api/odontogram?paciente_id=${id}`)
      const data = await res.json()
      setOdontograma(data.registros ?? [])
      setSelectedTooth(null)
      setToothObs('')
      setToothCondition('higido')
    } finally {
      setSavingTooth(false)
    }
  }

  function handleToothClick(n: number) {
    setSelectedTooth(n)
    const existing = odontograma.find(r => r.dente_numero === n)
    setToothCondition(existing?.condicao ?? 'higido')
    setToothObs(existing?.observacoes ?? '')
  }

  async function handleEvolucaoSave() {
    setSavingEvolucao(true)
    try {
      const res = await fetch('/api/clinical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...evolucaoForm, paciente_id: id }),
      })
      if (!res.ok) throw new Error('Erro ao salvar')
      const evRes = await fetch(`/api/clinical-records?paciente_id=${id}`)
      const evData = await evRes.json()
      setEvolucoes(evData.evolucoes ?? [])
      setShowNewEvolucao(false)
      setEvolucaoForm({
        data_atendimento: new Date().toISOString().split('T')[0],
        queixa_principal: '', tratamento_realizado: '',
        prescricao: '', orientacoes: '', proximo_retorno: '', observacoes: '',
      })
    } finally {
      setSavingEvolucao(false)
    }
  }

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='h-8 bg-gray-200 rounded animate-pulse w-64' />
        <div className='h-4 bg-gray-200 rounded animate-pulse w-40' />
        <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-3'>
          {[...Array(5)].map((_, i) => <div key={i} className='h-4 bg-gray-200 rounded animate-pulse' />)}
        </div>
      </div>
    )
  }

  if (error || !paciente) {
    return (
      <div className='text-center py-16'>
        <p className='text-red-600 mb-4'>{error || 'Paciente não encontrado'}</p>
        <Link href='/admin/patients' className='text-blue-600 hover:underline'>Voltar</Link>
      </div>
    )
  }

  return (
    <div className='space-y-5'>
      <div className='flex items-start gap-3'>
        <Link href='/admin/patients' className='text-gray-400 hover:text-gray-600 mt-1'>
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
          </svg>
        </Link>
        <div className='flex-1 min-w-0'>
          <h1 className='text-2xl font-bold text-gray-900 truncate'>{paciente.nome_completo}</h1>
          {paciente.data_nascimento && (
            <p className='text-sm text-gray-500'>
              Nascimento: {formatDate(paciente.data_nascimento)}
              {paciente.celular && ` · ${paciente.celular}`}
              {paciente.email && ` · ${paciente.email}`}
            </p>
          )}
        </div>
      </div>

      <div className='flex overflow-x-auto border-b border-gray-200 gap-1'>
        {TAB_LABELS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dados' && (
        <div className='grid sm:grid-cols-2 gap-4'>
          {[
            { label: 'CPF', value: paciente.cpf },
            { label: 'RG', value: paciente.rg },
            { label: 'Sexo', value: paciente.sexo },
            { label: 'Estado civil', value: paciente.estado_civil },
            { label: 'Profissão', value: paciente.profissao },
            { label: 'Email', value: paciente.email },
            { label: 'Telefone', value: paciente.telefone },
            { label: 'Celular', value: paciente.celular },
            { label: 'Endereço', value: [paciente.logradouro, paciente.numero, paciente.bairro, paciente.cidade, paciente.estado_uf].filter(Boolean).join(', ') || null },
            { label: 'Responsável', value: paciente.responsavel_nome },
            { label: 'Como nos conheceu', value: paciente.como_nos_conheceu },
            { label: 'Observações', value: paciente.observacoes },
          ].map(f => f.value ? (
            <div key={f.label} className='bg-white rounded-lg border border-gray-100 px-4 py-3'>
              <div className='text-xs text-gray-400 font-medium uppercase tracking-wide'>{f.label}</div>
              <div className='text-gray-900 text-sm mt-0.5'>{f.value}</div>
            </div>
          ) : null)}
          <div className='sm:col-span-2'>
            <Link
              href={`/admin/patients/create?edit=${id}`}
              className='text-blue-600 text-sm hover:underline'>
              Editar dados do paciente
            </Link>
          </div>
        </div>
      )}

      {tab === 'anamnese' && (
        <div className='bg-white rounded-xl border border-gray-200 p-5'>
          {anamnese ? (
            <div className='space-y-4'>
              <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm'>
                {[
                  { label: 'Em tratamento médico', value: anamnese.em_tratamento_medico, desc: anamnese.tratamento_medico_desc },
                  { label: 'Toma medicamentos', value: anamnese.tomando_medicamentos, desc: anamnese.medicamentos_lista },
                  { label: 'Alergia a medicamentos', value: anamnese.alergia_medicamento, desc: anamnese.alergias_lista },
                  { label: 'Diabético', value: anamnese.diabetico },
                  { label: 'Hipertenso', value: anamnese.hipertenso },
                  { label: 'Problema cardíaco', value: anamnese.problema_cardiaco },
                  { label: 'Distúrbio de coagulação', value: anamnese.disturbio_coagulacao },
                  { label: 'Gestante', value: anamnese.gestante },
                  { label: 'Usa anticoagulante', value: anamnese.usa_anticoagulante },
                  { label: 'Hepatite', value: anamnese.hepatite },
                  { label: 'HIV', value: anamnese.hiv },
                  { label: 'Bruxismo', value: anamnese.bruxismo },
                  { label: 'Sangramento gengival', value: anamnese.sangramento_gengival },
                  { label: 'Dor ATM', value: anamnese.dor_atm },
                  { label: 'Já fez cirurgia', value: anamnese.ja_fez_cirurgia, desc: anamnese.cirurgia_desc },
                ].map(item => (
                  <div key={item.label} className={`rounded-lg p-3 border ${item.value ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
                    <div className={`text-xs font-semibold ${item.value ? 'text-amber-700' : 'text-gray-500'}`}>{item.label}</div>
                    <div className={`text-sm font-medium ${item.value ? 'text-amber-900' : 'text-gray-400'}`}>{item.value ? 'Sim' : 'Não'}</div>
                    {item.desc && <div className='text-xs text-gray-600 mt-1'>{item.desc}</div>}
                  </div>
                ))}
              </div>
              {anamnese.outras_doencas && (
                <div className='rounded-lg bg-gray-50 border border-gray-100 p-3'>
                  <div className='text-xs text-gray-500 font-medium'>Outras doenças</div>
                  <div className='text-sm text-gray-900 mt-0.5'>{anamnese.outras_doencas}</div>
                </div>
              )}
              {anamnese.observacoes && (
                <div className='rounded-lg bg-gray-50 border border-gray-100 p-3'>
                  <div className='text-xs text-gray-500 font-medium'>Observações</div>
                  <div className='text-sm text-gray-900 mt-0.5'>{anamnese.observacoes}</div>
                </div>
              )}
            </div>
          ) : (
            <div className='text-center py-8 text-gray-400 text-sm'>Anamnese não preenchida</div>
          )}
        </div>
      )}

      {tab === 'evolucoes' && (
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <h2 className='text-base font-semibold text-gray-800'>Prontuário clínico</h2>
            <button
              onClick={() => setShowNewEvolucao(true)}
              className='px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors'>
              + Nova evolução
            </button>
          </div>

          {showNewEvolucao && (
            <div className='bg-white rounded-xl border border-blue-200 p-5 space-y-4'>
              <h3 className='font-semibold text-gray-900'>Nova evolução clínica</h3>
              <div className='grid sm:grid-cols-2 gap-4'>
                <div>
                  <label>Data do atendimento</label>
                  <input type='date' value={evolucaoForm.data_atendimento}
                    onChange={e => setEvolucaoForm(f => ({ ...f, data_atendimento: e.target.value }))} />
                </div>
              </div>
              {[
                { key: 'queixa_principal', label: 'Queixa principal' },
                { key: 'tratamento_realizado', label: 'Tratamento realizado' },
                { key: 'prescricao', label: 'Prescrição' },
                { key: 'orientacoes', label: 'Orientações' },
                { key: 'proximo_retorno', label: 'Próximo retorno' },
                { key: 'observacoes', label: 'Observações' },
              ].map(f => (
                <div key={f.key}>
                  <label>{f.label}</label>
                  <textarea rows={2} value={(evolucaoForm as any)[f.key]}
                    onChange={e => setEvolucaoForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div className='flex gap-3'>
                <button onClick={handleEvolucaoSave} disabled={savingEvolucao}
                  className='px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50'>
                  {savingEvolucao ? 'Salvando...' : 'Salvar'}
                </button>
                <button onClick={() => setShowNewEvolucao(false)}
                  className='px-4 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50'>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {evolucoes.length === 0 ? (
            <div className='bg-white rounded-xl border border-gray-200 py-10 text-center text-gray-400 text-sm'>
              Nenhuma evolução clínica registrada
            </div>
          ) : (
            <div className='space-y-3'>
              {evolucoes.map(ev => (
                <div key={ev.id} className='bg-white rounded-xl border border-gray-200 p-5 space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='font-semibold text-gray-900'>{formatDate(ev.data_atendimento)}</span>
                    {ev.admin_users && <span className='text-xs text-gray-400'>{ev.admin_users.name}</span>}
                  </div>
                  {[
                    { label: 'Queixa principal', value: ev.queixa_principal },
                    { label: 'Tratamento realizado', value: ev.tratamento_realizado },
                    { label: 'Prescrição', value: ev.prescricao },
                    { label: 'Orientações', value: ev.orientacoes },
                    { label: 'Próximo retorno', value: ev.proximo_retorno },
                    { label: 'Observações', value: ev.observacoes },
                  ].filter(f => f.value).map(f => (
                    <div key={f.label}>
                      <div className='text-xs text-gray-400 font-medium'>{f.label}</div>
                      <div className='text-sm text-gray-900 whitespace-pre-wrap'>{f.value}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'odontograma' && (
        <div className='space-y-4'>
          <OdontogramChart
            registros={odontograma}
            onToothClick={handleToothClick}
            selectedTooth={selectedTooth}
          />

          {selectedTooth && (
            <div className='bg-white rounded-xl border border-blue-200 p-5 space-y-4'>
              <h3 className='font-semibold text-gray-900'>Dente {selectedTooth}</h3>
              <div>
                <label>Condição</label>
                <select value={toothCondition} onChange={e => setToothCondition(e.target.value as ToothCondition)}>
                  {TOOTH_CONDITIONS.map(c => (
                    <option key={c} value={c}>{TOOTH_CONDITION_LABELS[c]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Observações</label>
                <textarea rows={2} value={toothObs} onChange={e => setToothObs(e.target.value)} />
              </div>
              <div className='flex gap-3'>
                <button onClick={handleToothSave} disabled={savingTooth}
                  className='px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50'>
                  {savingTooth ? 'Salvando...' : 'Salvar'}
                </button>
                <button onClick={() => setSelectedTooth(null)}
                  className='px-4 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50'>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'planos' && (
        <div className='space-y-3'>
          {planos.length === 0 ? (
            <div className='bg-white rounded-xl border border-gray-200 py-10 text-center text-gray-400 text-sm'>
              Nenhum plano de tratamento
            </div>
          ) : (
            planos.map(p => (
              <div key={p.id} className='bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-3'>
                <div>
                  <div className='font-semibold text-gray-900'>{p.titulo}</div>
                  <div className='text-sm text-gray-500 mt-0.5'>{p.status} · {formatCurrency(p.valor_total)}</div>
                </div>
                <span className='text-xs text-gray-400 whitespace-nowrap'>
                  {formatDate(p.created_at.split('T')[0])}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'financeiro' && (
        <div className='space-y-3'>
          {financeiro.length === 0 ? (
            <div className='bg-white rounded-xl border border-gray-200 py-10 text-center text-gray-400 text-sm'>
              Nenhum registro financeiro
            </div>
          ) : (
            financeiro.map(f => (
              <div key={f.id} className='bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-3'>
                <div>
                  <div className='font-semibold text-gray-900'>{f.descricao}</div>
                  <div className='text-sm text-gray-500 mt-0.5'>
                    Total: {formatCurrency(f.valor_total)} · Pago: {formatCurrency(f.valor_pago)}
                  </div>
                  {f.data_vencimento && (
                    <div className='text-xs text-gray-400 mt-0.5'>Vencimento: {formatDate(f.data_vencimento)}</div>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${STATUS_FINANCIAL_COLORS[f.status]}`}>
                  {STATUS_FINANCIAL_LABELS[f.status]}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
