'use client'

import Link from 'next/link'
import NavLinks from './NavLinks'
import { useAuth } from '@/app/components/AppProvider'
import { useState } from 'react'

function ToothIcon() {
  return (
    <svg width='20' height='20' viewBox='0 0 28 28' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M14 3C10 3 6 6 6 10C6 13 8 15 8 17.5C8 21 10 25 12.5 25C13.8 25 14.5 22 14 22C13.5 22 14.2 25 15.5 25C18 25 20 21 20 17.5C20 15 22 13 22 10C22 6 18 3 14 3Z'
        fill='currentColor'
      />
    </svg>
  )
}

function PinIcon({ pinned }: { pinned: boolean }) {
  return pinned ? (
    // Pinned: filled circle with inner dot
    <svg width='14' height='14' viewBox='0 0 24 24' fill='none'>
      <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' fill='currentColor' fillOpacity='0.2' />
      <circle cx='12' cy='12' r='3' fill='currentColor' />
    </svg>
  ) : (
    // Unpinned: outline circle
    <svg width='14' height='14' viewBox='0 0 24 24' fill='none'>
      <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
    </svg>
  )
}

export default function SideNav({
  pinned,
  onTogglePin,
  mobileOpen,
  onMobileClose,
}: {
  pinned: boolean
  onTogglePin: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}) {
  const { session, status, logout } = useAuth()
  const [hovered, setHovered] = useState(false)

  // Expanded on desktop: user pinned it OR hovering over it
  const desktopExpanded = pinned || hovered

  if (status !== 'authenticated') return null

  return (
    <aside
      className={`sidebar-nav${mobileOpen ? ' mobile-open' : ''}${desktopExpanded ? ' desktop-expanded' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div
        className='flex items-center h-16 flex-shrink-0 border-b'
        style={{ borderColor: 'rgba(154,206,225,0.15)' }}
      >
        <Link
          href='/'
          className='flex items-center flex-shrink-0 overflow-hidden'
          style={{ width: 60 }}
          title='Odonto Prime'
        >
          <span className='flex items-center justify-center w-full text-[#003441]'>
            <span
              className='w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0'
              style={{ background: '#9acee1' }}
            >
              <ToothIcon />
            </span>
          </span>
        </Link>

        {/* Brand text — visible when expanded */}
        <div className='flex-1 min-w-0 pr-2'>
          <div
            className='font-extrabold text-white text-sm leading-none sidebar-label'
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Odonto Prime
          </div>
          <div
            className='text-[9px] tracking-[0.14em] uppercase leading-none mt-0.5 sidebar-label'
            style={{ color: '#cca730', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Studio Admin
          </div>
        </div>

        {/* Pin toggle — only visible when desktop-expanded */}
        <button
          onClick={e => { e.stopPropagation(); onTogglePin() }}
          title={pinned ? 'Desafixar menu' : 'Fixar menu aberto'}
          className='flex-shrink-0 mr-2 w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10'
          style={{ color: pinned ? '#9acee1' : 'rgba(255,255,255,0.4)' }}
        >
          <PinIcon pinned={pinned} />
        </button>
      </div>

      {/* ── Navigation ───────────────────────────────────────── */}
      <nav className='flex-1 overflow-y-auto overflow-x-hidden py-3 px-0'>
        <p
          className='sidebar-label px-0 mb-2 text-[9px] font-bold tracking-[0.14em] uppercase'
          style={{
            color: 'rgba(154,206,225,0.45)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            paddingLeft: 18,
          }}
        >
          Menu principal
        </p>
        <NavLinks onNavigate={mobileOpen ? onMobileClose : undefined} />
      </nav>

      {/* ── User info ────────────────────────────────────────── */}
      <div
        className='flex-shrink-0 border-t p-2'
        style={{ borderColor: 'rgba(154,206,225,0.15)' }}
      >
        <div
          className='flex items-center rounded-xl overflow-hidden'
          style={{ background: 'rgba(154,206,225,0.07)' }}
        >
          {/* Avatar */}
          <div
            className='w-[60px] h-10 flex items-center justify-center flex-shrink-0'
          >
            <div
              className='w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-[#003441] flex-shrink-0'
              style={{ background: '#9acee1' }}
            >
              {session?.user?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
          </div>

          {/* User details */}
          <div className='flex-1 min-w-0 py-2'>
            <p className='text-white text-xs font-semibold sidebar-label'>{session?.user ?? 'Usuário'}</p>
            <p
              className='text-[10px] sidebar-label'
              style={{ color: 'rgba(154,206,225,0.65)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {session?.email ?? ''}
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className='flex-shrink-0 mr-2 px-2 py-1 rounded-lg text-[10px] font-bold tracking-wide transition-colors hover:bg-white/10 sidebar-label'
            style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            title='Sair'
          >
            SAIR
          </button>
        </div>
      </div>
    </aside>
  )
}
