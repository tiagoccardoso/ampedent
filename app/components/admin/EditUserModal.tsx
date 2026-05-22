'use client'

import { UserType } from '@/lib/types'
import { FormEvent, useState } from 'react'

function EditUserModal({
  user,
  onUserUpdate,
}: {
  user: UserType
  onUserUpdate: () => void
}) {
  const [showUser, setShowUser] = useState(false)
  const [name, setName] = useState(user.name || '')
  const [email, setEmail] = useState(user.email || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      const body = { _id: user._id, name, email, password }
      const res = await fetch('/api/users/', {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        onUserUpdate()
        setShowUser(false)
        setPassword('')
      }
    } catch (error: any) {
      setError(error.message)
    }
  }
  return (
    <>
      <button className='btn text-xs px-3 py-1.5' onClick={() => setShowUser(true)}>
        Editar
      </button>
      {showUser && (
        <>
          <div
            className='fixed inset-0 z-40 bg-black/40'
            onClick={() => setShowUser(false)}
          />
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div
              className='bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto'
              onClick={e => e.stopPropagation()}>
              <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
                <h2 className='text-lg font-semibold text-gray-900'>
                  Editar {user.name}
                </h2>
                <button
                  type='button'
                  onClick={() => setShowUser(false)}
                  className='text-gray-400 hover:text-gray-600 p-1 rounded transition-colors'>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>
              <form className='px-6 py-4 space-y-4' onSubmit={handleEdit}>
                <div>
                  <label htmlFor='edit-name'>Nome</label>
                  <input
                    id='edit-name'
                    value={name}
                    onChange={e => setName(e.target.value)}
                    type='text'
                    placeholder='Nome de usuário'
                    required
                  />
                </div>
                <div>
                  <label htmlFor='edit-email'>Email</label>
                  <input
                    id='edit-email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    type='email'
                    placeholder='email@exemplo.com'
                    required
                  />
                </div>
                <div>
                  <label htmlFor='edit-password'>
                    Nova senha{' '}
                    <span className='text-gray-400 font-normal text-xs'>(deixe em branco para manter)</span>
                  </label>
                  <input
                    id='edit-password'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    type='password'
                    placeholder='Nova senha'
                  />
                </div>
                {error && (
                  <div className='rounded-md bg-red-50 border border-red-200 p-3'>
                    <p className='text-red-700 text-sm'>{error}</p>
                  </div>
                )}
                <div className='flex gap-3 pt-2'>
                  <button
                    type='submit'
                    className='flex-1 rounded-md px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-800 transition-colors'>
                    Salvar alterações
                  </button>
                  <button
                    type='button'
                    onClick={() => setShowUser(false)}
                    className='flex-1 rounded-md px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors'>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  )
}
export default EditUserModal
