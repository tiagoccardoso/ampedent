'use client'

import { useAuth } from '@/app/components/AppProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import Link from 'next/link'
import Spinner from '@/app/components/Spinner'
import DeleteButton from '@/app/components/admin/DeleteButton'
import EditUserModal from '@/app/components/admin/EditUserModal'
import { UserType } from '@/lib/types'

function UserList() {
  const [users, setUsers] = useState<UserType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const triggerRefresh = () => setRefreshKey(refreshKey + 1)
  const { status, session } = useAuth()
  const router = useRouter()

  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true)
        const res = await fetch('/api/users')
        if (res.ok) {
          const data = await res.json()

          setUsers(data.users)
          setIsLoading(false)
        }
      } catch (err: any) {
        setIsLoading(false)
        setError(err.message)
      }
    }
    fetchUsers()
  }, [refreshKey])

  async function handleDeleteClick(_id: string) {
    try {
      const res = await fetch(`/api/users?_id=${_id}`, { method: 'DELETE' })
      if (res.ok) {
        triggerRefresh()
      }
    } catch (error: any) {
      setError(error.message)
    }
  }

  if (status === 'unauthenticated') {
    router.push('/admin')
  }

  useEffect(() => {
    document.title = 'Usuários | Admin | DentalSys'
  }, [])

  const canCreate = session?.role === 'admin' || session?.role === 'superadmin'

  return (
    <>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Usuários</h1>
          <p className='text-sm text-gray-500 mt-0.5'>Gerencie os usuários do sistema</p>
        </div>
        {canCreate && (
          <Link
            href='/admin/users/create'
            className='px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors'>
            + Novo usuário
          </Link>
        )}
      </div>
      {isLoading && (
        <div className='flex justify-center py-8'>
          <Spinner />
        </div>
      )}
      {error && (
        <div className='rounded-md bg-red-50 border border-red-200 p-4 mb-4'>
          <p className='text-red-700 text-sm'>{error}</p>
        </div>
      )}
      {!isLoading && (
        <div className='rounded-lg border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full caption-bottom text-sm'>
              <thead className='bg-gray-50'>
                <tr className='border-b border-gray-200'>
                  <th className='h-11 px-4 text-left align-middle font-semibold text-gray-600 hidden lg:table-cell'>
                    ID
                  </th>
                  <th className='h-11 px-4 text-left align-middle font-semibold text-gray-600'>
                    Nome
                  </th>
                  <th className='h-11 px-4 text-left align-middle font-semibold text-gray-600 hidden md:table-cell'>
                    Email
                  </th>
                  <th className='h-11 px-4 text-left align-middle font-semibold text-gray-600'>
                    Função
                  </th>
                  <th className='h-11 px-4 align-middle font-semibold text-gray-600 text-right'>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className='p-8 text-center text-gray-500 text-sm'>
                      Nenhum usuário cadastrado
                    </td>
                  </tr>
                )}
                {users.map(user => (
                  <tr
                    className='transition-colors hover:bg-gray-50'
                    key={user._id.toString()}>
                    <td className='px-4 py-3 align-middle font-mono text-xs text-gray-400 hidden lg:table-cell'>
                      {user._id.toString().slice(0, 8)}…
                    </td>
                    <td className='px-4 py-3 align-middle'>
                      <span className='font-medium text-gray-900'>{user.name}</span>
                      <div className='text-xs text-gray-500 md:hidden mt-0.5'>{user.email}</div>
                    </td>
                    <td className='px-4 py-3 align-middle text-gray-600 hidden md:table-cell'>
                      {user.email}
                    </td>
                    <td className='px-4 py-3 align-middle'>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        user.role === 'superadmin'
                          ? 'bg-purple-100 text-purple-700'
                          : user.role === 'admin'
                          ? 'bg-blue-100 text-blue-700'
                          : user.role === 'doutor'
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {user.role === 'superadmin' ? 'Super Admin'
                          : user.role === 'admin' ? 'Admin'
                          : user.role === 'doutor' ? 'Doutor'
                          : 'Paciente'}
                      </span>
                    </td>
                    <td className='px-4 py-3 align-middle'>
                      <div className='flex justify-end gap-2'>
                        <EditUserModal user={user} onUserUpdate={triggerRefresh} />
                        <DeleteButton
                          label='Excluir'
                          onDelete={() => handleDeleteClick(user._id.toString())}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
export default UserList
