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
    <div className='flex min-h-screen flex-col md:flex-row md:overflow-hidden'>
      <div className='w-full flex-none md:w-64'>
        <SideNav />
      </div>
      <div className='flex-grow p-6 md:overflow-y-auto md:p-12'>{children}</div>
    </div>
  )
}
