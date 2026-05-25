'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type NavItem = { href: string; label: string; roles: string[]; icon: React.ReactNode }

const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
    className='shrink-0'>
    <path d={d} />
  </svg>
)

const navItems: NavItem[] = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    roles: ['superadmin', 'admin', 'dentist', 'reception', 'financial'],
    icon: <Icon d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' />,
  },
  {
    href: '/admin/patients',
    label: 'Pacientes',
    roles: ['superadmin', 'admin', 'dentist', 'reception'],
    icon: <Icon d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' />,
  },
  {
    href: '/admin/agenda',
    label: 'Agenda',
    roles: ['superadmin', 'admin', 'dentist', 'reception'],
    icon: <Icon d='M8 2v4 M16 2v4 M3 10h18 M21 8H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2z' />,
  },
  {
    href: '/admin/records',
    label: 'Prontuário',
    roles: ['superadmin', 'admin', 'dentist'],
    icon: <Icon d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8' />,
  },
  {
    href: '/admin/odontogram',
    label: 'Odontograma',
    roles: ['superadmin', 'admin', 'dentist'],
    icon: <Icon d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />,
  },
  {
    href: '/admin/procedures',
    label: 'Procedimentos',
    roles: ['superadmin', 'admin', 'dentist'],
    icon: <Icon d='M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2 M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 M12 12v4 M10 14h4' />,
  },
  {
    href: '/admin/budgets',
    label: 'Orçamentos',
    roles: ['superadmin', 'admin', 'dentist', 'reception'],
    icon: <Icon d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 18v-4 M10 14a2 2 0 1 0 4 0' />,
  },
  {
    href: '/admin/budget-items',
    label: 'Itens orçamento',
    roles: ['superadmin', 'admin', 'dentist', 'reception'],
    icon: <Icon d='M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2 M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 M8 12h8 M8 16h4' />,
  },
  {
    href: '/admin/financial',
    label: 'Financeiro',
    roles: ['superadmin', 'admin', 'financial'],
    icon: <Icon d='M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />,
  },
  {
    href: '/admin/professionals',
    label: 'Profissionais',
    roles: ['superadmin', 'admin', 'reception'],
    icon: <Icon d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M16 11l2 2 4-4' />,
  },
  {
    href: '/admin/reports',
    label: 'Relatórios',
    roles: ['superadmin', 'admin', 'financial'],
    icon: <Icon d='M18 20V10 M12 20V4 M6 20v-6' />,
  },
  {
    href: '/admin/settings',
    label: 'Configurações',
    roles: ['superadmin', 'admin'],
    icon: (
      <svg
        width='18'
        height='18'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
        className='shrink-0'>
        <circle cx='12' cy='12' r='3' />
        <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' />
      </svg>
    ),
  },
  {
    href: '/admin/users',
    label: 'Usuários',
    roles: ['superadmin'],
    icon: <Icon d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' />,
  },
  {
    href: '/admin/bookings',
    label: 'Agendamentos',
    roles: ['superadmin', 'admin', 'dentist', 'reception', 'financial'],
    icon: <Icon d='M8 2v4 M16 2v4 M21 14H3 M21 8H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2z M16 16l-4-4-4 4' />,
  },
]

export default function NavLinks() {
  const pathname = usePathname()
  const [role, setRole] = useState<string>('')

  useEffect(() => {
    fetch('/api/me')
      .then(r => (r.ok ? r.json() : null))
      .then(d => d && setRole(d.role))
  }, [])

  const filtered = useMemo(
    () => navItems.filter(item => item.roles.includes(role)),
    [role],
  )

  return (
    <>
      {filtered.map(item => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors
              md:flex-none md:justify-start
              ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}>
            <span
              className={`transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
              {item.icon}
            </span>
            <span className='hidden md:inline truncate'>{item.label}</span>
          </Link>
        )
      })}
    </>
  )
}
