'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type NavItem = { href: string; label: string; roles: string[] }

const navItems: NavItem[] = [
  { href: '/admin/dashboard',    label: 'Dashboard',        roles: ['superadmin', 'admin', 'dentist', 'reception', 'financial'] },
  { href: '/admin/patients',     label: 'Pacientes',        roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/agenda',       label: 'Agenda',           roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/records',      label: 'Prontuário',       roles: ['superadmin', 'admin', 'dentist'] },
  { href: '/admin/odontogram',   label: 'Odontograma',      roles: ['superadmin', 'admin', 'dentist'] },
  { href: '/admin/procedures',   label: 'Procedimentos',    roles: ['superadmin', 'admin', 'dentist'] },
  { href: '/admin/budgets',      label: 'Orçamentos',       roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/budget-items', label: 'Itens orçamento',  roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/bookings',     label: 'Agendamentos',     roles: ['superadmin', 'admin', 'dentist', 'reception', 'financial'] },
  { href: '/admin/financial',    label: 'Financeiro',       roles: ['superadmin', 'admin', 'financial'] },
  { href: '/admin/professionals',label: 'Profissionais',    roles: ['superadmin', 'admin', 'reception'] },
  { href: '/admin/reports',      label: 'Relatórios',       roles: ['superadmin', 'admin', 'financial'] },
  { href: '/admin/settings',     label: 'Configurações',    roles: ['superadmin', 'admin'] },
  { href: '/admin/users',        label: 'Usuários',         roles: ['superadmin'] },
]

export default function NavLinks() {
  const pathname = usePathname()
  const [role, setRole] = useState<string>('')

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setRole(d.role))
  }, [])

  const filtered = useMemo(
    () => navItems.filter(item => item.roles.includes(role)),
    [role],
  )

  return (
    <>
      {filtered.map(item => {
        const active = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors whitespace-nowrap
              ${active
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}>
            {item.label}
          </Link>
        )
      })}
    </>
  )
}
