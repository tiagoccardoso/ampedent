'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/components/AppProvider'

const ROLE_LABELS: Record<string, string> = {
  paciente: 'Paciente',
  doutor: 'Doutor(a)',
  admin: 'Administrador',
  superadmin: 'Super Admin',
}

function FieldError({ msg }: { msg: string }) {
  return <p className='mt-1 text-xs text-red-600'>{msg}</p>
}

export default function CreateUserPage() {
  const router = useRouter()
  const { session, status } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<string>('paciente')
  const [image, setImage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const isSuperAdmin = session?.role === 'superadmin'
  const isAdmin = session?.role === 'admin' || isSuperAdmin

  useEffect(() => {
    document.title = 'Novo usuário | Admin | DentalSys'
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin')
    if (status === 'authenticated' && !isAdmin) router.push('/admin/dashboard')
  }, [status, isAdmin, router])

  function validate(): boolean {
    const errs: Record<string, string> = {}

    if (name.trim().length < 3) errs.name = 'Nome deve ter pelo menos 3 caracteres.'
    if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Informe um e-mail válido.'
    if (password.length < 6) errs.password = 'Senha deve ter pelo menos 6 caracteres.'
    if (password !== confirmPassword) errs.confirmPassword = 'As senhas não coincidem.'
    if (image && !/^https?:\/\/.+/.test(image.trim())) errs.image = 'Informe uma URL válida (começando com http:// ou https://).'

    const adminOnlyRoles = ['admin', 'superadmin']
    if (adminOnlyRoles.includes(role) && !isSuperAdmin) {
      errs.role = 'Somente Super Admin pode criar usuários administradores.'
    }

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
          role,
          image: image.trim() || undefined,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.message ?? 'Não foi possível criar o usuário.')
      }

      setSuccess(`Usuário "${data.name ?? name}" criado com sucesso!`)
      setTimeout(() => router.push('/admin/users'), 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') return null

  return (
    <div className='space-y-6 max-w-2xl'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <Link href='/admin/users' className='text-gray-400 hover:text-gray-600 transition-colors'>
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
          </svg>
        </Link>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Novo usuário</h1>
          <p className='text-sm text-gray-500 mt-0.5'>Cadastre um novo usuário no sistema</p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className='rounded-md bg-red-50 border border-red-200 p-4'>
          <p className='text-red-700 text-sm'>{error}</p>
        </div>
      )}

      {/* Success banner */}
      {success && (
        <div className='rounded-md bg-green-50 border border-green-200 p-4'>
          <p className='text-green-700 text-sm'>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-5' noValidate>
        {/* Dados da conta */}
        <fieldset className='bg-white rounded-xl border border-gray-200 p-5 space-y-4'>
          <legend className='text-sm font-semibold text-gray-700 px-1'>Dados da conta</legend>

          <div>
            <label htmlFor='name'>
              Nome completo <span className='text-red-500'>*</span>
            </label>
            <input
              id='name'
              type='text'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Nome do usuário'
              autoComplete='name'
              disabled={isLoading}
              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
            />
            {fieldErrors.name && <FieldError msg={fieldErrors.name} />}
          </div>

          <div>
            <label htmlFor='email'>
              E-mail <span className='text-red-500'>*</span>
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='usuario@exemplo.com'
              autoComplete='email'
              disabled={isLoading}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email && <FieldError msg={fieldErrors.email} />}
          </div>
        </fieldset>

        {/* Senha */}
        <fieldset className='bg-white rounded-xl border border-gray-200 p-5 space-y-4'>
          <legend className='text-sm font-semibold text-gray-700 px-1'>Senha de acesso</legend>

          <div>
            <label htmlFor='password'>
              Senha <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='Mínimo 6 caracteres'
                autoComplete='new-password'
                disabled={isLoading}
                className='pr-10'
              />
              <button
                type='button'
                onClick={() => setShowPassword(v => !v)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                {showPassword ? (
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                      d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' />
                  </svg>
                ) : (
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                      d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                  </svg>
                )}
              </button>
            </div>
            {password.length > 0 && (
              <div className='mt-1 flex items-center gap-2'>
                <div className='flex gap-1 flex-1'>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                      password.length === 0 ? 'bg-gray-200'
                      : password.length < 6 ? (i < 1 ? 'bg-red-400' : 'bg-gray-200')
                      : password.length < 10 ? (i < 2 ? 'bg-amber-400' : 'bg-gray-200')
                      : password.length < 14 ? (i < 3 ? 'bg-blue-400' : 'bg-gray-200')
                      : 'bg-green-500'
                    }`} />
                  ))}
                </div>
                <span className='text-xs text-gray-500'>
                  {password.length < 6 ? 'Muito curta' : password.length < 10 ? 'Fraca' : password.length < 14 ? 'Boa' : 'Forte'}
                </span>
              </div>
            )}
            {fieldErrors.password && <FieldError msg={fieldErrors.password} />}
          </div>

          <div>
            <label htmlFor='confirmPassword'>
              Confirmar senha <span className='text-red-500'>*</span>
            </label>
            <input
              id='confirmPassword'
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder='Repita a senha'
              autoComplete='new-password'
              disabled={isLoading}
            />
            {fieldErrors.confirmPassword && <FieldError msg={fieldErrors.confirmPassword} />}
          </div>
        </fieldset>

        {/* Perfil de acesso */}
        <fieldset className='bg-white rounded-xl border border-gray-200 p-5 space-y-4'>
          <legend className='text-sm font-semibold text-gray-700 px-1'>Perfil de acesso</legend>

          <div>
            <label htmlFor='role'>
              Função / Perfil <span className='text-red-500'>*</span>
            </label>
            <select
              id='role'
              value={role}
              onChange={e => setRole(e.target.value)}
              disabled={isLoading}>
              <option value='paciente'>Paciente</option>
              <option value='doutor'>Doutor(a)</option>
              {isSuperAdmin && (
                <>
                  <option value='admin'>Administrador</option>
                  <option value='superadmin'>Super Admin</option>
                </>
              )}
            </select>
            {fieldErrors.role && <FieldError msg={fieldErrors.role} />}
            <p className='mt-1 text-xs text-gray-400'>
              {isSuperAdmin
                ? 'Como Super Admin, você pode atribuir qualquer perfil.'
                : 'Como Admin, você pode criar usuários Paciente e Doutor(a).'}
            </p>
          </div>

          <div>
            <label htmlFor='image'>
              Foto de perfil{' '}
              <span className='text-gray-400 font-normal text-xs'>(opcional)</span>
            </label>
            <input
              id='image'
              type='text'
              value={image}
              onChange={e => setImage(e.target.value)}
              placeholder='https://exemplo.com/foto.jpg'
              disabled={isLoading}
            />
            {fieldErrors.image && <FieldError msg={fieldErrors.image} />}
            <p className='mt-1 text-xs text-gray-400'>URL de uma imagem pública para o avatar do usuário.</p>
          </div>
        </fieldset>

        {/* Relação com tabela — nota técnica somente para dev
            users.name, users.email, users.role, users.image → better-auth cria users + account */}

        {/* Botões */}
        <div className='flex flex-col sm:flex-row gap-3'>
          <button
            type='submit'
            disabled={isLoading || !!success}
            className='px-6 py-2.5 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2'>
            {isLoading ? (
              <>
                <svg className='animate-spin w-4 h-4' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                </svg>
                Cadastrando...
              </>
            ) : 'Cadastrar usuário'}
          </button>
          <Link
            href='/admin/users'
            className='px-6 py-2.5 rounded-md border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center'>
            Cancelar
          </Link>
        </div>

        {/* Legenda */}
        <p className='text-xs text-gray-400'>
          <span className='text-red-500'>*</span> Campos obrigatórios.
          A senha é armazenada de forma segura (hash), nunca em texto puro.
        </p>
      </form>
    </div>
  )
}
