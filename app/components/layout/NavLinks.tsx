'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type NavItem = { href: string; label: string; roles: string[]; icon: string }

const navItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '◈', roles: ['superadmin', 'admin', 'dentist', 'reception', 'financial'] },
  { href: '/admin/patients', label: 'Pacientes', icon: '◉', roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/agenda', label: 'Agenda', icon: '◷', roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/records', label: 'Prontuário', icon: '◱', roles: ['superadmin', 'admin', 'dentist'] },
  { href: '/admin/odontogram', label: 'Odontograma', icon: '◌', roles: ['superadmin', 'admin', 'dentist'] },
  { href: '/admin/procedures', label: 'Procedimentos', icon: '◈', roles: ['superadmin', 'admin', 'dentist'] },
  { href: '/admin/budgets', label: 'Orçamentos', icon: '◎', roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/budget-items', label: 'Itens orçamento', icon: '◉', roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/financial', label: 'Financeiro', icon: '◈', roles: ['superadmin', 'admin', 'financial'] },
  { href: '/admin/professionals', label: 'Profissionais', icon: '◑', roles: ['superadmin', 'admin', 'reception'] },
  { href: '/admin/bookings', label: 'Agendamentos', icon: '◷', roles: ['superadmin', 'admin', 'reception'] },
  { href: '/admin/reports', label: 'Relatórios', icon: '◈', roles: ['superadmin', 'admin', 'financial'] },
  { href: '/admin/settings', label: 'Configurações', icon: '◉', roles: ['superadmin', 'admin'] },
  { href: '/admin/users', label: 'Usuários', icon: '◑', roles: ['superadmin'] },
]

export default function NavLinks() {
  const pathname = usePathname()
  const [role, setRole] = useState<string>('')

  useEffect(() => {
    fetch('/api/me').then(r => r.ok ? r.json() : null).then(d => d && setRole(d.role))
  }, [])

  const filtered = useMemo(() => navItems.filter(item => item.roles.includes(role)), [role])

  return (
    <>
      {filtered.map(item => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex h-12 md:h-10 items-center gap-2.5 rounded-lg mx-2 px-3 text-sm font-medium transition-colors
              ${isActive
                ? 'bg-[#e5eeff] text-[#0e7490] font-semibold'
                : 'text-[#64748b] hover:bg-[#f8f9ff] hover:text-[#0f172a]'
              } md:flex-none md:w-auto`}>
            <span className='text-lg md:text-sm flex-shrink-0 opacity-80'>{item.icon}</span>
            <span className='hidden md:inline'>{item.label}</span>
          </Link>
        )
      })}
    </>
  )
}
