'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type NavItem = { href: string; label: string; roles: string[]; icon: string }

const navItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊', roles: ['superadmin', 'admin', 'dentist', 'reception', 'financial'] },
  { href: '/admin/patients', label: 'Pacientes', icon: '👥', roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/agenda', label: 'Agenda', icon: '📅', roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/records', label: 'Prontuário', icon: '📄', roles: ['superadmin', 'admin', 'dentist'] },
  { href: '/admin/odontogram', label: 'Odontograma', icon: '🦷', roles: ['superadmin', 'admin', 'dentist'] },
  { href: '/admin/procedures', label: 'Procedimentos', icon: '⚙️', roles: ['superadmin', 'admin', 'dentist'] },
  { href: '/admin/budgets', label: 'Orçamentos', icon: '💰', roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/budget-items', label: 'Itens orçamento', icon: '📝', roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/financial', label: 'Financeiro', icon: '💳', roles: ['superadmin', 'admin', 'financial'] },
  { href: '/admin/professionals', label: 'Profissionais', icon: '🩺', roles: ['superadmin', 'admin', 'reception'] },
  { href: '/admin/reports', label: 'Relatórios', icon: '📈', roles: ['superadmin', 'admin', 'financial'] },
  { href: '/admin/settings', label: 'Configurações', icon: '⚙️', roles: ['superadmin', 'admin'] },
  { href: '/admin/users', label: 'Usuários', icon: '👤', roles: ['superadmin'] },
]

export default function NavLinks() {
  const pathname = usePathname()
  const [role, setRole] = useState<string>('')

  useEffect(() => {
    fetch('/api/me').then(r => r.ok ? r.json() : null).then(d => d && setRole(d.role))
  }, [])

  const filtered = useMemo(() => navItems.filter(item => item.roles.includes(role)), [role])

  return (
    <div className='flex flex-row flex-wrap md:flex-col gap-1'>
      {filtered.map(item => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150'
            style={
              isActive
                ? {
                    background: 'rgba(154,206,225,0.15)',
                    color: '#9acee1',
                    borderLeft: '3px solid #9acee1',
                    paddingLeft: '0.625rem',
                  }
                : {
                    color: 'rgba(255,255,255,0.65)',
                    borderLeft: '3px solid transparent',
                  }
            }
            onMouseEnter={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(154,206,225,0.08)'
                ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)'
              }
            }}>
            <span className='text-base flex-shrink-0'>{item.icon}</span>
            <span className='hidden md:block' style={{ fontFamily: 'Manrope, sans-serif' }}>{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
