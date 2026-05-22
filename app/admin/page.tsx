'use client'

import { useAuth } from '@/app/components/AppProvider'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'

function Admin() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { status, refreshSession } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isLoading) return

    try {
      if (!email || !password || (isRegistering && !name)) return
      setIsLoading(true)
      setError('')
      setSuccess('')

      const res = await fetch(
        isRegistering ? '/api/auth/register' : '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
          headers: { 'Content-Type': 'application/json' },
        },
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message ?? 'Não foi possível autenticar')
      }

      if (isRegistering && data.authenticated === false) {
        setSuccess(data.message)
        return
      }

      await refreshSession()
      router.push('/admin/bookings')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'Entrar administrativo | DentalSys'
  }, [])

  if (status === 'authenticated') {
    router.push('/admin/bookings')
  }

  return (
    <section className='flex min-h-[calc(100vh-220px)] items-center justify-center px-4 py-8 sm:py-10'>
      <div className='w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8'>
        <form className='flex w-full flex-col gap-4' onSubmit={handleSubmit} aria-busy={isLoading}>
          <h1 className='text-center text-2xl font-semibold text-slate-900 sm:text-3xl'>
            {isRegistering ? 'Criar conta DentalSys' : 'Entrar na DentalSys'}
          </h1>

          {isRegistering && (
            <div className='flex flex-col gap-2'>
              <label htmlFor='name' className='text-sm font-medium text-slate-700'>
                Nome
              </label>
              <input
                disabled={isLoading}
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                type='text'
                id='name'
                name='name'
                placeholder='Nome de usuário'
                className='min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100'
                required
              />
            </div>
          )}

          <div className='flex flex-col gap-2'>
            <label htmlFor='email' className='text-sm font-medium text-slate-700'>
              E-mail
            </label>
            <input
              disabled={isLoading}
              autoFocus={!isRegistering}
              value={email}
              onChange={e => setEmail(e.target.value)}
              type='email'
              id='email'
              name='email'
              placeholder='voce@empresa.com'
              className='min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100'
              required
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor='password' className='text-sm font-medium text-slate-700'>
              Senha
            </label>
            <input
              disabled={isLoading}
              value={password}
              onChange={e => setPassword(e.target.value)}
              type='password'
              id='password'
              name='password'
              placeholder='Digite sua senha'
              className='min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100'
              required
            />
          </div>

          {error && (
            <p className='rounded-md border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700'>
              {error}
            </p>
          )}
          {success && (
            <p className='rounded-md border border-green-200 bg-green-50 px-3 py-2 text-center text-sm text-green-700'>
              {success}
            </p>
          )}

          <button
            disabled={isLoading}
            type='submit'
            className='mt-2 min-h-11 w-full rounded-md bg-blue-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400'>
            {isLoading
              ? isRegistering
                ? 'Cadastrando...'
                : 'Entrando...'
              : isRegistering
                ? 'Cadastrar'
                : 'Entrar'}
          </button>

          <button
            disabled={isLoading}
            type='button'
            className='mx-auto mt-2 text-sm font-medium text-blue-700 underline-offset-2 transition hover:text-blue-800 hover:underline disabled:cursor-not-allowed disabled:text-slate-500'
            onClick={() => {
              setIsRegistering(prev => !prev)
              setError('')
              setSuccess('')
            }}>
            {isRegistering
              ? 'Já tenho uma conta administrativa'
              : 'Cadastrar novo usuário'}
          </button>
        </form>
      </div>
    </section>
  )
}
export default Admin
