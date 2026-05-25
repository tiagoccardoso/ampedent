'use client'

import Image from 'next/image'
import Link from 'next/link'
import NavLinks from './NavLinks'
import { useAuth } from '@/app/components/AppProvider'

function SideNav() {
  const { session, status } = useAuth()

  if (status !== 'authenticated') return null

  return (
    <div className='flex h-full flex-col bg-white border-r border-gray-200'>
      {/* Logo */}
      <div className='hidden md:flex items-center gap-3 px-4 py-5 border-b border-gray-100'>
        <Link href='/' className='flex items-center gap-2.5 hover:opacity-80 transition-opacity'>
          <Image
            alt='DentalSys logo'
            width={36}
            height={36}
            src='/ampedent.webp'
            className='rounded-md'
          />
          <span className='text-base font-semibold text-gray-900 tracking-tight'>DentalSys</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className='flex-1 overflow-y-auto px-2 py-3'>
        <div className='flex flex-row md:flex-col gap-1'>
          <NavLinks />
        </div>
      </nav>

      {/* User info */}
      <div className='hidden md:block border-t border-gray-100 px-3 py-3'>
        <div className='flex items-center gap-3 rounded-lg px-2 py-2'>
          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase'>
            {session?.user?.charAt(0) ?? '?'}
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium text-gray-900'>{session?.user}</p>
            <p className='truncate text-xs text-gray-400 capitalize'>{session?.role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SideNav
