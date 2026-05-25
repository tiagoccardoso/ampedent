'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const token = searchParams.get('token') ?? ''

  useEffect(() => {
    document.title = 'Redefinir senha | DentalSys'
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isLoading || !token) return
    setIsLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setSuccess(data.message)
      setTimeout(() => router.push('/admin'), 2500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <p className='rounded-md border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700'>
        Link inválido. Solicite um novo link de redefinição de senha.
      </p>
    )
  }

  return (
    <form className='flex w-full flex-col gap-4' onSubmit={handleSubmit}>
      <h1 className='text-center text-2xl font-semibold text-slate-900 sm:text-3xl'>
        Redefinir senha
      </h1>
      <p className='text-center text-sm text-slate-500'>
        Digite sua nova senha abaixo.
      </p>

      <div className='flex flex-col gap-2'>
        <label htmlFor='password' className='text-sm font-medium text-slate-700'>Nova senha</label>
        <input
          id='password'
          type='password'
          autoFocus
          disabled={isLoading || !!success}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder='Mínimo 6 caracteres'
          className='min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100'
          required
          minLength={6}
        />
      </div>

      <div className='flex flex-col gap-2'>
        <label htmlFor='confirm-password' className='text-sm font-medium text-slate-700'>Confirmar nova senha</label>
        <input
          id='confirm-password'
          type='password'
          disabled={isLoading || !!success}
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder='Repita a nova senha'
          className='min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100'
          required
        />
      </div>

      {error && (
        <p className='rounded-md border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700'>{error}</p>
      )}
      {success && (
        <p className='rounded-md border border-green-200 bg-green-50 px-3 py-2 text-center text-sm text-green-700'>{success}</p>
      )}

      <button
        type='submit'
        disabled={isLoading || !!success}
        className='mt-2 min-h-11 w-full rounded-md bg-blue-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400'>
        {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
      </button>

      <a href='/admin' className='mx-auto text-sm text-blue-700 hover:underline underline-offset-2'>
        Voltar ao login
      </a>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <section className='flex min-h-[100dvh] w-full items-center justify-center bg-slate-50 px-4 py-8 sm:px-6'>
      <div className='w-full max-w-[28rem] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8'>
        <Suspense fallback={<p className='text-center text-sm text-slate-500'>Carregando...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </section>
  )
}
