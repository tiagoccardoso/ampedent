'use client'

import { useAuth } from '@/app/components/AppProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import SideNav from '../components/layout/SideNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status, session } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin')
    }
    if (status === 'authenticated' && session?.role === 'paciente') {
      router.push('/portal')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full' />
      </div>
    )
  }

  if (status === 'unauthenticated') return null

  return (
    <div className='flex min-h-screen flex-col md:flex-row'>
      <div className='flex-none md:w-56 lg:w-64'>
        <SideNav />
      </div>
      <div className='flex-1 min-w-0 p-4 pb-20 sm:p-6 md:p-8 md:pb-8 overflow-y-auto'>
        {children}
      </div>
    </div>
  )
}
