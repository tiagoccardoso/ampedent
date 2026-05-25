'use client'

import Image from 'next/image'
import Link from 'next/link'
import NavLinks from './NavLinks'
import { useAuth } from '@/app/components/AppProvider'

function SideNav() {
  const { session, status } = useAuth()

  return (
    <>
      {status === 'authenticated' && (
        <div className='flex h-full flex-col bg-white border-r border-[#e5e7eb]'>
          <Link
            className='hidden md:flex items-center gap-3 px-5 py-5 border-b border-[#e5e7eb] hover:bg-[#f8f9ff] transition-colors'
            href='/'>
            <Image
              alt='DentalSys logo'
              width={40}
              height={40}
              src={'/ampedent.webp'}
              className='h-8 w-auto'
            />
            <span className='font-bold text-[#0e7490] text-base tracking-tight'>DentalSys</span>
          </Link>

          <div className='flex grow flex-row md:flex-col overflow-y-auto py-2'>
            <NavLinks />
          </div>

          <div className='hidden md:block border-t border-[#e5e7eb] px-3 py-3'>
            <div className='flex items-center gap-3 px-3 py-2 rounded-lg bg-[#f8f9ff]'>
              <div className='w-7 h-7 rounded-full bg-[#0e7490] flex items-center justify-center text-white text-xs font-bold flex-shrink-0'>
                {session?.user?.charAt(0)?.toUpperCase() ?? 'A'}
              </div>
              <span className='text-sm font-medium text-[#0f172a] truncate'>{session?.user}</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default SideNav
