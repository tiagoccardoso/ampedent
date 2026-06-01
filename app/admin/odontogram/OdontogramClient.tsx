'use client'

import { useRef, useState, useTransition } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Patient {
  id: string
  full_name: string
}

export interface OdontogramEntry {
  id: string
  patient_id: string
  patient_name: string
  tooth_code: string
  condition: string | null
  planned_procedure: string | null
  performed_procedure: string | null
  notes: string | null
  created_at: string
}

interface ToothDef {
  code: string
  label: string
  x: number
  y: number
}

interface Props {
  patients: Patient[]
  entries: OdontogramEntry[]
  saveAction: (fd: FormData) => Promise<void>
  deleteAction: (fd: FormData) => Promise<void>
}

// ─── Definição dos dentes (notação FDI) ──────────────────────────────────────
//
// Adulto: quadrantes 1-4 (18 dentes por arcada, 16 superiores + 16 inferiores)
// Criança: quadrantes 5-8
//
// Layout visual (de cima para baixo, esquerda para direita do PACIENTE):
//   Superior direito  18-11  |  Superior esquerdo  21-28
//   Inferior direito  48-41  |  Inferior esquerdo  31-38
//
// Coordenadas em unidades de grade (x: coluna, y: linha)
// Superior: y=0  Inferior: y=1
// Cada quadrante tem 8 dentes

const UPPER_RIGHT: ToothDef[] = [18, 17, 16, 15, 14, 13, 12, 11].map((n, i) => ({
  code: String(n),
  label: String(n),
  x: 7 - i,     // da direita para o centro
  y: 0,
}))

const UPPER_LEFT: ToothDef[] = [21, 22, 23, 24, 25, 26, 27, 28].map((n, i) => ({
  code: String(n),
  label: String(n),
  x: 8 + i,
  y: 0,
}))

const LOWER_LEFT: ToothDef[] = [31, 32, 33, 34, 35, 36, 37, 38].map((n, i) => ({
  code: String(n),
  label: String(n),
  x: 8 + i,
  y: 1,
}))

const LOWER_RIGHT: ToothDef[] = [48, 47, 46, 45, 44, 43, 42, 41].map((n, i) => ({
  code: String(n),
  label: String(n),
  x: 7 - i,
  y: 1,
}))

const ADULT_TEETH: ToothDef[] = [
  ...UPPER_RIGHT,
  ...UPPER_LEFT,
  ...LOWER_LEFT,
  ...LOWER_RIGHT,
]

// Dentes decíduos (crianças)
const CHILD_UPPER_RIGHT: ToothDef[] = [55, 54, 53, 52, 51].map((n, i) => ({
  code: String(n), label: String(n), x: 4 - i + 2, y: 0,
}))
const CHILD_UPPER_LEFT: ToothDef[] = [61, 62, 63, 64, 65].map((n, i) => ({
  code: String(n), label: String(n), x: 8 + i - 1, y: 0,
}))
const CHILD_LOWER_LEFT: ToothDef[] = [71, 72, 73, 74, 75].map((n, i) => ({
  code: String(n), label: String(n), x: 8 + i - 1, y: 1,
}))
const CHILD_LOWER_RIGHT: ToothDef[] = [85, 84, 83, 82, 81].map((n, i) => ({
  code: String(n), label: String(n), x: 4 - i + 2, y: 1,
}))

const CHILD_TEETH: ToothDef[] = [
  ...CHILD_UPPER_RIGHT,
  ...CHILD_UPPER_LEFT,
  ...CHILD_LOWER_LEFT,
  ...CHILD_LOWER_RIGHT,
]

// ─── Mapa de condições ────────────────────────────────────────────────────────

const CONDITIONS = [
  { value: '', label: 'Selecione...' },
  { value: 'hígido', label: 'Hígido (íntegro)' },
  { value: 'cárie', label: 'Cárie' },
  { value: 'restaurado', label: 'Restaurado' },
  { value: 'fraturado', label: 'Fraturado' },
  { value: 'ausente', label: 'Ausente' },
  { value: 'implante', label: 'Implante' },
  { value: 'endodontia', label: 'Endodontia (canal)' },
  { value: 'extração indicada', label: 'Extração indicada' },
  { value: 'prótese', label: 'Prótese' },
  { value: 'em tratamento', label: 'Em tratamento' },
]

