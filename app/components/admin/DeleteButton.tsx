import { useState } from 'react'

export default function DeleteButton({
  label,
  onDelete,
}: {
  label: string
  onDelete: () => void
}) {
  const [showConfirmar, setShowConfirmar] = useState(false)

  return (
    <>
      <button
        type='button'
        className='text-xs px-3 py-1.5 rounded border border-red-300 text-red-600 hover:bg-red-50 transition-colors font-medium'
        onClick={() => setShowConfirmar(true)}>
        {label}
      </button>
      {showConfirmar && (
        <>
          <div className='fixed inset-0 z-40 bg-black/40' onClick={() => setShowConfirmar(false)} />
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='bg-white rounded-xl shadow-xl w-full max-w-sm p-6'>
              <h3 className='text-base font-semibold text-gray-900 mb-2'>Confirmar exclusão</h3>
              <p className='text-sm text-gray-600 mb-6'>Tem certeza de que deseja excluir? Esta ação não pode ser desfeita.</p>
              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={() => setShowConfirmar(false)}
                  className='flex-1 rounded-md px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors'>
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onDelete()
                    setShowConfirmar(false)
                  }}
                  type='button'
                  className='flex-1 rounded-md px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors'>
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
