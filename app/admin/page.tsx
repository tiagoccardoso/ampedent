'use client'

import { useAuth } from '@/app/components/AppProvider'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'

type Mode = 'login' | 'register' | 'forgot'

function Admin() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mode, setMode] = useState<Mode>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resetUrl, setResetUrl] = useState('')
  const { status, refreshSession } = useAuth()
  const router = useRouter()

  useEffect(() => {
    document.title = 'Entrar administrativo | DentalSys'
  }, [])

  useEffect(() => {
    if (status === 'authenticated') router.push('/admin/dashboard')
  }, [router, status])

  function switchMode(next: Mode) {
    setMode(next)
    setError('')
    setSuccess('')
    setResetUrl('')
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isLoading) return

    try {
      setIsLoading(true)
      setError('')
      setSuccess('')
      setResetUrl('')

      if (mode === 'forgot') {
        if (!email) return
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)
        setSuccess(data.message)
        if (data.resetUrl) setResetUrl(data.resetUrl)
        return
      }

      if (!email || !password || (mode === 'register' && !name)) return
      if (mode === 'register' && password !== confirmPassword) {
        setError('A confirmação de senha não confere.')
        return
      }

      const res = await fetch(
        mode === 'register' ? '/api/auth/register' : '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ name, email, password, confirmPassword }),
          headers: { 'Content-Type': 'application/json' },
        },
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Não foi possível autenticar')

      if (mode === 'register' && data.authenticated === false) {
        setSuccess(data.message)
        return
      }

      await refreshSession()
      router.push('/admin/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const isRegister = mode === 'register'
  const isForgot = mode === 'forgot'

  return (
    <section className='flex min-h-[100dvh] w-full items-center justify-center bg-slate-50 px-4 py-8 sm:px-6'>
      <div className='w-full max-w-[28rem] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8'>
        <form className='flex w-full flex-col gap-4' onSubmit={handleSubmit} aria-busy={isLoading}>

          <h1 className='text-center text-2xl font-semibold text-slate-900 sm:text-3xl'>
            {isForgot
              ? 'Recuperar senha'
              : isRegister
                ? 'Criar conta DentalSys'
                : 'Entrar na DentalSys'}
          </h1>

          {isForgot && (
            <p className='text-center text-sm text-slate-500'>
              Informe seu e-mail cadastrado para gerar um link de redefinição.
            </p>
          )}

          {isRegister && (
            <div className='flex flex-col gap-2'>
              <label htmlFor='name' className='text-sm font-medium text-slate-700'>Nome</label>
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
            <label htmlFor='email' className='text-sm font-medium text-slate-700'>E-mail</label>
            <input
              disabled={isLoading}
              autoFocus={!isRegister}
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

          {!isForgot && (
            <div className='flex flex-col gap-2'>
              <div className='flex items-center justify-between'>
                <label htmlFor='password' className='text-sm font-medium text-slate-700'>Senha</label>
                {!isRegister && (
                  <button
                    type='button'
                    onClick={() => switchMode('forgot')}
                    className='text-xs text-blue-700 hover:underline underline-offset-2 transition'>
                    Esqueci a senha
                  </button>
                )}
              </div>
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
          )}

          {isRegister && (
            <div className='flex flex-col gap-2'>
              <label htmlFor='confirm-password' className='text-sm font-medium text-slate-700'>Confirmar senha</label>
              <input
                disabled={isLoading}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                type='password'
                id='confirm-password'
                name='confirmPassword'
                placeholder='Confirme a senha'
                className='min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100'
                required
              />
            </div>
          )}

          {error && (
            <p className='rounded-md border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700'>{error}</p>
          )}
          {success && (
            <p className='rounded-md border border-green-200 bg-green-50 px-3 py-2 text-center text-sm text-green-700'>{success}</p>
          )}

          {resetUrl && (
            <div className='rounded-md border border-blue-200 bg-blue-50 px-3 py-3 text-sm text-blue-800'>
              <p className='mb-2 font-medium'>Link de redefinição gerado:</p>
              <a
                href={resetUrl}
                className='block break-all text-blue-700 underline underline-offset-2 hover:text-blue-900'>
                {resetUrl}
              </a>
              <p className='mt-2 text-xs text-blue-600'>Este link expira em 2 horas.</p>
            </div>
          )}

          <button
            disabled={isLoading}
            type='submit'
            className='mt-2 min-h-11 w-full rounded-md bg-blue-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400'>
            {isLoading
              ? isForgot ? 'Gerando link...' : isRegister ? 'Cadastrando...' : 'Entrando...'
              : isForgot ? 'Gerar link de redefinição' : isRegister ? 'Cadastrar' : 'Entrar'}
          </button>

          {isForgot ? (
            <button
              type='button'
              disabled={isLoading}
              onClick={() => switchMode('login')}
              className='mx-auto text-sm font-medium text-blue-700 underline-offset-2 transition hover:text-blue-800 hover:underline disabled:cursor-not-allowed disabled:text-slate-500'>
              Voltar ao login
            </button>
          ) : (
            <button
              disabled={isLoading}
              type='button'
              className='mx-auto mt-2 text-sm font-medium text-blue-700 underline-offset-2 transition hover:text-blue-800 hover:underline disabled:cursor-not-allowed disabled:text-slate-500'
              onClick={() => switchMode(isRegister ? 'login' : 'register')}>
              {isRegister ? 'Já tenho uma conta administrativa' : 'Cadastrar novo usuário'}
            </button>
          )}
        </form>
      </div>
    </section>
  )
}

export default Admin