const CONDITION_COLOR: Record<string, { fill: string; text: string }> = {
  'hígido':             { fill: '#dcfce7', text: '#166534' },
  'cárie':              { fill: '#fef9c3', text: '#713f12' },
  'restaurado':         { fill: '#dbeafe', text: '#1e3a8a' },
  'fraturado':          { fill: '#fee2e2', text: '#991b1b' },
  'ausente':            { fill: '#e5e7eb', text: '#374151' },
  'implante':           { fill: '#ede9fe', text: '#4c1d95' },
  'endodontia':         { fill: '#ffedd5', text: '#7c2d12' },
  'extração indicada':  { fill: '#fce7f3', text: '#9d174d' },
  'prótese':            { fill: '#cffafe', text: '#164e63' },
  'em tratamento':      { fill: '#fef3c7', text: '#92400e' },
}

// ─── SVG de um dente ─────────────────────────────────────────────────────────

function ToothSVG({
  isUpper,
  fill,
  isSelected,
  hasEntries,
}: {
  isUpper: boolean
  fill: string
  isSelected: boolean
  hasEntries: boolean
}) {
  const stroke = isSelected ? '#0e7490' : hasEntries ? '#6b7280' : '#d1d5db'
  const sw = isSelected ? 2.5 : 1.5

  // Representação SVG simplificada de dente
  // Superior: raiz para cima, coroa para baixo
  // Inferior: raiz para baixo, coroa para cima
  if (isUpper) {
    return (
      <svg viewBox='0 0 40 54' width='40' height='54' aria-hidden>
        {/* raízes */}
        <path d='M13 28 C12 18 10 10 11 4' fill='none' stroke={stroke} strokeWidth={sw} strokeLinecap='round' />
        <path d='M20 26 C20 16 20 8 20 3' fill='none' stroke={stroke} strokeWidth={sw} strokeLinecap='round' />
        <path d='M27 28 C28 18 30 10 29 4' fill='none' stroke={stroke} strokeWidth={sw} strokeLinecap='round' />
        {/* coroa */}
        <rect x='8' y='26' width='24' height='22' rx='5' fill={fill} stroke={stroke} strokeWidth={sw} />
        {/* sulco central */}
        <line x1='20' y1='29' x2='20' y2='45' stroke={stroke} strokeWidth={0.8} opacity={0.5} />
        <line x1='11' y1='37' x2='29' y2='37' stroke={stroke} strokeWidth={0.8} opacity={0.5} />
        {/* indicador de procedimento */}
        {hasEntries && !isSelected && (
          <circle cx='33' cy='29' r='4' fill='#0e7490' />
        )}
      </svg>
    )
  }
  return (
    <svg viewBox='0 0 40 54' width='40' height='54' aria-hidden>
      {/* coroa */}
      <rect x='8' y='6' width='24' height='22' rx='5' fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* sulco */}
      <line x1='20' y1='9' x2='20' y2='25' stroke={stroke} strokeWidth={0.8} opacity={0.5} />
      <line x1='11' y1='17' x2='29' y2='17' stroke={stroke} strokeWidth={0.8} opacity={0.5} />
      {/* raízes */}
      <path d='M13 28 C12 38 10 46 11 52' fill='none' stroke={stroke} strokeWidth={sw} strokeLinecap='round' />
      <path d='M20 28 C20 38 20 44 20 51' fill='none' stroke={stroke} strokeWidth={sw} strokeLinecap='round' />
      <path d='M27 28 C28 38 30 46 29 52' fill='none' stroke={stroke} strokeWidth={sw} strokeLinecap='round' />
      {/* indicador */}
      {hasEntries && !isSelected && (
        <circle cx='33' cy='9' r='4' fill='#0e7490' />
      )}
    </svg>
  )
}

