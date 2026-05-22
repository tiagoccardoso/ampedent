'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/components/AppProvider'

import { FormEvent, useEffect, useState } from 'react'

function CreateUser() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'paciente' | 'doutor' | 'admin'>('paciente')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { status, session } = useAuth()
  const router = useRouter()

  useEffect(() => {
    document.title = 'Criar usuário | Admin | DentalSys'
  }, [])

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      if (!name || !email || !password) return
      setIsLoading(true)
      const body = { name, email, password, role }
      const res = await fetch('/api/users/register', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        router.push('/admin/users')
      }
      setIsLoading(false)
    } catch (err: unknown) {
      setIsLoading(false)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    }
  }
  if (status === 'unauthenticated') {
    router.push('/')
  }
  return (
    <section>
      <div className=' py-16 md:py-24 lg:py-32 p-4'>
        <form
          className='mx-auto mb-4 max-w-md w-full pb-4'
          onSubmit={handleLogin}>
          <h1 className='text-center text-3xl my-8'>
            Criar um novo usuário DentalSys
          </h1>
          <div className='relative'>
            <input
              disabled={isLoading}
              value={name}
              onChange={e => setName(e.target.value)}
              type='text'
              className='my-4 '
              name='name'
              placeholder='nome de usuário'
              required
            />
          </div>
          <div className='relative'>
            <input
              disabled={isLoading}
              value={email}
              onChange={e => setEmail(e.target.value)}
              type='email'
              className='my-4 '
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
              className='my-4 '
              placeholder='senha'
              required
            />
          </div>
          <div className='relative mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Função</label>
            <select
              disabled={isLoading}
              value={role}
              onChange={e => setRole(e.target.value as 'paciente' | 'doutor' | 'admin')}
              className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              name='role'
            >
              <option value='paciente'>Paciente</option>
              <option value='doutor'>Doutor</option>
              <option value='admin'>Admin</option>
              {session?.role === 'superadmin' && (
                <option value='superadmin'>Super Admin</option>
              )}
            </select>
          </div>
          {error && <p className='text-red-600 text-center my-4'>{error}</p>}
          <button
            disabled={isLoading}
            type='submit'
            className=' rounded px-6 py-3 text-center font-semibold text-white bg-blue-600  hover:bg-blue-800'>
            Criar usuário
          </button>
        </form>
      </div>
    </section>
  )
}

export default CreateUser
