'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type NavItem = { href: string; label: string; roles: string[] }

const navItems: NavItem[] = [
  { href: '/admin/dashboard',              label: 'Dashboard',      roles: ['superadmin', 'admin', 'dentist', 'reception', 'financial'] },
  { href: '/admin/patients',               label: 'Pacientes',      roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/agenda',                 label: 'Agenda',         roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/records',                label: 'Prontuário',     roles: ['superadmin', 'admin', 'dentist'] },
  { href: '/admin/odontogram',             label: 'Odontograma',    roles: ['superadmin', 'admin', 'dentist'] },
  { href: '/admin/procedures',             label: 'Procedimentos',  roles: ['superadmin', 'admin', 'dentist'] },
  { href: '/admin/budgets',                label: 'Orçamentos',     roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/budget-items',           label: 'Itens orçamento',roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/financial',              label: 'Financeiro',     roles: ['superadmin', 'admin', 'financial'] },
  { href: '/admin/professionals',          label: 'Profissionais',  roles: ['superadmin', 'admin', 'reception'] },
  { href: '/admin/professionals/schedule', label: 'Agenda config.', roles: ['superadmin', 'admin'] },
  { href: '/admin/bookings',               label: 'Agendamentos',   roles: ['superadmin', 'admin'] },
  { href: '/admin/reports',                label: 'Relatórios',     roles: ['superadmin', 'admin', 'financial'] },
  { href: '/admin/settings',               label: 'Configurações',  roles: ['superadmin', 'admin'] },
  { href: '/admin/users',                  label: 'Usuários',       roles: ['superadmin'] },
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
            className={[
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium',
              'md:flex-none md:justify-start md:p-2 md:px-3',
              'transition-colors duration-150',
              isActive
                ? 'bg-[#eff4ff] text-[#005a71] font-semibold'
                : 'bg-[#F9FAFB] text-[#3f484c] hover:bg-[#eff4ff] hover:text-[#005a71]',
            ].join(' ')}>
            {item.label}
          </Link>
        )
      })}
    </>
  )
}
