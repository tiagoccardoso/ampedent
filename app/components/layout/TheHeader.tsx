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

  const goTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const { status, logout } = useAuth()

  useEffect(() => {
    const update = () => setY(window.scrollY)
    window.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const navLink = (href: string) =>
    `text-sm font-medium transition-colors hover:text-[#0e7490] ${
      pathName === href || (href !== '/' && pathName.startsWith(href))
        ? 'text-[#0e7490] font-semibold'
        : 'text-[#0f172a]'
    }`

  return (
    <header
      className={`w-full z-50 sticky top-0 bg-white transition-shadow ${
        y > 0 ? 'shadow-sm border-b border-[#e5e7eb]' : 'border-b border-transparent'
      }`}>
      <div className='mx-auto flex flex-row items-center justify-between px-4 py-3 max-w-[1400px]'>
        <Link
          onClick={() => setIsOpen(false)}
          href='/'
          className='flex gap-2.5 items-center font-bold text-[#0e7490] hover:text-[#005a71] transition-colors'>
          <Image
            src={logo}
            priority
            height={80}
            width={62}
            alt='logotipo da DentalSys'
            className='h-10 w-auto'
          />
          <span className='text-xl tracking-tight'>DentalSys</span>
        </Link>

        <nav className='hidden md:flex gap-6 items-center'>
          <Link href='/about' aria-label='Sobre nós' className={navLink('/about')}>
            Sobre nós
          </Link>
          <Link href='/services' aria-label='Serviços' className={navLink('/services')}>
            Serviços
          </Link>
          {status === 'authenticated' && (
            <Link href='/admin/dashboard' aria-label='Painel administrativo' className={navLink('/admin')}>
              Admin
            </Link>
          )}
          <Link
            href='/booking'
            aria-label='Agendar consulta'
            className='px-5 py-2 rounded-lg bg-[#0e7490] text-white text-sm font-semibold hover:bg-[#005a71] transition-colors'>
            Agendar agora
          </Link>
          {status === 'authenticated' && (
            <button
              onClick={logout}
              className='px-4 py-2 text-sm font-medium text-[#0e7490] border border-[#0e7490] rounded-lg hover:bg-[#f0f9ff] transition-colors'>
              Sair
            </button>
          )}
        </nav>

        <button
          aria-label='Abrir menu'
          className={`flex md:hidden hamburger ${isOpen ? 'open' : ''} focus:outline-none`}
          onClick={() => setIsOpen(prev => !prev)}>
          <span className='hamburger-top'></span>
          <span className='hamburger-middle'></span>
          <span className='hamburger-bottom'></span>
        </button>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className='md:hidden px-4 pb-4 pt-1 bg-white border-t border-[#e5e7eb] flex flex-col gap-2'>
          <Link href='/about' className='border border-[#e5e7eb] rounded-lg p-3 text-sm font-medium text-center text-[#0f172a] hover:border-[#0e7490] hover:text-[#0e7490] animate-link transition-colors'>
            Sobre nós
          </Link>
          <Link href='/services' className='border border-[#e5e7eb] rounded-lg p-3 text-sm font-medium text-center text-[#0f172a] hover:border-[#0e7490] hover:text-[#0e7490] animate-link transition-colors'>
            Serviços
          </Link>
          <Link href='/booking' className='rounded-lg p-3 bg-[#0e7490] text-white text-sm font-semibold text-center animate-link'>
            Agendar agora
          </Link>
          {status === 'authenticated' && (
            <>
              <Link href='/admin/dashboard' className='border border-[#e5e7eb] rounded-lg p-3 text-sm font-medium text-center text-[#0f172a] hover:border-[#0e7490] hover:text-[#0e7490] animate-link transition-colors'>
                Admin
              </Link>
              <button className='rounded-lg p-3 bg-[#0e7490] text-white text-sm font-semibold animate-link' onClick={logout}>
                Sair
              </button>
            </>
          )}
        </div>
      )}

      <div className='fixed bottom-4 right-4 z-[10]'>
        <button
          aria-label='Voltar ao topo'
          onClick={goTop}
          className={`${
            y < 40 ? 'hidden' : ''
          } rounded-full bg-[#0e7490] text-white p-3 shadow-lg hover:bg-[#005a71] transition-colors`}>
          <UpArrow />
        </button>
      </div>
    </header>
  )
}
export default TheHeader
