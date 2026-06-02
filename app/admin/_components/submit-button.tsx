'use client'
import { useFormStatus } from 'react-dom'

export function SubmitButton({ label = 'Salvar', variant = 'primary' }: { label?: string; variant?: 'primary' | 'secondary' }) {
  const { pending } = useFormStatus()

  if (variant === 'secondary') {
    return (
      <button className='btn-secondary' type='submit' disabled={pending}>
        {pending ? 'Salvando…' : label}
      </button>
    )
  }

  return (
    <button className='btn-primary' type='submit' disabled={pending}>
      {pending ? (
        <span className='flex items-center gap-2'>
          <svg className='animate-spin w-4 h-4' viewBox='0 0 24 24' fill='none'>
            <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' opacity='.3'/>
            <path d='M12 2a10 10 0 0 1 10 10' stroke='currentColor' strokeWidth='3' strokeLinecap='round'/>
          </svg>
          Salvando…
        </span>
      ) : (
        label
      )}
    </button>
  )
}
