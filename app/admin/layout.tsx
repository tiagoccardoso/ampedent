'use client'

import { usePathname } from 'next/navigation'
import SideNav from '../components/layout/SideNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthScreen = pathname === '/admin'

  if (isAuthScreen) {
    return <>{children}</>
  }

  return (
    <div className='flex min-h-screen flex-col md:flex-row bg-[#f8f9ff]'>
      <div className='w-full flex-none md:w-60 md:sticky md:top-0 md:h-screen'>
        <SideNav />
      </div>
      <div className='flex-grow p-4 md:p-8 md:overflow-y-auto'>{children}</div>
    </div>
  )
}
