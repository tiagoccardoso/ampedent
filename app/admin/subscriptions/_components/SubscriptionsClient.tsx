'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserSubscription } from '@/lib/types'

type Props = {
  subscription: UserSubscription | null
  hasAccess: boolean
  trialDaysRemaining: number
}

export default function SubscriptionsClient({ subscription, hasAccess, trialDaysRemaining }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const trialActive = !!subscription?.trial_started_at && trialDaysRemaining > 0
  const trialUsed = !!subscription?.trial_started_at && trialDaysRemaining === 0
  const subscriptionActive = subscription?.subscription_status === 'active'

  async function startTrial() {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start_trial' }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Teste grátis ativado! Aproveite 7 dias de acesso completo.')
        router.refresh()
      } else {
        setMessage(data.message ?? 'Erro ao ativar teste grátis.')
      }
    } finally {
      setLoading(false)
    }
  }

  function currentStatusBadge() {
    if (subscriptionActive) {
      const plan = subscription?.subscription_plan === 'annual' ? 'Anual' : 'Mensal'
      const ends = subscription?.subscription_ends_at
        ? new Date(subscription.subscription_ends_at).toLocaleDateString('pt-BR')
        : null
      return (
        <div className='rounded-xl border border-green-200 bg-green-50 p-5'>
          <p className='text-sm font-semibold text-green-700 uppercase tracking-wide'>Plano ativo</p>
          <p className='mt-1 text-xl font-bold text-green-900'>Plano {plan}</p>
          {ends && <p className='mt-1 text-sm text-green-700'>Válido até {ends}</p>}
        </div>
      )
    }
    if (trialActive) {
      return (
        <div className='rounded-xl border border-blue-200 bg-blue-50 p-5'>
          <p className='text-sm font-semibold text-blue-700 uppercase tracking-wide'>Teste grátis ativo</p>
          <p className='mt-1 text-xl font-bold text-blue-900'>
            {trialDaysRemaining} {trialDaysRemaining === 1 ? 'dia restante' : 'dias restantes'}
          </p>
          <p className='mt-1 text-sm text-blue-700'>Após o período de teste, escolha um plano para continuar.</p>
        </div>
      )
    }
    if (trialUsed) {
      return (
        <div className='rounded-xl border border-red-200 bg-red-50 p-5'>
          <p className='text-sm font-semibold text-red-700 uppercase tracking-wide'>Acesso bloqueado</p>
          <p className='mt-1 text-xl font-bold text-red-900'>Período de teste encerrado</p>
          <p className='mt-1 text-sm text-red-700'>Escolha um plano abaixo para reativar o acesso.</p>
        </div>
      )
    }
    return (
      <div className='rounded-xl border border-gray-200 bg-gray-50 p-5'>
        <p className='text-sm font-semibold text-gray-500 uppercase tracking-wide'>Sem plano ativo</p>
        <p className='mt-1 text-xl font-bold text-gray-700'>Nenhum plano ativado</p>
        <p className='mt-1 text-sm text-gray-500'>Ative o teste grátis ou escolha um plano.</p>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      {currentStatusBadge()}

      {message && (
        <p className='rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700'>{message}</p>
      )}

      <div>
        <h2 className='mb-4 text-lg font-bold'>Planos disponíveis</h2>
        <div className='grid gap-6 sm:grid-cols-3'>

          {/* Trial */}
          <div className='rounded-xl border bg-white p-6 shadow-sm flex flex-col'>
            <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>Começar</p>
            <p className='mt-2 text-xl font-bold text-gray-900'>Teste Grátis</p>
            <p className='mt-1 text-3xl font-bold text-blue-700'>R$ 0</p>
            <p className='text-sm text-gray-500'>por 7 dias</p>
            <ul className='mt-4 space-y-2 text-sm text-gray-600 flex-1'>
              <li>✓ Acesso completo ao sistema</li>
              <li>✓ Sem necessidade de cartão</li>
              <li>✓ 7 dias de acesso total</li>
            </ul>
            <div className='mt-6'>
              {!subscription?.trial_started_at ? (
                <button
                  onClick={startTrial}
                  disabled={loading}
                  className='w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50'
                >
                  {loading ? 'Ativando…' : 'Ativar teste grátis'}
                </button>
              ) : (
                <span className='block w-full rounded-md bg-gray-100 px-4 py-2 text-center text-sm font-semibold text-gray-500'>
                  {trialActive ? `${trialDaysRemaining} dias restantes` : 'Teste encerrado'}
                </span>
              )}
            </div>
          </div>

          {/* Mensal */}
          <div className='rounded-xl border bg-white p-6 shadow-sm flex flex-col'>
            <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>Popular</p>
            <p className='mt-2 text-xl font-bold text-gray-900'>Plano Mensal</p>
            <p className='mt-1 text-3xl font-bold text-blue-700'>R$ 79,00</p>
            <p className='text-sm text-gray-500'>por mês</p>
            <ul className='mt-4 space-y-2 text-sm text-gray-600 flex-1'>
              <li>✓ Acesso completo ao sistema</li>
              <li>✓ Renovação mensal automática</li>
              <li>✓ Cancele quando quiser</li>
            </ul>
            <div className='mt-6'>
              <button
                disabled
                title='Integração de pagamento em breve'
                className='w-full rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500 cursor-not-allowed'
              >
                Em breve
              </button>
            </div>
          </div>

          {/* Anual */}
          <div className='rounded-xl border-2 border-blue-600 bg-white p-6 shadow-sm flex flex-col relative'>
            <span className='absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-bold text-white'>
              Melhor valor
            </span>
            <p className='text-xs font-semibold uppercase tracking-wide text-blue-600'>Economia</p>
            <p className='mt-2 text-xl font-bold text-gray-900'>Plano Anual</p>
            <p className='mt-1 text-3xl font-bold text-blue-700'>R$ 718,80</p>
            <p className='text-sm text-gray-500'>por ano · ou 12x de R$ 59,90</p>
            <ul className='mt-4 space-y-2 text-sm text-gray-600 flex-1'>
              <li>✓ Acesso completo ao sistema</li>
              <li>✓ Economia de R$ 229,20/ano</li>
              <li>✓ Renovação anual</li>
            </ul>
            <div className='mt-6'>
              <button
                disabled
                title='Integração de pagamento em breve'
                className='w-full rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500 cursor-not-allowed'
              >
                Em breve
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className='rounded-xl border bg-gray-50 p-5 text-sm text-gray-500'>
        <p className='font-semibold text-gray-700'>Sobre os planos pagos</p>
        <p className='mt-1'>
          Os planos Mensal e Anual estarão disponíveis em breve com integração de pagamento.
          Enquanto isso, aproveite o período de teste grátis de 7 dias com acesso completo.
        </p>
      </div>
    </div>
  )
}
