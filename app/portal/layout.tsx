'use client'
import { useAuth } from '@/app/components/AppProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { status, session, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin')
    if (status === 'authenticated' && session?.role && !['paciente'].includes(session.role)) {
      router.push('/admin/bookings')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link href="/portal" className="font-bold text-blue-600 text-lg">DentalSys</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{session?.user}</span>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">Sair</button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
