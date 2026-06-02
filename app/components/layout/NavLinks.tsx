'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/app/components/AppProvider'

type NavItem = { href: string; label: string; roles: string[] }

const navItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', roles: ['superadmin', 'admin', 'dentist', 'reception', 'financial'] },
  { href: '/admin/patients', label: 'Pacientes', roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/agenda', label: 'Agenda', roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/records', label: 'Prontuário', roles: ['superadmin', 'admin', 'dentist'] },
  { href: '/admin/odontogram', label: 'Odontograma', roles: ['superadmin', 'admin', 'dentist'] },
  { href: '/admin/procedures', label: 'Procedimentos', roles: ['superadmin', 'admin', 'dentist'] },
  { href: '/admin/budgets', label: 'Orçamentos', roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/budget-items', label: 'Itens orçamento', roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/financial', label: 'Financeiro', roles: ['superadmin', 'admin', 'financial'] },
  { href: '/admin/professionals', label: 'Profissionais', roles: ['superadmin', 'admin', 'reception'] },
  { href: '/admin/reports', label: 'Relatórios', roles: ['superadmin', 'admin', 'financial'] },
  { href: '/admin/settings', label: 'Configurações', roles: ['superadmin', 'admin'] },
  { href: '/admin/users', label: 'Usuários', roles: ['superadmin'] },
]

const baseClass = 'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3'

export default function NavLinks() {
  const pathname = usePathname()
  const { hasAccess } = useAuth()
  const [role, setRole] = useState<string>('')

  useEffect(() => {
    fetch('/api/me').then(r => r.ok ? r.json() : null).then(d => d && setRole(d.role))
  }, [])

  const filtered = useMemo(() => navItems.filter(item => item.roles.includes(role)), [role])

  return (
    <>
      {filtered.map(item => {
        const isActive = pathname.startsWith(item.href)
        if (!hasAccess) {
          return (
            <span
              key={item.href}
              title='Ative um plano para acessar'
              className={`${baseClass} cursor-not-allowed opacity-40`}
            >
              {item.label}
            </span>
          )
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${baseClass} ${isActive ? 'bg-sky-100 text-blue-600' : ''}`}
          >
            {item.label}
          </Link>
        )
      })}

      <Link
        href='/admin/subscriptions'
        className={`${baseClass} ${pathname.startsWith('/admin/subscriptions') ? 'bg-sky-100 text-blue-600' : ''}`}
      >
        Assinaturas
      </Link>
    </>
  )
}
