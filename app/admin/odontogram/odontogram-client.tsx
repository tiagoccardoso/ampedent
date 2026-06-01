'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SubmitButton } from '../_components/submit-button'
import { ODONTOGRAM_STATUS, type OdontogramEntry, type PatientOption, type ProcedureOption, type ToothCode } from './odontogram-data'

type Action = (formData: FormData) => void | Promise<void>

type OdontogramClientProps = {
  patients: PatientOption[]
  procedures: ProcedureOption[]
  entries: OdontogramEntry[]
  selectedPatientId: string
  saveAction: Action
  deleteAction: Action
}

const upperRight = ['18', '17', '16', '15', '14', '13', '12', '11'] as ToothCode[]
const upperLeft = ['21', '22', '23', '24', '25', '26', '27', '28'] as ToothCode[]
const lowerRight = ['48', '47', '46', '45', '44', '43', '42', '41'] as ToothCode[]
const lowerLeft = ['31', '32', '33', '34', '35', '36', '37', '38'] as ToothCode[]

function normalizeDate(value: string | null) {
  if (!value) return ''
  return value.slice(0, 10)
}

type ToothType = 'molar' | 'premolar' | 'canine' | 'incisor'

function getToothType(code: string): ToothType {
  if (['18','17','16','26','27','28','48','47','46','36','37','38'].includes(code)) return 'molar'
  if (['15','14','24','25','45','44','34','35'].includes(code)) return 'premolar'
  if (['13','23','43','33'].includes(code)) return 'canine'
  return 'incisor'
}

type ToothStatus = 'planned' | 'in_progress' | 'completed' | 'canceled'

