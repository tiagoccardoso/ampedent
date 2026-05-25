'use client'

import { useState } from 'react'

export default function DeleteButton({
  label,
  onDelete,
}: {
  label: string
  onDelete: () => void
}) {
  const [confirming, setConfirming] = useState(false)

  return (
    <>
      <button type='button' className='btn btn-danger text-xs' onClick={() => setConfirming(true)}>
        {label}
      </button>

      {confirming && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
          onClick={() => setConfirming(false)}>
          <div
            className='card p-6 w-full max-w-sm'
            onClick={e => e.stopPropagation()}>
            <p className='text-slate-800 font-semibold mb-1'>Confirmar exclusão</p>
            <p className='text-slate-500 text-sm mb-5'>Esta ação não pode ser desfeita.</p>
            <div className='flex gap-3 justify-end'>
              <button type='button' className='btn' onClick={() => setConfirming(false)}>
                Cancelar
              </button>
              <button
                type='button'
                className='btn btn-danger'
                onClick={() => { onDelete(); setConfirming(false) }}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
