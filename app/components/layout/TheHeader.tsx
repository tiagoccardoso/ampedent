'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/components/AppProvider'
import type { HeaderConfig } from '@/lib/siteContent'

function ToothIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 3C10 3 6 6 6 10C6 13 8 15 8 17.5C8 21 10 25 12.5 25C13.8 25 14.5 22 14 22C13.5 22 14.2 25 15.5 25C18 25 20 21 20 17.5C20 15 22 13 22 10C22 6 18 3 14 3Z"
        fill="currentColor"
      />
    </svg>
  )
}

function UpArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 4L10 16M10 4L5 9M10 4L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function TheHeader({ config }: { config?: HeaderConfig }) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [y, setY] = useState(0)
  const pathName = usePathname()
  const { status, logout } = useAuth()

  const clinicName = config?.clinic_name || 'Odonto Prime'
  const tagline = config?.tagline || 'Studio'
  const iconUrl = config?.icon_url || null

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      setY(window.scrollY)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (path: string) => pathName === path || pathName.startsWith(path + '/')

  return (
    <header
      className={`w-full z-50 sticky top-0 transition-all duration-300 ${
        scrolled
          ? 'glass-nav shadow-ambient'
          : 'bg-transparent border-b border-transparent'
      }`}
      style={{ background: scrolled ? 'rgba(248,250,251,0.94)' : 'rgba(248,250,251,0.82)', backdropFilter: 'blur(20px)' }}>
      <div className='mx-auto flex items-center justify-between px-5 py-3 max-w-[1280px]'>
        {/* Logo */}
        <Link
          href='/'
          onClick={() => setIsOpen(false)}
          className='flex items-center gap-2.5 group'>
          <div className='flex items-center justify-center w-9 h-9 rounded-lg bg-[#003441] text-white transition-transform group-hover:scale-105 overflow-hidden'>
            {iconUrl ? (
              <Image src={iconUrl} alt={clinicName} width={36} height={36} className='object-cover w-full h-full' />
            ) : (
              <ToothIcon />
            )}
          </div>
          <div className='flex flex-col leading-none'>
            <span className='text-[#003441] font-extrabold text-base tracking-tight' style={{ fontFamily: 'Manrope, sans-serif' }}>
              {clinicName}
            </span>
            <span className='text-[#cca730] font-semibold text-[10px] tracking-[0.12em] uppercase' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {tagline}
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className='hidden md:flex items-center gap-1'>
          {[
            { href: '/about', label: 'Sobre nós' },
            { href: '/services', label: 'Serviços' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                isActive(href)
                  ? 'bg-[#003441]/8 text-[#003441]'
                  : 'text-[#40484b] hover:text-[#003441] hover:bg-[#003441]/5'
              }`}>
              {label}
            </Link>
          ))}

          <Link
            href='/agenda'
            className='ml-2 btn-primary text-sm'>
            Agendar consulta
          </Link>

          {status !== 'authenticated' && (
            <Link
              href='/admin'
              className='ml-1 btn-secondary text-sm'>
              Entrar
            </Link>
          )}

          {status === 'authenticated' && (
            <>
              <Link
                href='/admin/dashboard'
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  pathName.startsWith('/admin')
                    ? 'bg-[#003441]/8 text-[#003441]'
                    : 'text-[#40484b] hover:text-[#003441] hover:bg-[#003441]/5'
                }`}>
                Painel
              </Link>
              <button
                onClick={logout}
                className='ml-1 btn-secondary text-sm'>
                Sair
              </button>
            </>
          )}
        </nav>

        {/* Mobile controls */}
        <div className='flex md:hidden items-center gap-3'>
          {status !== 'authenticated' && (
            <Link
              href='/admin'
              className='rounded-lg border border-[#cca730] px-3 py-1.5 text-sm font-semibold text-[#003441] hover:bg-[#cca730]/10 transition-colors'
              onClick={() => setIsOpen(false)}>
              Entrar
            </Link>
          )}
          <button
            aria-label='Abrir menu'
            className={`hamburger ${isOpen ? 'open' : ''}`}
            onClick={() => setIsOpen(prev => !prev)}>
            <span className='hamburger-top' />
            <span className='hamburger-middle' />
            <span className='hamburger-bottom' />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div
          className='md:hidden border-t border-[#c0c8cb]/40 bg-white/95 backdrop-blur-xl px-5 py-4 flex flex-col gap-2'
          onClick={() => setIsOpen(false)}>
          {[
            { href: '/about', label: 'Sobre nós' },
            { href: '/services', label: 'Serviços' },
          ].map(({ href, label }, i) => (
            <Link
              key={href}
              href={href}
              className={`animate-link rounded-lg px-4 py-3 text-sm font-semibold text-[#40484b] hover:bg-[#003441]/5 hover:text-[#003441] transition-colors`}
              style={{ animationDelay: `${(i + 1) * 0.05}s` }}>
              {label}
            </Link>
          ))}
          <Link
            href='/agenda'
            className='animate-link btn-primary justify-center'
            style={{ animationDelay: '0.15s' }}>
            Agendar consulta
          </Link>
          {status === 'authenticated' && (
            <>
              <Link
                href='/admin/dashboard'
                className='animate-link rounded-lg px-4 py-3 text-sm font-semibold text-[#40484b] hover:bg-[#003441]/5 hover:text-[#003441] transition-colors'
                style={{ animationDelay: '0.2s' }}>
                Painel administrativo
              </Link>
              <button
                className='animate-link btn-secondary justify-center'
                style={{ animationDelay: '0.25s' }}
                onClick={logout}>
                Sair
              </button>
            </>
          )}
        </div>
      )}

      {/* Back-to-top */}
      <div className='fixed bottom-6 right-6 z-50'>
        <button
          aria-label='Voltar ao topo'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`${
            y < 300 ? 'opacity-0 pointer-events-none' : 'opacity-100'
          } transition-opacity w-11 h-11 rounded-full bg-[#003441] text-white flex items-center justify-center shadow-ambient hover:bg-[#0f4c5c] hover:shadow-ambient-lg`}>
          <UpArrowIcon />
        </button>
      </div>
    </header>
  )
}
