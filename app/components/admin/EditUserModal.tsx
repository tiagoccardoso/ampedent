'use client'

import { AdminRole, UserType } from '@/lib/types'
import { FormEvent, useState } from 'react'

function EditUserModal({ user, onUserUpdate }: { user: UserType; onUserUpdate: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(user.name || '')
  const [email, setEmail] = useState(user.email || '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<AdminRole>(user.role)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    try {
      setIsLoading(true)
      const res = await fetch('/api/users/', {
        method: 'PUT',
        body: JSON.stringify({ _id: user._id, name, email, password, role }),
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        onUserUpdate()
        setOpen(false)
        setPassword('')
        return
      }
      const data = await res.json()
      setError(data.message ?? 'Não foi possível atualizar o usuário.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button className='btn text-xs' onClick={() => setOpen(true)}>
        Editar
      </button>

      {open && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
          onClick={() => setOpen(false)}>
          <div
            className='card w-full max-w-md overflow-auto max-h-[90vh]'
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100'>
              <h2 className='font-semibold text-slate-800'>Editar usuário</h2>
              <button
                type='button'
                onClick={() => setOpen(false)}
                className='text-slate-400 hover:text-slate-600 text-xl leading-none'>
                ×
              </button>
            </div>

            {/* Form */}
            <form className='px-6 py-5 flex flex-col gap-4' onSubmit={handleEdit}>
              <div className='field'>
                <label>Nome</label>
                <input value={name} disabled={isLoading} onChange={e => setName(e.target.value)} type='text' required />
              </div>
              <div className='field'>
                <label>E-mail</label>
                <input value={email} disabled={isLoading} onChange={e => setEmail(e.target.value)} type='email' required />
              </div>
              <div className='field'>
                <label>Nova senha <span className='text-slate-400 font-normal'>(opcional)</span></label>
                <input value={password} disabled={isLoading} onChange={e => setPassword(e.target.value)} type='password' placeholder='Deixe em branco para manter' />
              </div>
              <div className='field'>
                <label>Perfil</label>
                <select value={role} disabled={isLoading} onChange={e => setRole(e.target.value as AdminRole)}>
                  <option value='admin'>Administrador</option>
                  <option value='superadmin'>Superadministrador</option>
                  <option value='dentist'>Dentista</option>
                  <option value='reception'>Recepção</option>
                  <option value='financial'>Financeiro</option>
                </select>
              </div>

              {error && <div className='alert alert-error'><span>{error}</span></div>}

              <div className='flex gap-3 justify-end pt-2'>
                <button type='button' className='btn' onClick={() => setOpen(false)}>
                  Cancelar
                </button>
                <button type='submit' className='btn btn-primary' disabled={isLoading}>
                  {isLoading ? 'Salvando…' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
export default EditUserModal
