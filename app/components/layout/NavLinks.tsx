'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Bookings from '../Icons/Bookings'
import Users from '../Icons/Users'
import CreateUser from '../Icons/CreateUser'
import { useEffect, useState } from 'react'

export default function NavLinks() {
  const pathname = usePathname()

  const [role, setRole] = useState<string>('')
  useEffect(() => {
    async function fetchRole() {
      const res = await fetch('/api/me')
      if (res.ok) {
        const data = await res.json()
        setRole(data.role)
      }
    }
    fetchRole()
  }, [])

  const linkBase =
    'flex flex-1 md:flex-none flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2 px-2 md:px-3 py-2 md:py-2 text-xs md:text-sm font-medium rounded-md transition-colors'
  const activeClass = 'bg-blue-50 text-blue-600'
  const inactiveClass = 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'

  return (
    <>
      <Link
        href='/admin/bookings'
        className={`${linkBase} ${
          pathname.startsWith('/admin/bookings') ? activeClass : inactiveClass
        }`}>
        <Bookings />
        <span>Agendamentos</span>
      </Link>
      {role === 'superadmin' && (
        <>
          <Link
            href='/admin/users'
            className={`${linkBase} ${
              pathname.startsWith('/admin/users') && pathname !== '/admin/users/create'
                ? activeClass
                : inactiveClass
            }`}>
            <Users />
            <span>Usuários</span>
          </Link>
          <Link
            href='/admin/users/create'
            className={`${linkBase} ${
              pathname === '/admin/users/create' ? activeClass : inactiveClass
            }`}>
            <CreateUser />
            <span className='hidden md:inline'>Novo usuário</span>
            <span className='md:hidden'>Novo</span>
          </Link>
        </>
      )}
    </>
  )
}