// ─── Grade de dentes ─────────────────────────────────────────────────────────

function ToothGrid({
  teeth,
  isUpper,
  entriesMap,
  selectedTooth,
  onSelect,
}: {
  teeth: ToothDef[]
  isUpper: boolean
  entriesMap: Map<string, OdontogramEntry[]>
  selectedTooth: string | null
  onSelect: (code: string) => void
}) {
  return (
    <div className='flex flex-wrap justify-center gap-1'>
      {teeth.map((t) => {
        const list = entriesMap.get(t.code) ?? []
        const latest = list[0]
        const condition = latest?.condition ?? ''
        const colors = CONDITION_COLOR[condition] ?? { fill: '#f8f9ff', text: '#0f172a' }
        const isSelected = selectedTooth === t.code
        const hasEntries = list.length > 0

        return (
          <button
            key={t.code}
            type='button'
            title={`Dente ${t.label}${condition ? ' — ' + condition : ''}`}
            aria-label={`Dente ${t.label}${condition ? ', ' + condition : ''}`}
            aria-pressed={isSelected}
            onClick={() => onSelect(t.code)}
            className={[
              'flex flex-col items-center gap-0.5 rounded-lg p-1 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7490]',
              isSelected
                ? 'bg-[#e0f2fe] ring-2 ring-[#0e7490] scale-105 shadow-md'
                : hasEntries
                ? 'bg-white hover:bg-[#f0f9ff] hover:scale-105'
                : 'bg-white hover:bg-[#f8f9ff] hover:scale-105',
            ].join(' ')}
          >
            <ToothSVG
              isUpper={isUpper}
              fill={colors.fill}
              isSelected={isSelected}
              hasEntries={hasEntries}
            />
            <span
              className='text-[10px] font-semibold leading-none'
              style={{ color: isSelected ? '#0e7490' : colors.text || '#6b7280' }}
            >
              {t.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Modal / painel lateral ──────────────────────────────────────────────────

function ToothPanel({
  tooth,
  entries,
  patients,
  saveAction,
  deleteAction,
  onClose,
}: {
  tooth: ToothDef
  entries: OdontogramEntry[]
  patients: Patient[]
  saveAction: (fd: FormData) => Promise<void>
  deleteAction: (fd: FormData) => Promise<void>
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setFeedback(null)
    startTransition(async () => {
      try {
        await saveAction(fd)
        formRef.current?.reset()
        setFeedback({ type: 'ok', msg: 'Procedimento salvo com sucesso!' })
      } catch {
        setFeedback({ type: 'err', msg: 'Não foi possível salvar. Tente novamente.' })
      }
    })
  }

  function handleDelete(id: string) {
    if (!window.confirm('Remover este procedimento?')) return
    setDeleting(id)
    const fd = new FormData()
    fd.set('id', id)
    startTransition(async () => {
      try {
        await deleteAction(fd)
        setFeedback({ type: 'ok', msg: 'Procedimento removido.' })
      } catch {
        setFeedback({ type: 'err', msg: 'Não foi possível remover.' })
      } finally {
        setDeleting(null)
      }
    })
  }

  return (
    // overlay
    <div
      className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4'
      role='dialog'
      aria-modal='true'
      aria-label={`Dente ${tooth.label}`}
    >
      {/* backdrop */}
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm'
        onClick={onClose}
        aria-hidden
      />

      {/* painel */}
      <div className='relative z-10 w-full sm:max-w-lg max-h-[92dvh] sm:max-h-[85vh] flex flex-col bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden'>
        {/* cabeçalho */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-[--border] bg-[#f8f9ff]'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-[#0e7490]/10 flex items-center justify-center'>
              <svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='#0e7490' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M12 2C8.5 2 6 4.5 6 7c0 1.5.5 3 1 4.5S8 15 8 17c0 2 1 4 2 4h4c1 0 2-2 2-4 0-2 .5-4 1-5.5S18 8.5 18 7c0-2.5-2.5-5-6-5z'/>
              </svg>
            </div>
            <div>
              <p className='text-xs text-[--text-muted] font-medium'>Dente selecionado</p>
              <h2 className='text-base font-bold text-[--text-main]'>Dente {tooth.label}</h2>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='w-8 h-8 rounded-full flex items-center justify-center text-[--text-muted] hover:bg-[--border] transition-colors'
            aria-label='Fechar'
          >
            ✕
          </button>
        </div>

        {/* conteúdo com scroll */}
        <div className='flex-1 overflow-y-auto p-5 space-y-5'>

          {/* feedback */}
          {feedback && (
            <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${
              feedback.type === 'err'
                ? 'border-[#ffdad6] bg-[#fff0ee] text-[#ba1a1a]'
                : 'border-[#bbf7d0] bg-[#f0fdf4] text-[#006c49]'
            }`}>
              <span>{feedback.type === 'err' ? '⚠' : '✓'}</span>
              <span>{feedback.msg}</span>
            </div>
          )}

          {/* formulário de cadastro */}
          <div className='section-card'>
            <div className='section-card-header'>
              <h3 className='text-sm font-semibold text-[--text-main]'>Registrar procedimento</h3>
            </div>
            <div className='section-card-body'>
              <form ref={formRef} onSubmit={handleSave} className='space-y-3'>
                <input type='hidden' name='tooth_code' value={tooth.code} />

                <div>
                  <label htmlFor='modal-patient'>Paciente *</label>
                  <select id='modal-patient' name='patient_id' required>
                    <option value=''>Selecione o paciente...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor='modal-condition'>Condição do dente</label>
                  <select id='modal-condition' name='condition'>
                    {CONDITIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor='modal-planned'>Procedimento planejado</label>
                  <input id='modal-planned' name='planned_procedure' placeholder='Ex: Restauração classe II' />
                </div>

                <div>
                  <label htmlFor='modal-performed'>Procedimento realizado</label>
                  <input id='modal-performed' name='performed_procedure' placeholder='Ex: Restauração com resina composta' />
                </div>

                <div>
                  <label htmlFor='modal-notes'>Observações</label>
                  <textarea id='modal-notes' name='notes' rows={3} placeholder='Observações adicionais...' className='resize-none' />
                </div>

                <button
                  type='submit'
                  disabled={isPending}
                  className='w-full py-2.5 rounded-lg bg-[#0e7490] text-white text-sm font-semibold hover:bg-[#005a71] disabled:opacity-60 disabled:cursor-not-allowed transition-colors'
                >
                  {isPending ? 'Salvando...' : 'Salvar procedimento'}
                </button>
              </form>
            </div>
          </div>

          {/* histórico de procedimentos */}
          {entries.length > 0 && (
            <div className='section-card'>
              <div className='section-card-header'>
                <h3 className='text-sm font-semibold text-[--text-main]'>Histórico ({entries.length})</h3>
              </div>
              <div className='divide-y divide-[--border]'>
                {entries.map((e) => (
                  <div key={e.id} className='px-4 py-3 space-y-1.5'>
                    <div className='flex items-start justify-between gap-2'>
                      <span className='text-sm font-medium text-[--text-main] truncate'>{e.patient_name}</span>
                      {e.condition && (
                        <span
                          className='badge shrink-0'
                          style={{
                            background: CONDITION_COLOR[e.condition]?.fill ?? '#e5e7eb',
                            color: CONDITION_COLOR[e.condition]?.text ?? '#374151',
                          }}
                        >
                          {e.condition}
                        </span>
                      )}
                    </div>
                    {e.planned_procedure && (
                      <p className='text-xs text-[--text-muted]'>
                        <span className='font-medium'>Planejado:</span> {e.planned_procedure}
                      </p>
                    )}
                    {e.performed_procedure && (
                      <p className='text-xs text-[--text-muted]'>
                        <span className='font-medium'>Realizado:</span> {e.performed_procedure}
                      </p>
                    )}
                    {e.notes && (
                      <p className='text-xs text-[--text-muted] italic'>{e.notes}</p>
                    )}
                    <div className='flex items-center justify-between'>
                      <span className='text-[11px] text-[--text-muted]'>
                        {new Date(e.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                      <button
                        type='button'
                        onClick={() => handleDelete(e.id)}
                        disabled={deleting === e.id || isPending}
                        className='btn-danger-sm'
                      >
                        {deleting === e.id ? '...' : 'Remover'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {entries.length === 0 && (
            <p className='text-center text-sm text-[--text-muted] py-4'>
              Nenhum procedimento registrado para este dente.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Legenda de cores ─────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className='flex flex-wrap gap-2 justify-center'>
      {Object.entries(CONDITION_COLOR).map(([cond, clr]) => (
        <span
          key={cond}
          className='inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border'
          style={{ background: clr.fill, color: clr.text, borderColor: clr.fill }}
        >
          <span
            className='inline-block w-2 h-2 rounded-full'
            style={{ background: clr.text }}
          />
          {cond.charAt(0).toUpperCase() + cond.slice(1)}
        </span>
      ))}
      <span className='inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border border-[--border] bg-[#f8f9ff] text-[--text-muted]'>
        <span className='inline-block w-2 h-2 rounded-full bg-[#d1d5db]' />
        Sem registro
      </span>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function OdontogramClient({ patients, entries, saveAction, deleteAction }: Props) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [mode, setMode] = useState<'adult' | 'child'>('adult')

  const teeth = mode === 'adult' ? ADULT_TEETH : CHILD_TEETH
  const upperTeeth = teeth.filter((t) => t.y === 0)
  const lowerTeeth = teeth.filter((t) => t.y === 1)

  // índice de entradas por código de dente
  const entriesMap = new Map<string, OdontogramEntry[]>()
  for (const e of entries) {
    const list = entriesMap.get(e.tooth_code) ?? []
    list.push(e)
    entriesMap.set(e.tooth_code, list)
  }

  const selectedTooth = teeth.find((t) => t.code === selectedCode) ?? null
  const toothEntries = selectedCode ? (entriesMap.get(selectedCode) ?? []) : []

  function handleSelect(code: string) {
    setSelectedCode((prev) => (prev === code ? null : code))
  }

  return (
    <section className='space-y-6'>
      {/* cabeçalho */}
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Odontograma</h1>
          <p className='page-subtitle'>Clique em um dente para registrar ou consultar procedimentos</p>
        </div>

        {/* seletor adulto / criança */}
        <div className='flex rounded-lg border border-[--border] overflow-hidden text-sm font-medium'>
          <button
            type='button'
            onClick={() => { setMode('adult'); setSelectedCode(null) }}
            className={`px-4 py-2 transition-colors ${
              mode === 'adult'
                ? 'bg-[#0e7490] text-white'
                : 'bg-white text-[--text-muted] hover:bg-[#f8f9ff]'
            }`}
          >
            Adulto
          </button>
          <button
            type='button'
            onClick={() => { setMode('child'); setSelectedCode(null) }}
            className={`px-4 py-2 transition-colors ${
              mode === 'child'
                ? 'bg-[#0e7490] text-white'
                : 'bg-white text-[--text-muted] hover:bg-[#f8f9ff]'
            }`}
          >
            Criança
          </button>
        </div>
      </div>

      {/* grade visual */}
      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[--text-main]'>
            {mode === 'adult' ? 'Dentição permanente (adulto)' : 'Dentição decídua (criança)'}
          </h2>
          <p className='text-xs text-[--text-muted] mt-0.5'>
            {entries.length} procedimento{entries.length !== 1 ? 's' : ''} registrado{entries.length !== 1 ? 's' : ''}
            {selectedCode ? ` · Dente ${selectedCode} selecionado` : ''}
          </p>
        </div>
        <div className='section-card-body space-y-4'>

          {/* dentes superiores */}
          <div>
            <p className='text-[11px] text-center text-[--text-muted] font-medium uppercase tracking-wide mb-2'>
              Arcada Superior
            </p>
            <ToothGrid
              teeth={upperTeeth}
              isUpper
              entriesMap={entriesMap}
              selectedTooth={selectedCode}
              onSelect={handleSelect}
            />
          </div>

          {/* separador central */}
          <div className='relative flex items-center'>
            <div className='flex-1 border-t border-dashed border-[--border]' />
            <span className='mx-3 text-[11px] text-[--text-muted] font-medium uppercase tracking-wide bg-white px-2'>
              Linha média
            </span>
            <div className='flex-1 border-t border-dashed border-[--border]' />
          </div>

          {/* dentes inferiores */}
          <div>
            <ToothGrid
              teeth={lowerTeeth}
              isUpper={false}
              entriesMap={entriesMap}
              selectedTooth={selectedCode}
              onSelect={handleSelect}
            />
            <p className='text-[11px] text-center text-[--text-muted] font-medium uppercase tracking-wide mt-2'>
              Arcada Inferior
            </p>
          </div>

          {/* legenda */}
          <div className='pt-2 border-t border-[--border]'>
            <p className='text-[11px] text-[--text-muted] font-medium mb-2 text-center uppercase tracking-wide'>Legenda</p>
            <Legend />
          </div>
        </div>
      </div>

      {/* instrução quando nenhum dente selecionado */}
      {!selectedCode && (
        <div className='flex items-center gap-3 p-4 rounded-xl border border-dashed border-[#0e7490]/30 bg-[#f0f9ff]'>
          <div className='shrink-0 w-9 h-9 rounded-full bg-[#0e7490]/10 flex items-center justify-center'>
            <svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='#0e7490' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <circle cx='12' cy='12' r='10' />
              <path d='M12 8v4m0 4h.01' />
            </svg>
          </div>
          <p className='text-sm text-[#0e7490]'>
            Clique em qualquer dente no odontograma para registrar um procedimento ou consultar o histórico.
          </p>
        </div>
      )}

      {/* tabela resumo */}
      {entries.length > 0 && (
        <div className='section-card'>
          <div className='section-card-header'>
            <h2 className='text-sm font-semibold text-[--text-main]'>Registros recentes</h2>
          </div>
          <div className='overflow-auto'>
            <table className='admin-table'>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Dente</th>
                  <th>Condição</th>
                  <th>Planejado</th>
                  <th>Realizado</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {entries.slice(0, 30).map((r) => (
                  <tr
                    key={r.id}
                    className={`cursor-pointer hover:bg-[#f0f9ff] transition-colors ${
                      selectedCode === r.tooth_code ? 'bg-[#e0f2fe]' : ''
                    }`}
                    onClick={() => handleSelect(r.tooth_code)}
                    title={`Clique para selecionar o dente ${r.tooth_code}`}
                  >
                    <td className='font-medium'>{r.patient_name}</td>
                    <td>
                      <span className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0e7490]/10 text-[#0e7490] text-xs font-bold'>
                        {r.tooth_code}
                      </span>
                    </td>
                    <td>
                      {r.condition ? (
                        <span
                          className='badge'
                          style={{
                            background: CONDITION_COLOR[r.condition]?.fill ?? '#e5e7eb',
                            color: CONDITION_COLOR[r.condition]?.text ?? '#374151',
                          }}
                        >
                          {r.condition}
                        </span>
                      ) : (
                        <span className='text-[--text-muted]'>—</span>
                      )}
                    </td>
                    <td className='text-[--text-muted] max-w-[160px] truncate'>{r.planned_procedure || '—'}</td>
                    <td className='text-[--text-muted] max-w-[160px] truncate'>{r.performed_procedure || '—'}</td>
                    <td className='text-[--text-muted] whitespace-nowrap'>
                      {new Date(r.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* painel do dente selecionado */}
      {selectedTooth && (
        <ToothPanel
          tooth={selectedTooth}
          entries={toothEntries}
          patients={patients}
          saveAction={saveAction}
          deleteAction={deleteAction}
          onClose={() => setSelectedCode(null)}
        />
      )}
    </section>
  )
}
