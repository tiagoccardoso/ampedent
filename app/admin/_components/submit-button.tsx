'use client'
import { useFormStatus } from 'react-dom'

export function SubmitButton({ label = 'Salvar' }: { label?: string }) {
  const { pending } = useFormStatus()
  return (
    <button className='btn-primary' type='submit' disabled={pending}>
      {pending ? 'Salvando…' : label}
    </button>
  )
}
