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
  const { status, session, refreshSession } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
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

      const sessionRes = await fetch('/api/me', { cache: 'no-store' })
      const sessionData = sessionRes.ok ? await sessionRes.json() : null
      const userRole = sessionData?.role
      await refreshSession()
      if (userRole === 'paciente') {
        router.push('/portal')
      } else {
        router.push('/admin/bookings')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'Entrar administrativo | DentalSys'
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.role === 'paciente') {
        router.push('/portal')
      } else {
        router.push('/admin/bookings')
      }
    }
  }, [status, session, router])

  return (
    <section>
      <div className=' py-16 md:py-24 lg:py-32'>
        <form
          className='mx-auto mb-4 max-w-md w-full pb-4'
          onSubmit={handleSubmit}>
          <h1 className='text-center text-3xl my-8'>
            {isRegistering ? 'Criar conta DentalSys' : 'Entrar na DentalSys'}
          </h1>
          {isRegistering && (
            <div className='relative'>
              <input
                disabled={isLoading}
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                type='text'
                className='my-4'
                id='name'
                name='name'
                placeholder='nome de usuário'
                required
              />
            </div>
          )}
          <div className='relative'>
            <input
              disabled={isLoading}
              autoFocus={!isRegistering}
              value={email}
              onChange={e => setEmail(e.target.value)}
              type='email'
              className='my-4'
              id='email'
              name='email'
              placeholder='email'
              required
            />
          </div>
          <div className='relative mb-4 pb-2'>
            <input
              disabled={isLoading}
              value={password}
              onChange={e => setPassword(e.target.value)}
              type='password'
              id='password'
              name='password'
              className='my-4 '
              placeholder='senha'
              required
            />
          </div>
          {error && <p className='text-red-600 text-center my-4'>{error}</p>}
          {success && (
            <p className='text-green-600 text-center my-4'>{success}</p>
          )}
          <button
            disabled={isLoading}
            type='submit'
            className=' rounded px-6 py-3 text-center font-semibold text-white bg-blue-600  hover:bg-blue-800'>
            {isRegistering ? 'Cadastrar' : 'Entrar'}
          </button>
          <button
            disabled={isLoading}
            type='button'
            className='block mx-auto mt-6 text-blue-600 hover:text-blue-800'
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
