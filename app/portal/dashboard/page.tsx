'use client'
import { useAuth } from '@/app/components/AppProvider'
import Link from 'next/link'
import { useEffect } from 'react'

export default function PortalDashboard() {
  useEffect(() => { document.title = 'Meu Portal | DentalSys' }, [])
  const { session } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Olá, {session?.user}!</h1>
        <p className="text-gray-500 mt-1">Bem-vindo ao seu portal do paciente.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/portal/bookings" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="text-2xl mb-2">📅</div>
          <div className="font-semibold text-gray-900">Meus Agendamentos</div>
          <div className="text-sm text-gray-500 mt-1">Veja suas consultas marcadas</div>
        </Link>
        <Link href="/booking" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="text-2xl mb-2">➕</div>
          <div className="font-semibold text-gray-900">Novo Agendamento</div>
          <div className="text-sm text-gray-500 mt-1">Marque uma nova consulta</div>
        </Link>
      </div>
    </div>
  )
}
