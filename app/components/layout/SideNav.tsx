'use client'

import Link from 'next/link'
import NavLinks from './NavLinks'
import { useAuth } from '@/app/components/AppProvider'

function ToothIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 3C10 3 6 6 6 10C6 13 8 15 8 17.5C8 21 10 25 12.5 25C13.8 25 14.5 22 14 22C13.5 22 14.2 25 15.5 25C18 25 20 21 20 17.5C20 15 22 13 22 10C22 6 18 3 14 3Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function SideNav() {
  const { session, status, logout } = useAuth()

  if (status !== 'authenticated') return null

  return (
    <aside
      className='flex flex-col h-full min-h-screen md:sticky md:top-0 md:h-screen overflow-y-auto'
      style={{ background: '#003441', borderRight: '1px solid rgba(154,206,225,0.15)' }}>
      {/* Logo */}
      <Link
        href='/'
        className='flex items-center gap-3 px-5 py-6 border-b group'
        style={{ borderColor: 'rgba(154,206,225,0.15)' }}>
        <div
          className='w-9 h-9 rounded-lg flex items-center justify-center text-[#003441] flex-shrink-0'
          style={{ background: '#9acee1' }}>
          <ToothIcon />
        </div>
        <div className='hidden md:block'>
          <div
            className='font-extrabold text-white text-sm leading-none'
            style={{ fontFamily: 'Manrope, sans-serif' }}>
            Odonto Prime
          </div>
          <div
            className='text-[#cca730] font-bold text-[9px] tracking-[0.12em] uppercase leading-none mt-0.5'
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Studio Admin
          </div>
        </div>
      </Link>

      {/* Nav items */}
      <nav className='flex-1 px-3 py-4'>
        <p
          className='hidden md:block px-3 mb-3 text-[10px] font-bold tracking-[0.1em] uppercase'
          style={{ color: 'rgba(154,206,225,0.5)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Menu principal
        </p>
        <NavLinks />
      </nav>

      {/* User info + logout */}
      <div
        className='px-3 py-4 border-t'
        style={{ borderColor: 'rgba(154,206,225,0.15)' }}>
        <div
          className='rounded-xl p-3 flex items-center gap-3'
          style={{ background: 'rgba(154,206,225,0.08)' }}>
          <div
            className='w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-[#003441] flex-shrink-0'
            style={{ background: '#9acee1' }}>
            {session?.user?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div className='hidden md:block flex-1 min-w-0'>
            <p className='text-white text-xs font-semibold truncate'>{session?.user ?? 'Usuário'}</p>
            <p
              className='text-[10px] truncate'
              style={{ color: 'rgba(154,206,225,0.7)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {session?.email ?? ''}
            </p>
          </div>
          <button
            onClick={logout}
            className='hidden md:flex text-[10px] font-bold tracking-wide text-white/50 hover:text-white transition-colors'
            title='Sair'
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            SAIR
          </button>
        </div>
      </div>
    </aside>
  )
}
