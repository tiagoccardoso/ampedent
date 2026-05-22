'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

function NavIcon({ d }: { d: string }) {
  return (
    <svg className='w-5 h-5 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d={d} />
    </svg>
  )
}

const ICONS = {
  dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  patients: 'M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m0 0a4 4 0 118 0m-8 0a4 4 0 018 0',
  bookings: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  procedures: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  financial: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  createUser: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
}

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
    'flex flex-1 md:flex-none flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-2 md:px-3 py-2 text-xs md:text-sm font-medium rounded-md transition-colors'
  const activeClass = 'bg-blue-50 text-blue-600'
  const inactiveClass = 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'

  function cls(active: boolean) {
    return `${linkBase} ${active ? activeClass : inactiveClass}`
  }

  return (
    <>
      <Link href='/admin/dashboard' className={cls(pathname === '/admin/dashboard')}>
        <NavIcon d={ICONS.dashboard} />
        <span className='hidden md:inline'>Dashboard</span>
        <span className='md:hidden text-[10px]'>Início</span>
      </Link>

      <Link href='/admin/patients' className={cls(pathname.startsWith('/admin/patients'))}>
        <NavIcon d={ICONS.patients} />
        <span className='hidden md:inline'>Pacientes</span>
        <span className='md:hidden text-[10px]'>Pacientes</span>
      </Link>

      <Link href='/admin/bookings' className={cls(pathname.startsWith('/admin/bookings'))}>
        <NavIcon d={ICONS.bookings} />
        <span className='hidden md:inline'>Agendamentos</span>
        <span className='md:hidden text-[10px]'>Agenda</span>
      </Link>

      <Link href='/admin/procedures' className={cls(pathname.startsWith('/admin/procedures'))}>
        <NavIcon d={ICONS.procedures} />
        <span className='hidden md:inline'>Procedimentos</span>
        <span className='md:hidden text-[10px]'>Proced.</span>
      </Link>

      <Link href='/admin/financial' className={cls(pathname.startsWith('/admin/financial'))}>
        <NavIcon d={ICONS.financial} />
        <span className='hidden md:inline'>Financeiro</span>
        <span className='md:hidden text-[10px]'>Financ.</span>
      </Link>

      {role === 'superadmin' && (
        <>
          <div className='hidden md:block border-t border-gray-200 my-1' />
          <Link
            href='/admin/users'
            className={cls(pathname.startsWith('/admin/users') && pathname !== '/admin/users/create')}>
            <NavIcon d={ICONS.users} />
            <span className='hidden md:inline'>Usuários</span>
          </Link>
          <Link
            href='/admin/users/create'
            className={cls(pathname === '/admin/users/create')}>
            <NavIcon d={ICONS.createUser} />
            <span className='hidden md:inline'>Novo usuário</span>
          </Link>
        </>
      )}
    </>
  )
}
