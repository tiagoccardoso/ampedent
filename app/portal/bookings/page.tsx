'use client'
import { useEffect, useState } from 'react'

type Booking = { id: string; date: string; time: string; status: string; firstName: string; lastName: string }

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}
const STATUS_LABELS: Record<string, string> = { pending: 'Agendado', completed: 'Concluído', canceled: 'Cancelado' }
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  canceled: 'bg-gray-100 text-gray-500',
}

export default function PortalBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Meus Agendamentos | DentalSys'
    async function load() {
      try {
        const res = await fetch('/api/portal/bookings')
        if (!res.ok) throw new Error('Erro ao carregar agendamentos')
        const data = await res.json()
        setBookings(data.bookings)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Meus Agendamentos</h1>
      {error && <div className="rounded-md bg-red-50 border border-red-200 p-4"><p className="text-red-700 text-sm">{error}</p></div>}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
          ))
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Nenhum agendamento encontrado</div>
        ) : (
          bookings.map(b => (
            <div key={b.id} className="p-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-gray-900">{formatDate(b.date)}</div>
                <div className="text-sm text-gray-500">às {b.time}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {STATUS_LABELS[b.status] ?? b.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
