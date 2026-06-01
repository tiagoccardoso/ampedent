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
    <div className='flex min-h-screen' style={{ background: '#f8fafb' }}>
      {/* Sidebar */}
      <div className='w-full flex-none md:w-64 shrink-0'>
        <SideNav />
      </div>
      {/* Main content */}
      <div className='flex-1 overflow-auto'>
        <div className='p-6 md:p-10 max-w-[1280px]'>
          {children}
        </div>
      </div>
    </div>
  )
}
