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
    <div className='flex min-h-screen bg-[#F6F8FC]'>
      {/* Sidebar */}
      <aside className='w-16 md:w-60 shrink-0 sticky top-0 h-screen'>
        <SideNav />
      </aside>

      {/* Main content */}
      <main className='flex-1 min-w-0 overflow-y-auto'>
        <div className='px-4 py-6 md:px-8 md:py-8 max-w-7xl'>
          {children}
        </div>
      </main>
    </div>
  )
}
