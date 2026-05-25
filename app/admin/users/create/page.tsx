'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/components/AppProvider'
import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'

function CreateUser() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    document.title = 'Criar usuário | Admin | DentalSys'
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!name || !email || !password || !confirmPassword) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }
    if (password !== confirmPassword) {
      setError('A confirmação de senha não confere.')
      return
    }
    try {
      setIsLoading(true)
      const res = await fetch('/api/users/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, confirmPassword }),
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/admin/users')
        return
      }
      setError(data.message ?? 'Não foi possível cadastrar o usuário.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'unauthenticated') router.push('/')

  return (
    <section className='space-y-5'>
      <div className='flex items-center gap-3'>
        <Link href='/admin/users' className='btn text-sm'>← Voltar</Link>
        <h1 className='page-title text-lg'>Novo usuário</h1>
      </div>

      <div className='card p-6 max-w-md'>
        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          <div className='field'>
            <label>Nome de usuário *</label>
            <input
              disabled={isLoading} value={name} onChange={e => setName(e.target.value)}
              type='text' placeholder='Nome' required autoFocus />
          </div>
          <div className='field'>
            <label>E-mail *</label>
            <input
              disabled={isLoading} value={email} onChange={e => setEmail(e.target.value)}
              type='email' placeholder='usuario@empresa.com' required />
          </div>
          <div className='field'>
            <label>Senha *</label>
            <input
              disabled={isLoading} value={password} onChange={e => setPassword(e.target.value)}
              type='password' placeholder='Senha' required />
          </div>
          <div className='field'>
            <label>Confirmar senha *</label>
            <input
              disabled={isLoading} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              type='password' placeholder='Confirme a senha' required />
          </div>

          {error   && <div className='alert alert-error'><span>{error}</span></div>}
          {success && <div className='alert alert-success'><span>{success}</span></div>}

          <button type='submit' className='btn btn-primary' disabled={isLoading}>
            {isLoading ? 'Criando…' : 'Criar usuário'}
          </button>
        </form>
      </div>
    </section>
  )
}
export default CreateUser
