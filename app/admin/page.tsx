'use client'

import { useAuth } from '@/app/components/AppProvider'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'

function Admin() {
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isLoading) return
    if (!email || !password || (isRegistering && !name)) return
    if (isRegistering && password !== confirmPassword) {
      setError('A confirmação de senha não confere.')
      return
    }
    try {
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

  useEffect(() => {
    document.title = 'Entrar | DentalSys Admin'
  }, [])

  useEffect(() => {
    if (status === 'authenticated') router.push('/admin/dashboard')
  }, [router, status])

  return (
    <section className='flex min-h-dvh w-full items-center justify-center bg-slate-50 px-4 py-8'>
      <div className='w-full max-w-sm'>
        {/* Header */}
        <div className='text-center mb-8'>
          <p className='text-2xl font-bold text-blue-700 mb-1'>DentalSys</p>
          <h1 className='text-lg font-semibold text-slate-800'>
            {isRegistering ? 'Criar conta administrativa' : 'Entrar no painel'}
          </h1>
          <p className='text-sm text-slate-500 mt-1'>
            {isRegistering ? 'Preencha seus dados para criar acesso' : 'Use suas credenciais para continuar'}
          </p>
        </div>

        <div className='card p-6'>
          <form className='flex flex-col gap-4' onSubmit={handleSubmit} aria-busy={isLoading}>
            {isRegistering && (
              <div className='field'>
                <label htmlFor='name'>Nome</label>
                <input
                  id='name' type='text' name='name'
                  disabled={isLoading} autoFocus value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder='Nome de usuário' required />
              </div>
            )}

            <div className='field'>
              <label htmlFor='email'>E-mail</label>
              <input
                id='email' type='email' name='email'
                disabled={isLoading} autoFocus={!isRegistering} value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='voce@empresa.com' required />
            </div>

            <div className='field'>
              <label htmlFor='password'>Senha</label>
              <input
                id='password' type='password' name='password'
                disabled={isLoading} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='Digite sua senha' required />
            </div>

            {isRegistering && (
              <div className='field'>
                <label htmlFor='confirm-password'>Confirmar senha</label>
                <input
                  id='confirm-password' type='password' name='confirmPassword'
                  disabled={isLoading} value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder='Confirme a senha' required />
              </div>
            )}

            {error   && <div className='alert alert-error'><span>{error}</span></div>}
            {success && <div className='alert alert-success'><span>{success}</span></div>}

            <button
              disabled={isLoading}
              type='submit'
              className='btn btn-primary w-full h-11 mt-1'>
              {isLoading
                ? (isRegistering ? 'Cadastrando…' : 'Entrando…')
                : (isRegistering ? 'Cadastrar' : 'Entrar')}
            </button>
          </form>
        </div>

        <button
          disabled={isLoading}
          type='button'
          className='w-full mt-4 text-sm text-blue-700 hover:underline disabled:opacity-50 text-center'
          onClick={() => { setIsRegistering(p => !p); setError(''); setSuccess('') }}>
          {isRegistering ? 'Já tenho uma conta' : 'Criar nova conta administrativa'}
        </button>
      </div>
    </section>
  )
}
export default Admin
