'use client'

import { useAuth } from '@/app/components/AppProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import Spinner from '@/app/components/Spinner'
import DeleteButton from '@/app/components/admin/DeleteButton'
import EditUserModal from '@/app/components/admin/EditUserModal'
import { UserType } from '@/lib/types'

function UserList() {
  const [users, setUsers] = useState<UserType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const triggerRefresh = () => setRefreshKey(k => k + 1)
  const { status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true)
        const res = await fetch('/api/users')
        if (res.ok) {
          const data = await res.json()
          setUsers(data.users)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsers()
  }, [refreshKey])

  async function handleDeleteClick(_id: string) {
    try {
      const res = await fetch(`/api/users?_id=${_id}`, { method: 'DELETE' })
      if (res.ok) triggerRefresh()
    } catch (error: any) {
      setError(error.message)
    }
  }

  if (status === 'unauthenticated') { router.push('/'); return null }

  useEffect(() => { document.title = 'Usuários | Admin | DentalSys' }, [])

  return (
    <section className='space-y-6'>
      <div className='page-header'>
        <h1 className='page-title'>Usuários administrativos</h1>
        <p className='page-subtitle'>Gerencie os usuários com acesso ao painel</p>
      </div>

      {isLoading && (
        <div className='flex justify-center py-8'><Spinner /></div>
      )}
      {error && (
        <div className='flex items-center gap-2 rounded-lg border border-[#ffdad6] bg-[#fff0ee] px-4 py-3 text-sm text-[#ba1a1a]'>
          <span>⚠</span> {error}
        </div>
      )}

      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[#0f172a]'>Lista de usuários</h2>
          <span className='text-xs text-[#64748b]'>{users.length} usuários</span>
        </div>
        <div className='overflow-auto'>
          <table className='admin-table'>
            <thead>
              <tr>
                <th className='hidden lg:table-cell'>ID</th>
                <th>Nome</th>
                <th className='hidden sm:table-cell'>E-mail</th>
                <th>Função</th>
                <th className='text-right'>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && !isLoading && (
                <tr><td colSpan={5} className='text-center py-8 text-[#64748b] text-sm'>Nenhum usuário cadastrado.</td></tr>
              )}
              {users.map(user => (
                <tr key={user._id.toString()}>
                  <td className='hidden lg:table-cell font-mono text-xs text-[#64748b]'>{user._id.toString().slice(0, 8)}…</td>
                  <td className='font-medium text-[#0f172a]'>{user.name}</td>
                  <td className='hidden sm:table-cell text-[#64748b]'>{user.email}</td>
                  <td>
                    <span className={`badge ${user.role === 'superadmin' ? 'badge-pending' : 'badge-success'}`}>
                      {user.role === 'superadmin' ? 'Superadmin' : 'Administrador'}
                    </span>
                  </td>
                  <td>
                    <div className='flex justify-end gap-2'>
                      <EditUserModal user={user} onUserUpdate={triggerRefresh} />
                      <DeleteButton label='Excluir' onDelete={() => handleDeleteClick(user._id.toString())} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
export default UserList
