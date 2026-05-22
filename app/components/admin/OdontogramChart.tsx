'use client'

import { OdontogramaRegistro, ToothCondition } from '@/lib/types'
import { useState } from 'react'

const CONDITION_COLORS: Record<ToothCondition, string> = {
  higido: '#e5f0ff',
  carie: '#ef4444',
  restaurado: '#3b82f6',
  extracao_indicada: '#f97316',
  extraido: '#6b7280',
  ausente: '#d1d5db',
  coroa: '#8b5cf6',
  implante: '#10b981',
  tratamento_canal: '#ec4899',
  faceta: '#06b6d4',
  selante: '#84cc16',
  fraturado: '#dc2626',
  manchado: '#f59e0b',
  outro: '#94a3b8',
}

const CONDITION_LABELS: Record<ToothCondition, string> = {
  higido: 'Hígido',
  carie: 'Cárie',
  restaurado: 'Restaurado',
  extracao_indicada: 'Extração indicada',
  extraido: 'Extraído',
  ausente: 'Ausente',
  coroa: 'Coroa',
  implante: 'Implante',
  tratamento_canal: 'Tratamento de canal',
  faceta: 'Faceta',
  selante: 'Selante',
  fraturado: 'Fraturado',
  manchado: 'Manchado',
  outro: 'Outro',
}

const ADULT_UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
const ADULT_LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]

function Tooth({
  number,
  condition,
  onClick,
  selected,
}: {
  number: number
  condition?: ToothCondition
  onClick: () => void
  selected: boolean
}) {
  const fill = condition ? CONDITION_COLORS[condition] : CONDITION_COLORS.higido
  const stroke = selected ? '#1d4ed8' : '#94a3b8'
  const strokeWidth = selected ? 2 : 1

  return (
    <button
      type='button'
      onClick={onClick}
      title={`Dente ${number}${condition ? ` — ${CONDITION_LABELS[condition]}` : ''}`}
      className='flex flex-col items-center gap-0.5 group'>
      <svg width='28' height='34' viewBox='0 0 28 34'>
        <path
          d='M4 6 Q14 2 24 6 L26 20 Q20 30 14 32 Q8 30 2 20 Z'
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          className='transition-all group-hover:stroke-blue-400'
        />
        {condition && condition !== 'higido' && (
          <circle cx='14' cy='17' r='4' fill={CONDITION_COLORS[condition]} stroke='rgba(0,0,0,0.2)' strokeWidth='0.5' />
        )}
      </svg>
      <span className={`text-[9px] font-mono ${selected ? 'text-blue-700 font-bold' : 'text-gray-400'}`}>
        {number}
      </span>
    </button>
  )
}

export default function OdontogramChart({
  registros,
  onToothClick,
  selectedTooth,
}: {
  registros: OdontogramaRegistro[]
  onToothClick: (toothNumber: number) => void
  selectedTooth: number | null
}) {
  const conditionMap = new Map<number, ToothCondition>()
  for (const r of registros) {
    conditionMap.set(r.dente_numero, r.condicao)
  }

  return (
    <div className='space-y-4'>
      <div className='bg-white rounded-xl border border-gray-200 p-4'>
        <div className='overflow-x-auto'>
          <div className='min-w-[480px] space-y-4'>
            <div className='flex justify-center gap-0.5'>
              {ADULT_UPPER.map(n => (
                <Tooth
                  key={n}
                  number={n}
                  condition={conditionMap.get(n)}
                  onClick={() => onToothClick(n)}
                  selected={selectedTooth === n}
                />
              ))}
            </div>

            <div className='flex items-center gap-2 text-xs text-gray-400'>
              <div className='flex-1 border-t border-dashed border-gray-200' />
              <span>arcada inferior</span>
              <div className='flex-1 border-t border-dashed border-gray-200' />
            </div>

            <div className='flex justify-center gap-0.5'>
              {ADULT_LOWER.map(n => (
                <Tooth
                  key={n}
                  number={n}
                  condition={conditionMap.get(n)}
                  onClick={() => onToothClick(n)}
                  selected={selectedTooth === n}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='flex flex-wrap gap-2 text-xs'>
        {(Object.entries(CONDITION_LABELS) as [ToothCondition, string][]).map(([key, label]) => (
          <div key={key} className='flex items-center gap-1'>
            <div className='w-3 h-3 rounded-sm border border-gray-300' style={{ background: CONDITION_COLORS[key] }} />
            <span className='text-gray-500'>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
