'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardStats } from '@/lib/types'

function StatCard({ label, value, sub, href, color }: {
  label: string
  value: string | number
  sub?: string
  href?: string
  color: string
}) {
  const content = (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-1 hover:shadow-md transition-shadow`}>
      <span className='text-xs font-medium text-gray-500 uppercase tracking-wide'>{label}</span>
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
      {sub && <span className='text-xs text-gray-400'>{sub}</span>}
    </div>
  )
  if (href) return <Link href={href}>{content}</Link>
  return content
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Dashboard | AmpeDent'
    async function load() {
      try {
        const res = await fetch('/api/dashboard')
        if (!res.ok) throw new Error('Erro ao carregar dashboard')
        const data = await res.json()
        setStats(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
        <p className='text-sm text-gray-500 mt-1'>Visão geral da clínica</p>
      </div>

      {error && (
        <div className='rounded-md bg-red-50 border border-red-200 p-4'>
          <p className='text-red-700 text-sm'>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='bg-white rounded-xl border border-gray-100 shadow-sm p-5 h-24 animate-pulse'>
              <div className='h-3 bg-gray-200 rounded w-1/2 mb-3' />
              <div className='h-8 bg-gray-200 rounded w-2/3' />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          <StatCard
            label='Total de pacientes'
            value={stats.totalPacientes}
            sub={`+${stats.pacientesMes} este mês`}
            href='/admin/patients'
            color='text-blue-600'
          />
          <StatCard
            label='Agendamentos pendentes'
            value={stats.agendamentosPendentes}
            href='/admin/bookings'
            color='text-amber-600'
          />
          <StatCard
            label='Receita pendente'
            value={formatCurrency(stats.receitaPendente)}
            href='/admin/financial'
            color='text-red-600'
          />
          <StatCard
            label='Receita do mês'
            value={formatCurrency(stats.receitaMes)}
            color='text-green-600'
          />
        </div>
      ) : null}

      <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {[
          { label: 'Pacientes', desc: 'Gerenciar cadastro de pacientes', href: '/admin/patients', icon: '👥' },
          { label: 'Agendamentos', desc: 'Ver e gerenciar consultas', href: '/admin/bookings', icon: '📅' },
          { label: 'Procedimentos', desc: 'Tabela de preços e serviços', href: '/admin/procedures', icon: '🦷' },
          { label: 'Financeiro', desc: 'Contas a receber e pagamentos', href: '/admin/financial', icon: '💰' },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className='bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all group'>
            <div className='text-2xl mb-2'>{item.icon}</div>
            <div className='font-semibold text-gray-900 group-hover:text-blue-600 transition-colors'>
              {item.label}
            </div>
            <div className='text-sm text-gray-500 mt-1'>{item.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
