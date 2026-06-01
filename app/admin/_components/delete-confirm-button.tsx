'use client'

import { useFormStatus } from 'react-dom'

export function DeleteConfirmButton({
  label = 'Excluir',
  message = 'Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.',
}: {
  label?: string
  message?: string
}) {
  const { pending } = useFormStatus()

  return (
    <button
      className='btn-danger'
      type='submit'
      disabled={pending}
      onClick={event => {
        if (!window.confirm(message)) event.preventDefault()
      }}>
      {pending ? (
        <span className='flex items-center gap-2'>
          <svg className='animate-spin w-3.5 h-3.5' viewBox='0 0 24 24' fill='none'>
            <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' opacity='.3'/>
            <path d='M12 2a10 10 0 0 1 10 10' stroke='currentColor' strokeWidth='3' strokeLinecap='round'/>
          </svg>
          Excluindo…
        </span>
      ) : (
        <>🗑 {label}</>
      )}
    </button>
  )
}
