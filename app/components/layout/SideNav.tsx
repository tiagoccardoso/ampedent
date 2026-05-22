'use client'

import Image from 'next/image'
import Link from 'next/link'
import NavLinks from './NavLinks'
import { useAuth } from '@/app/components/AppProvider'

function SideNav() {
  const { session, status } = useAuth()

  if (status !== 'authenticated') return null

  return (
    <>
      {/* Mobile top bar */}
      <div className='md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2'>
        <Link href='/' className='flex items-center gap-2'>
          <Image
            alt='ampedent logo'
            width={36}
            height={28}
            src={'/ampedent.webp'}
          />
          <span className='font-bold text-blue-600 text-lg'>AmpeDent</span>
        </Link>
        <span className='text-xs text-gray-500 truncate max-w-[140px]'>{session?.user}</span>
      </div>

      {/* Mobile bottom nav */}
      <nav className='md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200'>
        <div className='flex'>
          <NavLinks />
        </div>
      </nav>

      {/* Spacer to prevent content from hiding behind bottom nav on mobile */}
      <div className='md:hidden h-14' />

      {/* Desktop sidebar */}
      <aside className='hidden md:flex h-screen sticky top-0 flex-col bg-white border-r border-gray-200 w-56 lg:w-64'>
        <Link
          className='flex items-center gap-3 px-4 py-5 border-b border-gray-100'
          href='/'>
          <Image
            alt='ampedent logo'
            width={44}
            height={34}
            src={'/ampedent.webp'}
          />
          <span className='font-bold text-blue-600 text-lg leading-tight'>AmpeDent</span>
        </Link>
        <nav className='flex-1 overflow-y-auto px-2 py-3 space-y-1'>
          <NavLinks />
        </nav>
        <div className='border-t border-gray-100 px-3 py-3'>
          <div className='flex items-center gap-2 rounded-md px-3 py-2 bg-gray-50'>
            <div className='w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0'>
              <span className='text-blue-700 text-xs font-bold uppercase'>
                {session?.user?.charAt(0) ?? '?'}
              </span>
            </div>
            <span className='text-sm text-gray-700 truncate'>{session?.user}</span>
          </div>
        </div>
      </aside>
    </>
  )
}
export default SideNav