const STATUS_CONFIG: Record<ToothStatus, { ring: string; fill: string; dot: string; label: string; bg: string; text: string; border: string }> = {
  planned:     { ring: '#f59e0b', fill: '#fffbeb', dot: '#f59e0b', label: 'Planejado',    bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  in_progress: { ring: '#3b82f6', fill: '#eff6ff', dot: '#3b82f6', label: 'Em andamento', bg: '#dbeafe', text: '#1e3a8a', border: '#93c5fd' },
  completed:   { ring: '#10b981', fill: '#ecfdf5', dot: '#10b981', label: 'Concluído',    bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  canceled:    { ring: '#9ca3af', fill: '#f9fafb', dot: '#9ca3af', label: 'Cancelado',    bg: '#f3f4f6', text: '#374151', border: '#d1d5db' },
}

function getToothStatus(entries: OdontogramEntry[] | undefined): ToothStatus | null {
  if (!entries?.length) return null
  const priority: ToothStatus[] = ['in_progress', 'planned', 'completed', 'canceled']
  for (const p of priority) {
    if (entries.some(e => e.status === p)) return p
  }
  return entries[0].status as ToothStatus
}

// ─── Tooth SVG anatomical shapes ───────────────────────────────────────────
function ToothSvg({
  code,
  arch,
  status,
  selected,
}: {
  code: string
  arch: 'upper' | 'lower'
  status: ToothStatus | null
  selected: boolean
}) {
  const type = getToothType(code)
  const cfg = status ? STATUS_CONFIG[status] : null
  const crownFill = cfg?.fill ?? '#ffffff'
  const crownStroke = selected ? '#003441' : cfg?.ring ?? '#94a3b8'
  const rootStroke = selected ? '#003441' : cfg?.ring ?? '#94a3b8'
  const strokeW = selected ? 2.5 : status ? 2 : 1.8

  // Gradient id unique per tooth
  const gradId = `tg-${code}`
  const shimId = `ts-${code}`

  // crown shape varies by tooth type and arch
  // All shapes drawn as upper teeth; lower teeth are flipped vertically
  let crownPath = ''
  let rootPaths: string[] = []
  let groovePath = ''
  let viewW = 36
  let viewH = 78

  if (type === 'incisor') {
    viewW = 34; viewH = 76
    crownPath = 'M6 6 C6 4 8 2 17 2 C26 2 28 4 28 6 L29 36 C29 42 24 48 17 48 C10 48 5 42 5 36 Z'
    rootPaths = ['M17 48 C16 58 15 66 14 74']
    groovePath = 'M11 20 C14 24 20 24 23 20'
  } else if (type === 'canine') {
    viewW = 34; viewH = 82
    crownPath = 'M7 8 C7 5 10 2 17 2 C24 2 27 5 27 8 L28 32 C28 42 24 52 17 56 C10 52 6 42 6 32 Z'
    rootPaths = ['M17 56 C16 64 15 72 14 80']
    groovePath = 'M11 22 C14 26 20 26 23 22'
  } else if (type === 'premolar') {
    viewW = 38; viewH = 78
    crownPath = 'M5 10 C5 5 9 2 19 2 C29 2 33 5 33 10 L33 34 C33 44 27 50 19 50 C11 50 5 44 5 34 Z'
    rootPaths = [
      'M14 50 C13 60 12 68 11 76',
      'M24 50 C25 60 26 68 27 76',
    ]
    groovePath = 'M10 22 L10 32 M28 22 L28 32 M13 18 C16 22 22 22 25 18'
  } else {
    // molar
    viewW = 52; viewH = 80
    crownPath = 'M5 12 C5 6 10 2 26 2 C42 2 47 6 47 12 L47 36 C47 48 39 56 26 56 C13 56 5 48 5 36 Z'
    rootPaths = [
      'M14 56 C12 64 11 70 10 78',
      'M26 56 C26 64 26 70 26 78',
      'M38 56 C40 64 41 70 42 78',
    ]
    groovePath = 'M13 24 L13 38 M39 24 L39 38 M18 18 C22 24 30 24 34 18'
  }

  const isLower = arch === 'lower'
  const transform = isLower ? `translate(${viewW} ${viewH}) rotate(180)` : ''

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      width={viewW}
      height={viewH}
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
      className='drop-shadow-sm'
    >
      <defs>
        <linearGradient id={gradId} x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#ffffff' stopOpacity='0.95' />
          <stop offset='40%' stopColor={crownFill} stopOpacity='1' />
          <stop offset='100%' stopColor={cfg?.ring ?? '#e2e8f0'} stopOpacity='0.3' />
        </linearGradient>
        <linearGradient id={shimId} x1='20%' y1='0%' x2='60%' y2='60%'>
          <stop offset='0%' stopColor='#ffffff' stopOpacity='0.7' />
          <stop offset='100%' stopColor='#ffffff' stopOpacity='0' />
        </linearGradient>
      </defs>

      <g transform={transform}>
        {/* Roots */}
        {rootPaths.map((d, i) => (
          <path key={i} d={d} fill='none' stroke={rootStroke} strokeWidth={strokeW - 0.4} strokeLinecap='round' opacity='0.7' />
        ))}

        {/* Crown base */}
        <path d={crownPath} fill={`url(#${gradId})`} stroke={crownStroke} strokeWidth={strokeW} strokeLinejoin='round' />

        {/* Enamel shimmer */}
        <path d={crownPath} fill={`url(#${shimId})`} />

        {/* Anatomical groove */}
        <path d={groovePath} fill='none' stroke={cfg?.ring ?? '#cbd5e1'} strokeWidth='1.4' strokeLinecap='round' opacity='0.6' />
      </g>

      {/* Selected ring glow */}
      {selected && (
        <rect
          x='1' y='1' width={viewW - 2} height={viewH - 2}
          rx='6' fill='none' stroke='#003441' strokeWidth='2.5' strokeDasharray='5 3' opacity='0.7'
        />
      )}
    </svg>
  )
}

// ─── Tooth Button ────────────────────────────────────────────────────────────
function ToothButton({
  code,
  arch,
  entries,
  selected,
  disabled,
  onSelect,
}: {
  code: ToothCode
  arch: 'upper' | 'lower'
  entries?: OdontogramEntry[]
  selected: boolean
  disabled: boolean
  onSelect: (code: ToothCode) => void
}) {
  const status = getToothStatus(entries)
  const cfg = status ? STATUS_CONFIG[status] : null
  const hasEntry = Boolean(entries?.length)

  const borderClass = selected
    ? 'border-[#003441] shadow-md'
    : hasEntry
      ? 'border-2'
      : 'border-gray-200 hover:border-[#003441]/40'

  const bgClass = selected
    ? 'bg-[#003441]/8'
    : hasEntry
      ? ''
      : 'bg-white hover:bg-[#003441]/5'

  return (
    <button
      type='button'
      disabled={disabled}
      onClick={() => onSelect(code)}
      className={`group flex flex-col items-center rounded-xl border p-1.5 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${borderClass} ${bgClass}`}
      style={hasEntry && !selected ? { borderColor: cfg?.ring, backgroundColor: cfg?.fill } : undefined}
      aria-label={`Dente ${code}${hasEntry ? ` — ${cfg?.label}` : ''}`}
      aria-pressed={selected}
    >
      <ToothSvg code={code} arch={arch} status={status} selected={selected} />

      <span
        className='mt-1 text-[11px] font-bold tabular-nums'
        style={{ color: selected ? '#003441' : cfg?.text ?? '#64748b' }}
      >
        {code}
      </span>

      {/* Status dot */}
      {status ? (
        <span
          className='mt-0.5 h-2 w-2 rounded-full'
          style={{ backgroundColor: cfg?.dot }}
          aria-hidden='true'
        />
      ) : (
        <span className='mt-0.5 h-2 w-2' aria-hidden='true' />
      )}
    </button>
  )
}

// ─── Quadrant ────────────────────────────────────────────────────────────────
function Quadrant({
  title,
  teeth,
  arch,
  entriesByTooth,
  selectedTooth,
  disabled,
  onSelect,
}: {
  title: string
  teeth: ToothCode[]
  arch: 'upper' | 'lower'
  entriesByTooth: Map<string, OdontogramEntry[]>
  selectedTooth: ToothCode | null
  disabled: boolean
  onSelect: (code: ToothCode) => void
}) {
  return (
    <div className='rounded-2xl border border-[#e6e8e9] bg-white p-3 shadow-sm'>
      <p
        className='mb-3 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-[#70787c]'
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {title}
      </p>
      <div className='flex flex-wrap justify-center gap-1 sm:flex-nowrap'>
        {teeth.map(code => (
          <ToothButton
            key={code}
            code={code}
            arch={arch}
            entries={entriesByTooth.get(code)}
            selected={selectedTooth === code}
            disabled={disabled}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as ToothStatus]
  if (!cfg) return <span className='text-xs text-[#70787c]'>{status}</span>
  return (
    <span
      className='inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide'
      style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {cfg.label}
    </span>
  )
}

// ─── Main client component ────────────────────────────────────────────────────
export function OdontogramClient({ patients, procedures, entries, selectedPatientId, saveAction, deleteAction }: OdontogramClientProps) {
  const router = useRouter()
  const [selectedTooth, setSelectedTooth] = useState<ToothCode | null>(null)
  const selectedPatient = patients.find(p => p.id === selectedPatientId)

  const entriesByTooth = useMemo(() => {
    const map = new Map<string, OdontogramEntry[]>()
    entries
      .filter(e => !selectedPatientId || e.patient_id === selectedPatientId)
      .forEach(e => map.set(e.tooth_code, [...(map.get(e.tooth_code) ?? []), e]))
    return map
  }, [entries, selectedPatientId])

  const selectedEntries = selectedTooth ? (entriesByTooth.get(selectedTooth) ?? []) : []
  const currentEntry = selectedEntries[0]
  const disabledChart = !selectedPatientId

  function changePatient(patientId: string) {
    setSelectedTooth(null)
    router.push(patientId ? `/admin/odontogram?patient_id=${patientId}` : '/admin/odontogram')
  }

  function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    if (!window.confirm(`Remover o procedimento registrado no dente ${selectedTooth}? Esta ação não pode ser desfeita.`)) {
      e.preventDefault()
    }
  }

  // Count by status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    entries.filter(e => !selectedPatientId || e.patient_id === selectedPatientId).forEach(e => {
      counts[e.status] = (counts[e.status] ?? 0) + 1
    })
    return counts
  }, [entries, selectedPatientId])

  return (
    <div className='space-y-6'>
      {/* Patient selector */}
      <div className='rounded-2xl border border-[#e6e8e9] bg-white p-5 shadow-sm'>
        <label
          htmlFor='patient_selector'
          className='mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#40484b]'
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Paciente do odontograma
        </label>
        <select
          id='patient_selector'
          value={selectedPatientId}
          onChange={e => changePatient(e.target.value)}
        >
          <option value=''>Selecione um paciente para habilitar o mapa dental</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.full_name}</option>
          ))}
        </select>
        {!selectedPatientId && (
          <p className='mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800'>
            ⚠️ Escolha um paciente antes de registrar procedimentos nos dentes.
          </p>
        )}
      </div>

      {/* Chart + sidebar */}
      <div className='grid gap-5 xl:grid-cols-[1fr_320px]'>

        {/* Dental chart */}
        <div className='rounded-3xl border border-[#e6e8e9] bg-[#f8fafb] p-4 sm:p-6'>

          {/* Legend */}
          <div className='mb-5 flex flex-wrap items-center justify-center gap-3'>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <span key={key} className='flex items-center gap-1.5 text-xs font-semibold' style={{ color: cfg.text }}>
                <span className='h-2.5 w-2.5 rounded-full flex-shrink-0' style={{ backgroundColor: cfg.dot }} />
                {cfg.label}
              </span>
            ))}
            <span className='flex items-center gap-1.5 text-xs font-semibold text-[#94a3b8]'>
              <span className='h-2.5 w-2.5 rounded-full bg-[#cbd5e1] flex-shrink-0' />
              Sem registro
            </span>
          </div>

          {/* Midline label */}
          <div className='mb-1 text-center'>
            <span className='text-[10px] font-bold uppercase tracking-[0.12em] text-[#70787c]' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Arcada superior
            </span>
          </div>

          {/* Upper arch */}
          <div className='grid gap-3 lg:grid-cols-2'>
            <Quadrant
              title='Superior direito (1)'
              teeth={upperRight}
              arch='upper'
              entriesByTooth={entriesByTooth}
              selectedTooth={selectedTooth}
              disabled={disabledChart}
              onSelect={setSelectedTooth}
            />
            <Quadrant
              title='Superior esquerdo (2)'
              teeth={upperLeft}
              arch='upper'
              entriesByTooth={entriesByTooth}
              selectedTooth={selectedTooth}
              disabled={disabledChart}
              onSelect={setSelectedTooth}
            />
          </div>

          {/* Midline divider */}
          <div className='my-4 flex items-center gap-3'>
            <div className='h-px flex-1 bg-[#c0c8cb]/60' />
            <span className='flex-shrink-0 rounded-full bg-[#003441] px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              linha média
            </span>
            <div className='h-px flex-1 bg-[#c0c8cb]/60' />
          </div>

          {/* Lower arch */}
          <div className='grid gap-3 lg:grid-cols-2'>
            <Quadrant
              title='Inferior direito (4)'
              teeth={lowerRight}
              arch='lower'
              entriesByTooth={entriesByTooth}
              selectedTooth={selectedTooth}
              disabled={disabledChart}
              onSelect={setSelectedTooth}
            />
            <Quadrant
              title='Inferior esquerdo (3)'
              teeth={lowerLeft}
              arch='lower'
              entriesByTooth={entriesByTooth}
              selectedTooth={selectedTooth}
              disabled={disabledChart}
              onSelect={setSelectedTooth}
            />
          </div>

          <div className='mt-1 text-center'>
            <span className='text-[10px] font-bold uppercase tracking-[0.12em] text-[#70787c]' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Arcada inferior
            </span>
          </div>

          {!selectedPatientId && (
            <div className='mt-4 rounded-xl border border-[#e6e8e9] bg-white/70 py-8 text-center text-sm text-[#70787c]'>
              🦷 Selecione um paciente acima para interagir com o mapa dental
            </div>
          )}
        </div>

        {/* Sidebar summary */}
        <aside className='rounded-2xl border border-[#e6e8e9] bg-white p-5 shadow-sm space-y-5'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.08em] text-[#40484b] mb-1' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Paciente</p>
            <p className='font-bold text-[#003441] text-base'>
              {selectedPatient ? selectedPatient.full_name : '—'}
            </p>
          </div>

          {/* Counters */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='rounded-xl bg-[#f8fafb] p-3 border border-[#e6e8e9]'>
              <p className='text-xs text-[#70787c]' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Dentes c/ registro</p>
              <p className='mt-1 text-2xl font-extrabold text-[#003441]'>{entriesByTooth.size}</p>
            </div>
            <div className='rounded-xl bg-[#f8fafb] p-3 border border-[#e6e8e9]'>
              <p className='text-xs text-[#70787c]' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Total procedimentos</p>
              <p className='mt-1 text-2xl font-extrabold text-[#003441]'>{entries.filter(e => !selectedPatientId || e.patient_id === selectedPatientId).length}</p>
            </div>
          </div>

          {/* Status breakdown */}
          {Object.keys(statusCounts).length > 0 && (
            <div className='space-y-2'>
              <p className='text-xs font-bold uppercase tracking-[0.08em] text-[#40484b]' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Por status</p>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const count = statusCounts[key] ?? 0
                if (!count) return null
                return (
                  <div key={key} className='flex items-center justify-between rounded-lg px-3 py-2' style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <span className='text-xs font-semibold' style={{ color: cfg.text }}>{cfg.label}</span>
                    <span className='text-sm font-extrabold' style={{ color: cfg.text }}>{count}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Recent entries */}
          <div className='space-y-2'>
            <p className='text-xs font-bold uppercase tracking-[0.08em] text-[#40484b]' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Registros recentes</p>
            {entries.filter(e => !selectedPatientId || e.patient_id === selectedPatientId).slice(0, 6).length === 0 ? (
              <p className='rounded-xl bg-[#f8fafb] p-3 text-sm text-[#70787c]'>
                Nenhum procedimento registrado.
              </p>
            ) : (
              entries
                .filter(e => !selectedPatientId || e.patient_id === selectedPatientId)
                .slice(0, 6)
                .map(entry => {
                  const s = getToothStatus([entry])
                  const cfg = s ? STATUS_CONFIG[s] : null
                  return (
                    <button
                      key={entry.id}
                      type='button'
                      onClick={() => setSelectedTooth(entry.tooth_code)}
                      className='w-full rounded-xl border p-3 text-left text-sm transition-all hover:-translate-y-0.5'
                      style={{ borderColor: cfg?.border ?? '#e6e8e9', background: cfg?.fill ?? '#ffffff' }}
                    >
                      <div className='flex items-center justify-between mb-1'>
                        <span className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>
                          Dente {entry.tooth_code}
                        </span>
                        {s && <StatusBadge status={s} />}
                      </div>
                      <span className='block text-[#40484b] text-xs truncate'>
                        {entry.procedure_name || entry.planned_procedure || 'Sem descrição'}
                      </span>
                    </button>
                  )
                })
            )}
          </div>
        </aside>
      </div>

      {/* Modal */}
      {selectedTooth && selectedPatientId && (
        <div
          className='fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4'
          role='dialog'
          aria-modal='true'
          aria-labelledby='odontoModal'
          onClick={e => { if (e.target === e.currentTarget) setSelectedTooth(null) }}
        >
          <div className='max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl'>

            {/* Modal header */}
            <div className='sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-3xl border-b border-[#f2f4f5] bg-white px-6 py-5'>
              <div className='flex items-center gap-4'>
                {/* Tooth mini preview */}
                <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-[#f8fafb] border border-[#e6e8e9]'>
                  <ToothSvg
                    code={selectedTooth}
                    arch={upperRight.includes(selectedTooth) || upperLeft.includes(selectedTooth) ? 'upper' : 'lower'}
                    status={getToothStatus(selectedEntries)}
                    selected={false}
                  />
                </div>
                <div>
                  <p className='text-xs font-bold uppercase tracking-[0.1em] text-[#30628a]' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Dente selecionado
                  </p>
                  <h2 id='odontoModal' className='text-2xl font-extrabold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Dente {selectedTooth}
                  </h2>
                  <p className='text-xs text-[#70787c]'>{selectedPatient?.full_name}</p>
                </div>
              </div>
              <button
                type='button'
                onClick={() => setSelectedTooth(null)}
                className='rounded-xl border border-[#e6e8e9] px-4 py-2 text-sm font-semibold text-[#40484b] hover:bg-[#f2f4f5] transition-colors'
              >
                ✕ Fechar
              </button>
            </div>

            {/* Form */}
            <form action={saveAction} className='p-6'>
              <input type='hidden' name='patient_id' value={selectedPatientId} />
              <input type='hidden' name='tooth_code' value={selectedTooth} />
              <input type='hidden' name='entry_id' value={currentEntry?.id ?? ''} />

              <div className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <label htmlFor='procedure_id'>Procedimento cadastrado</label>
                  <select id='procedure_id' name='procedure_id' defaultValue={currentEntry?.procedure_id ?? ''}>
                    <option value=''>Procedimento avulso / manual</option>
                    {procedures.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor='oStatus'>Status</label>
                  <select id='oStatus' name='status' defaultValue={currentEntry?.status ?? 'planned'}>
                    {ODONTOGRAM_STATUS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className='sm:col-span-2'>
                  <label htmlFor='planned_procedure'>Procedimento a realizar *</label>
                  <input
                    id='planned_procedure'
                    type='text'
                    name='planned_procedure'
                    required
                    maxLength={180}
                    defaultValue={currentEntry?.planned_procedure ?? currentEntry?.procedure_name ?? ''}
                    placeholder='Ex.: restauração em resina, limpeza, extração…'
                  />
                </div>

                <div>
                  <label htmlFor='condition'>Condição do dente</label>
                  <input
                    id='condition'
                    type='text'
                    name='condition'
                    maxLength={120}
                    defaultValue={currentEntry?.condition ?? ''}
                    placeholder='Ex.: cárie, fratura, sensibilidade'
                  />
                </div>

                <div>
                  <label htmlFor='scheduled_date'>Data prevista</label>
                  <input
                    id='scheduled_date'
                    name='scheduled_date'
                    type='date'
                    defaultValue={normalizeDate(currentEntry?.scheduled_date ?? null)}
                  />
                </div>

                <div className='sm:col-span-2'>
                  <label htmlFor='notes'>Observações clínicas</label>
                  <textarea
                    id='notes'
                    name='notes'
                    maxLength={1200}
                    rows={4}
                    defaultValue={currentEntry?.notes ?? ''}
                    placeholder='Registre observações relevantes para este dente.'
                    className='resize-y'
                  />
                </div>
              </div>

              <div className='mt-5 flex flex-col gap-3 border-t border-[#f2f4f5] pt-4 sm:flex-row sm:items-center sm:justify-between'>
                <p className='text-xs text-[#70787c]'>
                  Procedimento será vinculado ao paciente e ao dente {selectedTooth}.
                </p>
                <SubmitButton label={currentEntry ? '✓ Atualizar procedimento' : '✓ Salvar procedimento'} />
              </div>
            </form>

            {/* Delete */}
            {currentEntry && (
              <div className='mx-6 mb-5 rounded-xl border border-red-100 bg-red-50 p-4'>
                <p className='mb-3 text-sm font-semibold text-red-800'>⚠️ Zona de risco</p>
                <form action={deleteAction}>
                  <input type='hidden' name='patient_id' value={selectedPatientId} />
                  <input type='hidden' name='entry_id' value={currentEntry.id} />
                  <button
                    type='submit'
                    className='btn-danger'
                    onClick={handleDelete}
                  >
                    🗑 Remover procedimento deste dente
                  </button>
                </form>
              </div>
            )}

            {/* History */}
            {selectedEntries.length > 1 && (
              <div className='mx-6 mb-6 rounded-2xl border border-[#e6e8e9] bg-[#f8fafb] p-4'>
                <h3 className='font-bold text-[#003441] mb-3' style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Histórico do dente {selectedTooth}
                </h3>
                <ul className='space-y-2'>
                  {selectedEntries.slice(1).map(entry => {
                    const s = entry.status as ToothStatus
                    return (
                      <li key={entry.id} className='rounded-xl border border-[#e6e8e9] bg-white p-3 text-sm'>
                        <div className='flex items-center justify-between gap-2 mb-1'>
                          <span className='font-semibold text-[#003441]'>
                            {entry.procedure_name || entry.planned_procedure || 'Sem descrição'}
                          </span>
                          <StatusBadge status={s} />
                        </div>
                        <span className='text-xs text-[#70787c]'>
                          {normalizeDate(entry.scheduled_date) || 'Sem data prevista'}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
