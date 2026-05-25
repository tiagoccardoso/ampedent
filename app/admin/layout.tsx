'use client'

import { usePathname } from 'next/navigation'
import SideNav from '../components/layout/SideNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthScreen = pathname === '/admin'

  if (isAuthScreen) return <>{children}</>

  return (
    <div className='flex min-h-screen bg-slate-50'>
      {/* Sidebar */}
      <div className='w-full md:w-60 flex-none md:sticky md:top-0 md:h-screen md:overflow-hidden'>
        <SideNav />
      </div>

      {/* Main content */}
      <main className='flex-1 min-w-0 p-4 md:p-8'>
        {children}
      </main>
    </div>
  )
}
