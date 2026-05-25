import { useState } from 'react'

export default function DeleteButton({
  label,
  onDelete,
}: {
  label: string
  onDelete: () => void
}) {
  const [showConfirmar, setShowConfirmar] = useState(false)

  if (showConfirmar) {
    return (
      <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50'>
        <div className='bg-white rounded-xl border border-[#e5e7eb] shadow-modal p-6 max-w-sm w-full mx-4'>
          <h3 className='font-semibold text-[#0f172a] mb-2'>Confirmar exclusão</h3>
          <p className='text-sm text-[#64748b] mb-5'>Tem certeza de que deseja excluir este item? Esta ação não pode ser desfeita.</p>
          <div className='flex gap-3 justify-end'>
            <button
              type='button'
              className='px-4 py-2 text-sm font-medium text-[#64748b] border border-[#e5e7eb] rounded-lg hover:bg-[#f8f9ff] transition-colors'
              onClick={() => setShowConfirmar(false)}>
              Cancelar
            </button>
            <button
              onClick={() => { onDelete(); setShowConfirmar(false) }}
              type='button'
              className='px-4 py-2 text-sm font-medium bg-[#ba1a1a] text-white rounded-lg hover:bg-red-800 transition-colors'>
              Excluir
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      type='button'
      className='px-3 py-1.5 text-xs font-medium bg-[#ffdad6] text-[#ba1a1a] rounded-lg hover:bg-[#ffb4ab] transition-colors'
      onClick={() => setShowConfirmar(true)}>
      {label}
    </button>
  )
}
