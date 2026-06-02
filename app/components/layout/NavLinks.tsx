'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/app/components/AppProvider'

type NavItem = { href: string; label: string; roles: string[]; icon: string }

const navItems: NavItem[] = [
  { href: '/admin/dashboard',    label: 'Dashboard',       icon: '📊', roles: ['superadmin', 'admin', 'dentist', 'reception', 'financial'] },
  { href: '/admin/patients',     label: 'Pacientes',       icon: '👥', roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/agenda',       label: 'Agenda',          icon: '📅', roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/records',      label: 'Prontuário',      icon: '📄', roles: ['superadmin', 'admin', 'dentist'] },
  { href: '/admin/odontogram',   label: 'Odontograma',     icon: '🦷', roles: ['superadmin', 'admin', 'dentist'] },
  { href: '/admin/procedures',   label: 'Procedimentos',   icon: '⚙️', roles: ['superadmin', 'admin', 'dentist'] },
  { href: '/admin/budgets',      label: 'Orçamentos',      icon: '💰', roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/budget-items', label: 'Itens orçamento', icon: '📝', roles: ['superadmin', 'admin', 'dentist', 'reception'] },
  { href: '/admin/financial',    label: 'Financeiro',      icon: '💳', roles: ['superadmin', 'admin', 'financial'] },
  { href: '/admin/professionals',label: 'Profissionais',   icon: '🩺', roles: ['superadmin', 'admin', 'reception'] },
  { href: '/admin/reports',      label: 'Relatórios',      icon: '📈', roles: ['superadmin', 'admin', 'financial'] },
  { href: '/admin/settings',     label: 'Configurações',   icon: '⚙️', roles: ['superadmin', 'admin'] },
  { href: '/admin/users',        label: 'Usuários',        icon: '👤', roles: ['superadmin'] },
]

export default function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { hasAccess } = useAuth()
  const [role, setRole] = useState<string>('')

  useEffect(() => {
    fetch('/api/me').then(r => r.ok ? r.json() : null).then(d => d && setRole(d.role))
  }, [])

  const filtered = useMemo(() => navItems.filter(item => item.roles.includes(role)), [role])

  const isSubActive = pathname.startsWith('/admin/subscriptions')

  return (
    <div className='flex flex-col gap-0.5'>
      {filtered.map(item => {
        const isActive = pathname.startsWith(item.href)

        if (!hasAccess) {
          return (
            <span
              key={item.href}
              title='Ative um plano para acessar'
              className='flex items-center h-10 rounded-xl overflow-hidden cursor-not-allowed opacity-40'
              style={{ borderLeft: '3px solid transparent', color: 'rgba(255,255,255,0.65)' }}
            >
              <span className='flex items-center justify-center flex-shrink-0 text-base' style={{ width: 60 }}>
                {item.icon}
              </span>
              <span className='sidebar-label flex-shrink-0 pr-3'>{item.label}</span>
            </span>
          )
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className='flex items-center h-10 rounded-xl transition-all duration-150 overflow-hidden'
            style={
              isActive
                ? { background: 'rgba(154,206,225,0.18)', borderLeft: '3px solid #9acee1' }
                : { color: 'rgba(255,255,255,0.65)', borderLeft: '3px solid transparent' }
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
            }}
          >
            <span className='flex items-center justify-center flex-shrink-0 text-base' style={{ width: 60 }}>
              {item.icon}
            </span>
            <span className='sidebar-label flex-shrink-0 pr-3' style={{ color: isActive ? '#9acee1' : undefined }}>
              {item.label}
            </span>
          </Link>
        )
      })}

      {/* Assinaturas — sempre visível, independente de hasAccess */}
      <Link
        href='/admin/subscriptions'
        onClick={onNavigate}
        className='flex items-center h-10 rounded-xl transition-all duration-150 overflow-hidden'
        style={
          isSubActive
            ? { background: 'rgba(154,206,225,0.18)', borderLeft: '3px solid #9acee1' }
            : { color: 'rgba(255,255,255,0.65)', borderLeft: '3px solid transparent' }
        }
        onMouseEnter={e => {
          if (!isSubActive) {
            (e.currentTarget as HTMLElement).style.background = 'rgba(154,206,225,0.08)'
            ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)'
          }
        }}
        onMouseLeave={e => {
          if (!isSubActive) {
            (e.currentTarget as HTMLElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)'
          }
        }}
      >
        <span className='flex items-center justify-center flex-shrink-0 text-base' style={{ width: 60 }}>
          💎
        </span>
        <span className='sidebar-label flex-shrink-0 pr-3' style={{ color: isSubActive ? '#9acee1' : undefined }}>
          Assinaturas
        </span>
      </Link>
    </div>
  )
}
