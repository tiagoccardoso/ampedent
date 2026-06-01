'use client'

import Link from 'next/link'
import { useAuth } from '@/app/components/AppProvider'

function ToothLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 3C11.5 3 7 6.5 7 11.5C7 15 9 17.5 9 20.5C9 25 11.5 29 14.5 29C16 29 16.8 26 16 26C15.2 26 16 29 17.5 29C20.5 29 23 25 23 20.5C23 17.5 25 15 25 11.5C25 6.5 20.5 3 16 3Z"
        fill="#9acee1"
      />
    </svg>
  )
}

export default function TheFooter() {
  const year = new Date().getFullYear()
  const { status } = useAuth()

  return (
    <footer className='relative bg-[#003441] text-white overflow-hidden'>
      {/* Top wave */}
      <div className='wave'>
        <svg data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'>
          <path
            d='M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z'
            className='shape-fill'
          />
        </svg>
      </div>

      {/* Decorative gradient orb */}
      <div
        className='absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none'
        style={{ background: 'radial-gradient(circle, #9acee1 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
      />

      <div className='relative z-10 mx-auto max-w-[1280px] px-5 pt-28 pb-12'>
        {/* Main grid */}
        <div className='grid gap-12 sm:grid-cols-2 lg:grid-cols-4 mb-16'>
          {/* Brand */}
          <div className='lg:col-span-2'>
            <Link href='/' className='inline-flex items-center gap-3 mb-5 group'>
              <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors'>
                <ToothLogo />
              </div>
              <div>
                <div className='font-extrabold text-xl text-white' style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Odonto Prime
                </div>
                <div className='text-[#cca730] font-bold text-[10px] tracking-[0.12em] uppercase' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Studio
                </div>
              </div>
            </Link>
            <p className='text-white/70 text-sm leading-relaxed max-w-sm'>
              Odontologia de alto padrão com tecnologia de ponta, equipe especializada e atendimento humanizado. Seu sorriso é a nossa arte.
            </p>
            <div className='mt-6 flex flex-col gap-3 text-sm text-white/60'>
              <div className='flex items-center gap-3'>
                <span className='text-[#cca730]'>📍</span>
                <span>Rua das Clínicas, 123 – São Paulo, SP</span>
              </div>
              <div className='flex items-center gap-3'>
                <span className='text-[#cca730]'>✉️</span>
                <span>contato@odontoprimestudio.com.br</span>
              </div>
              <div className='flex items-center gap-3'>
                <span className='text-[#cca730]'>📞</span>
                <span>(11) 99999-0000</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4
              className='mb-5 text-[#cca730] font-bold text-xs tracking-[0.12em] uppercase'
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Navegação
            </h4>
            <ul className='space-y-3'>
              {[
                { href: '/', label: 'Início' },
                { href: '/about', label: 'Sobre nós' },
                { href: '/services', label: 'Serviços' },
                { href: '/agenda', label: 'Agendar online' },
              ].map(({ href, label }) => (
                <li key={href} style={{ listStyle: 'none' }}>
                  <Link
                    href={href}
                    className='text-white/70 text-sm hover:text-white hover:translate-x-1 inline-block transition-all duration-150'>
                    {label}
                  </Link>
                </li>
              ))}
              {status === 'authenticated' && (
                <li style={{ listStyle: 'none' }}>
                  <Link
                    href='/admin/dashboard'
                    className='text-white/70 text-sm hover:text-white hover:translate-x-1 inline-block transition-all duration-150'>
                    Painel Admin
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4
              className='mb-5 text-[#cca730] font-bold text-xs tracking-[0.12em] uppercase'
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Especialidades
            </h4>
            <ul className='space-y-3'>
              {[
                'Implantes Dentários',
                'Estética Dental',
                'Ortodontia',
                'Clareamento',
                'Periodontia',
                'Urgência 24h',
              ].map(item => (
                <li key={item} style={{ listStyle: 'none' }}>
                  <span className='text-white/70 text-sm'>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className='border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50'>
          <span>© {year} Odonto Prime Studio. Todos os direitos reservados.</span>
          <div className='flex items-center gap-4'>
            <span>CRO-SP 00000</span>
            <span>·</span>
            <span>Política de privacidade</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
