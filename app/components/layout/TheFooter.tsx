'use client'

import Link from 'next/link'
import Github from '../Icons/Github'
import { useAuth } from '@/app/components/AppProvider'

function TheFooter() {
  const currentYear = new Date().getFullYear()
  const { status } = useAuth()

  return (
    <footer className='relative bg-white border-t border-slate-200'>
      <div className='wave'>
        <svg
          data-name='Layer 1'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 1200 120'
          preserveAspectRatio='none'>
          <path
            d='M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z'
            className='shape-fill'
          />
        </svg>
      </div>

      <div className='mx-auto w-full max-w-7xl px-5 py-16 md:py-24'>
        <div className='flex flex-col md:flex-row justify-between gap-10'>
          {/* Brand */}
          <div className='max-w-xs'>
            <p className='text-2xl font-bold text-blue-700 mb-2'>DentalSys</p>
            <p className='text-slate-500 text-sm leading-relaxed'>
              Cuidado personalizado e resultados excepcionais para o seu sorriso.
            </p>
          </div>

          {/* Contact */}
          <div className='flex flex-col gap-3 text-sm text-slate-600'>
            <div className='flex items-start gap-2'>
              <img
                src='https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a94bb99e6cf78_MapPin.svg'
                alt='' width={18} height={18} className='mt-0.5 flex-shrink-0' />
              <span>123 Main St, Anytown, CA 90210, USA</span>
            </div>
            <div className='flex items-center gap-2'>
              <img
                src='https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a944119e6cf76_EnvelopeSimple-2.svg'
                alt='' width={18} height={18} />
              <span>contato@dentalsys.com</span>
            </div>
            <div className='flex items-center gap-2'>
              <img
                src='https://www.svgrepo.com/show/79112/telephone.svg'
                alt='' width={18} height={18} />
              <span>+1234567890</span>
            </div>
          </div>
        </div>

        <div className='divider' />

        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
          <nav className='flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500'>
            <Link href='/about' className='hover:text-blue-700 transition-colors'>Sobre nós</Link>
            <Link href='/services' className='hover:text-blue-700 transition-colors'>Serviços</Link>
            <Link href='/booking' className='hover:text-blue-700 transition-colors'>Agendamento</Link>
            {status === 'authenticated' && (
              <Link href='/admin/bookings' className='hover:text-blue-700 transition-colors'>Admin</Link>
            )}
          </nav>
          <Link
            href='https://github.com/atalek/ampedent'
            target='_blank'
            className='flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors'>
            © {currentYear} DentalSys <Github />
          </Link>
        </div>
      </div>
    </footer>
  )
}
export default TheFooter
