'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import SideNav from '../components/layout/SideNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [pinned, setPinned] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('sidebar-pinned')
    if (stored !== null) setPinned(stored === 'true')
  }, [])

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  function togglePin() {
    setPinned(prev => {
      const next = !prev
      localStorage.setItem('sidebar-pinned', String(next))
      return next
    })
  }

  const isAuthScreen = pathname === '/admin'
  if (isAuthScreen) return <>{children}</>

  return (
    <div className='flex min-h-screen' style={{ background: '#f8fafb' }}>
      {/* Desktop spacer — reserves space equal to sidebar width */}
      <div
        className={`sidebar-spacer${mounted && pinned ? ' pinned' : ''}`}
        aria-hidden='true'
      />

      {/* Fixed sidebar */}
      <SideNav
        pinned={pinned}
        onTogglePin={togglePin}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className='fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden'
          onClick={() => setMobileOpen(false)}
          aria-hidden='true'
        />
      )}

      {/* Main area */}
      <div className='flex-1 min-w-0 flex flex-col overflow-hidden'>
        {/* Mobile top bar */}
        <div className='admin-topbar'>
          <button
            onClick={() => setMobileOpen(true)}
            className='flex items-center justify-center w-9 h-9 rounded-xl border border-[#e6e8e9] text-[#003441] hover:bg-[#f2f4f5] transition-colors flex-shrink-0'
            aria-label='Abrir menu'
          >
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'>
              <line x1='3' y1='6' x2='21' y2='6' />
              <line x1='3' y1='12' x2='21' y2='12' />
              <line x1='3' y1='18' x2='21' y2='18' />
            </svg>
          </button>
          <span className='font-extrabold text-[#003441] text-sm' style={{ fontFamily: 'Manrope, sans-serif' }}>
            Odonto Prime
          </span>
        </div>

        {/* Page content */}
        <div className='flex-1 overflow-auto'>
          <div className='p-4 sm:p-6 md:p-8 max-w-[1360px]'>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
