'use client'

import Link from 'next/link'
import Github from '../Icons/Github'
import { useAuth } from '@/app/components/AppProvider'

function TheFooter() {
  const currentYear = new Date().getFullYear()
  const { status } = useAuth()

  return (
    <footer className='block relative bg-white border-t border-[#e5e7eb]'>
      <div className='wave'>
        <svg
          data-name='Layer 1'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 1200 120'
          preserveAspectRatio='none'>
          <path
            d='M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z'
            className='shape-fill'></path>
        </svg>
      </div>
      <div className='py-16 md:py-24 mx-auto w-full max-w-7xl px-5 md:px-10'>
        <div className='flex-row flex justify-between max-[767px]:flex-col max-[767px]:items-start gap-8'>
          <div className='w-full max-w-[520px]'>
            <h2 className='font-bold text-2xl md:text-4xl text-[#0f172a] leading-tight'>
              Cuidado personalizado,<br />resultados excepcionais
            </h2>
            <p className='mt-4 text-[#64748b] text-sm leading-relaxed max-w-sm'>
              Tecnologia e cuidado humano para um sorriso mais saudável.
            </p>
          </div>
          <div className='flex flex-col gap-3 min-w-[220px]'>
            <div className='flex items-start gap-3'>
              <span className='mt-0.5 flex-shrink-0 w-5 h-5 text-[#0e7490]'>
                <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/></svg>
              </span>
              <p className='text-[#64748b] text-sm'>123 Rua Principal, São Paulo, SP</p>
            </div>
            <div className='flex items-start gap-3'>
              <span className='mt-0.5 flex-shrink-0 w-5 h-5 text-[#0e7490]'>
                <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'/><polyline points='22,6 12,13 2,6'/></svg>
              </span>
              <p className='text-[#64748b] text-sm'>contato@dentalsys.com</p>
            </div>
            <div className='flex items-start gap-3'>
              <span className='mt-0.5 flex-shrink-0 w-5 h-5 text-[#0e7490]'>
                <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z'/></svg>
              </span>
              <p className='text-[#64748b] text-sm'>+55 (11) 9999-9999</p>
            </div>
          </div>
        </div>

        <div className='border-t border-[#e5e7eb] mt-12 pt-8 flex flex-row justify-between items-center max-[767px]:flex-col max-[767px]:items-start gap-4'>
          <div className='flex gap-6 flex-wrap'>
            <Link href='/about' className='text-sm text-[#64748b] hover:text-[#0e7490] transition-colors'>
              Sobre nós
            </Link>
            <Link href='/services' className='text-sm text-[#64748b] hover:text-[#0e7490] transition-colors'>
              Serviços
            </Link>
            <Link href='/booking' className='text-sm text-[#64748b] hover:text-[#0e7490] transition-colors'>
              Agendamento
            </Link>
            {status === 'authenticated' && (
              <Link href='/admin/dashboard' className='text-sm text-[#64748b] hover:text-[#0e7490] transition-colors'>
                Admin
              </Link>
            )}
          </div>
          <Link
            href='https://github.com/atalek/ampedent'
            target='_blank'
            className='text-sm text-[#64748b] flex items-center gap-1.5 hover:text-[#0e7490] transition-colors'>
            © {currentYear} DentalSys
            <Github />
          </Link>
        </div>
      </div>
    </footer>
  )
}
export default TheFooter
