'use client'

import { useAuth } from '@/app/components/AppProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Spinner from '@/app/components/Spinner'
import DeleteButton from '@/app/components/admin/DeleteButton'
import EditUserModal from '@/app/components/admin/EditUserModal'
import { UserType } from '@/lib/types'

const roleLabel: Record<string, string> = {
  superadmin: 'Superadministrador',
  admin:      'Administrador',
  dentist:    'Dentista',
  reception:  'Recepção',
  financial:  'Financeiro',
}

function UserList() {
  const [users, setUsers] = useState<UserType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
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

  async function handleDelete(_id: string) {
    try {
      const res = await fetch(`/api/users?_id=${_id}`, { method: 'DELETE' })
      if (res.ok) setRefreshKey(k => k + 1)
    } catch (err: any) {
      setError(err.message)
    }
  }

  useEffect(() => {
    document.title = 'Usuários | Admin | DentalSys'
  }, [])

  if (status === 'unauthenticated') router.push('/')

  return (
    <section className='space-y-5'>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Usuários</h1>
          <p className='page-subtitle'>Gestão de usuários administrativos</p>
        </div>
        <Link href='/admin/users/create' className='btn btn-primary text-sm'>
          Novo usuário
        </Link>
      </div>

      {error && <div className='alert alert-error'><span>{error}</span></div>}

      <div className='card overflow-hidden'>
        {isLoading ? (
          <div className='px-6 py-12 flex justify-center'>
            <Spinner />
          </div>
        ) : users.length === 0 ? (
          <div className='px-6 py-12 text-center text-slate-400 text-sm'>
            Nenhum usuário cadastrado.
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='data-table'>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th className='text-right'>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id.toString()}>
                    <td className='font-medium'>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className='badge badge-scheduled'>
                        {roleLabel[user.role] ?? user.role}
                      </span>
                    </td>
                    <td>
                      <div className='flex items-center justify-end gap-2'>
                        <EditUserModal user={user} onUserUpdate={() => setRefreshKey(k => k + 1)} />
                        <DeleteButton label='Excluir' onDelete={() => handleDelete(user._id.toString())} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
export default UserList
