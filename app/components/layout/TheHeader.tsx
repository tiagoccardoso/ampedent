'use client'

import Image from 'next/image'
import Link from 'next/link'
import logo from '@/public/ampedent.webp'
import { useEffect, useState } from 'react'
import UpArrow from '../Icons/UpArrow'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/components/AppProvider'

function TheHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const pathName = usePathname()
  const [y, setY] = useState(0)
  const { status, logout } = useAuth()

  const goTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  useEffect(() => {
    const update = () => setY(window.scrollY)
    window.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const navLinkClass = (href: string) =>
    pathName === href
      ? 'text-blue-700 font-semibold'
      : 'text-slate-600 hover:text-blue-700 transition-colors'

  return (
    <header
      className={`w-full z-50 sticky top-0 bg-white/95 backdrop-blur-sm ${
        y > 0 ? 'border-b border-slate-200 shadow-sm' : ''
      } transition-shadow`}>
      <div className='mx-auto flex items-center justify-between px-4 py-3 max-w-7xl'>
        {/* Logo */}
        <Link
          onClick={() => setIsOpen(false)}
          href='/'
          className='flex items-center gap-2 text-xl font-bold text-blue-700 hover:text-blue-800 transition-colors'>
          <Image src={logo} priority height={40} width={32} alt='DentalSys' />
          DentalSys
        </Link>

        {/* Desktop nav */}
        <nav className='hidden md:flex items-center gap-6 text-sm'>
          <Link href='/about' aria-label='Sobre nós' className={navLinkClass('/about')}>
            Sobre nós
          </Link>
          <Link href='/services' aria-label='Serviços' className={navLinkClass('/services')}>
            Serviços
          </Link>
          <Link
            href='/booking'
            aria-label='Agendar consulta'
            className='rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition-colors'>
            Agendar agora
          </Link>
          {status === 'authenticated' && (
            <>
              <Link
                href='/admin/bookings'
                aria-label='Painel administrativo'
                className={pathName.startsWith('/admin') ? 'text-blue-700 font-semibold' : 'text-slate-600 hover:text-blue-700 transition-colors'}>
                Admin
              </Link>
              <button
                onClick={logout}
                className='rounded-lg border border-blue-700 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors'>
                Sair
              </button>
            </>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          aria-label='Abrir menu'
          className={`hamburger md:hidden focus:outline-none ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(p => !p)}>
          <span className='hamburger-top' />
          <span className='hamburger-middle' />
          <span className='hamburger-bottom' />
        </button>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className='md:hidden bg-white border-t border-slate-100 px-4 pb-4 pt-2 flex flex-col gap-2 shadow-md'>
          <Link href='/about' className='animate-link rounded-lg border border-slate-200 p-3 text-center text-sm font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700'>
            Sobre nós
          </Link>
          <Link href='/services' className='animate-link rounded-lg border border-slate-200 p-3 text-center text-sm font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700'>
            Serviços
          </Link>
          <Link href='/booking' className='animate-link rounded-lg bg-blue-700 p-3 text-center text-sm font-semibold text-white'>
            Agendar agora
          </Link>
          {status === 'authenticated' && (
            <>
              <Link href='/admin/bookings' className='animate-link rounded-lg border border-slate-200 p-3 text-center text-sm font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700'>
                Admin
              </Link>
              <button className='animate-link rounded-lg bg-blue-700 p-3 text-center text-sm font-semibold text-white' onClick={logout}>
                Sair
              </button>
            </>
          )}
        </div>
      )}

      {/* Scroll-to-top button */}
      <div className='fixed bottom-6 right-6 z-10'>
        <button
          aria-label='Voltar ao topo'
          onClick={goTop}
          className={`${y < 40 ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity rounded-full border-2 border-blue-700 bg-white w-10 h-10 grid place-items-center shadow-md hover:bg-blue-50`}>
          <UpArrow />
        </button>
      </div>
    </header>
  )
}
export default TheHeader
