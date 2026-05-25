'use client'

import Image from 'next/image'
import Link from 'next/link'
import NavLinks from './NavLinks'
import { useAuth } from '@/app/components/AppProvider'

function SideNav() {
  const { session, status } = useAuth()

  if (status !== 'authenticated') return null

  return (
    <aside className='flex h-full flex-col bg-white border-r border-slate-200'>
      {/* Logo */}
      <Link
        href='/'
        className='hidden md:flex items-center gap-3 px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors'>
        <Image alt='DentalSys' width={36} height={44} src='/ampedent.webp' />
        <span className='font-bold text-blue-700 text-base tracking-tight'>DentalSys</span>
      </Link>

      {/* Nav items */}
      <nav className='flex flex-row md:flex-col gap-1 p-2 md:p-3 flex-1 overflow-y-auto'>
        <NavLinks />
      </nav>

      {/* Session user footer */}
      <div className='hidden md:flex items-center gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50'>
        <div className='w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold uppercase flex-shrink-0'>
          {session?.user?.[0] ?? '?'}
        </div>
        <div className='min-w-0'>
          <p className='text-sm font-medium text-slate-700 truncate'>{session?.user}</p>
          <p className='text-xs text-slate-400 truncate'>{session?.email}</p>
        </div>
      </div>
    </aside>
  )
}
export default SideNav
