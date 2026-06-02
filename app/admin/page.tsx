'use client'

import { useAuth } from '@/app/components/AppProvider'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'

function ToothIcon() {
  return (
    <svg width='32' height='32' viewBox='0 0 28 28' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M14 3C10 3 6 6 6 10C6 13 8 15 8 17.5C8 21 10 25 12.5 25C13.8 25 14.5 22 14 22C13.5 22 14.2 25 15.5 25C18 25 20 21 20 17.5C20 15 22 13 22 10C22 6 18 3 14 3Z'
        fill='currentColor'
      />
    </svg>
  )
}

export default function Admin() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { status, refreshSession } = useAuth()
  const router = useRouter()

  useEffect(() => {
    document.title = 'Acesso administrativo | Odonto Prime Studio'
  }, [])

  useEffect(() => {
    if (status === 'authenticated') router.push('/admin/dashboard')
  }, [router, status])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isLoading) return

    try {
      if (!email || !password || (isRegistering && !name)) return
      if (isRegistering && password !== confirmPassword) {
        setError('A confirmação de senha não confere.')
        return
      }
      setIsLoading(true)
      setError('')
      setSuccess('')

      const res = await fetch(isRegistering ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, confirmPassword }),
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Não foi possível autenticar')

      if (isRegistering && data.authenticated === false) {
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

  return (
    <section
      className='flex min-h-[100dvh] w-full items-center justify-center px-5 py-10'
      style={{ background: 'linear-gradient(135deg, #003441 0%, #0f4c5c 55%, #30628a 100%)' }}>

      {/* Decorative orbs */}
      <div
        className='fixed top-0 right-0 w-96 h-96 rounded-full pointer-events-none opacity-20'
        style={{ background: 'radial-gradient(circle, #9acee1, transparent 70%)', transform: 'translate(40%, -40%)' }}
      />
      <div
        className='fixed bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none opacity-15'
        style={{ background: 'radial-gradient(circle, #cca730, transparent 70%)', transform: 'translate(-40%, 40%)' }}
      />

      <div
        className='relative w-full max-w-[26rem] rounded-2xl overflow-hidden'
        style={{
          background: 'rgba(255,255,255,0.97)',
          boxShadow: '0 24px 64px rgba(0,52,65,0.3)',
        }}>

        {/* Top bar */}
        <div
          className='px-8 pt-8 pb-6 border-b border-[#f2f4f5] text-center'
          style={{ background: '#f8fafb' }}>
          <div
            className='w-14 h-14 rounded-2xl flex items-center justify-center text-white mx-auto mb-4'
            style={{ background: '#003441' }}>
            <ToothIcon />
          </div>
          <h1
            className='text-xl font-extrabold text-[#003441]'
            style={{ fontFamily: 'Manrope, sans-serif' }}>
            {isRegistering ? 'Criar conta' : 'Acesso administrativo'}
          </h1>
          <p
            className='mt-1 text-xs text-[#70787c]'
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Odonto Prime Studio
          </p>
        </div>

        {/* Form */}
        <form className='px-8 py-7 flex flex-col gap-5' onSubmit={handleSubmit} aria-busy={isLoading}>

          {isRegistering && (
            <div>
              <label htmlFor='name'>Nome de usuário</label>
              <input
                id='name'
                type='text'
                disabled={isLoading}
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder='Seu nome'
                required
              />
            </div>
          )}

          <div>
            <label htmlFor='email'>E-mail</label>
            <input
              id='email'
              type='email'
              disabled={isLoading}
              autoFocus={!isRegistering}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='voce@clinica.com.br'
              required
            />
          </div>

          <div>
            <label htmlFor='password'>Senha</label>
            <input
              id='password'
              type='password'
              disabled={isLoading}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='••••••••'
              required
            />
          </div>

          {isRegistering && (
            <div>
              <label htmlFor='confirm-password'>Confirmar senha</label>
              <input
                id='confirm-password'
                type='password'
                disabled={isLoading}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder='••••••••'
                required
              />
            </div>
          )}

          {error && (
            <div
              role='alert'
              className='flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
              <span>❌</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div
              role='status'
              className='flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'>
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}

          <button
            type='submit'
            disabled={isLoading}
            className='btn-primary w-full justify-center py-3.5 mt-1'>
            {isLoading
              ? isRegistering ? 'Cadastrando…' : 'Entrando…'
              : isRegistering ? 'Criar conta' : 'Entrar'}
          </button>

          <button
            type='button'
            disabled={isLoading}
            className='text-sm font-semibold text-center text-[#30628a] hover:text-[#003441] transition-colors disabled:opacity-50'
            onClick={() => {
              setIsRegistering(p => !p)
              setError('')
              setSuccess('')
            }}>
            {isRegistering ? '← Já tenho uma conta' : 'Cadastrar novo acesso'}
          </button>
        </form>
      </div>
    </section>
  )
}
