'use client'
import { useFormStatus } from 'react-dom'

export function SubmitButton({ label = 'Salvar' }: { label?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      className='px-5 py-2.5 rounded-lg bg-[#0e7490] text-white text-sm font-semibold hover:bg-[#005a71] disabled:opacity-60 disabled:cursor-not-allowed transition-colors'
      type='submit'
      disabled={pending}>
      {pending ? 'Salvando...' : label}
    </button>
  )
}
