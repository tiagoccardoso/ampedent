import { getCurrentAdminProfile } from '@/lib/auth'
import { getUserSubscription } from '@/lib/db'
import { getSiteContent, getFooterConfig } from '@/lib/siteContent'
import { redirect } from 'next/navigation'
import SubscriptionsClient from './_components/SubscriptionsClient'

export default async function SubscriptionsPage() {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  const [sub, siteContent] = await Promise.all([
    getUserSubscription(admin.profile.id),
    getSiteContent().catch(() => null),
  ])

  const footer = siteContent ? getFooterConfig(siteContent) : null
  const contactWhatsapp = footer?.whatsapp || ''
  const contactEmail = footer?.email || ''

  function computeHasAccess(): boolean {
    if (!sub) return false
    const now = new Date()
    if (sub.trial_started_at) {
      const trialEnd = new Date(sub.trial_started_at)
      trialEnd.setDate(trialEnd.getDate() + 7)
      if (now < trialEnd) return true
    }
    if (sub.subscription_status === 'active') {
      if (!sub.subscription_ends_at || new Date(sub.subscription_ends_at) > now) return true
    }
    return false
  }

  function trialDaysRemaining(): number {
    if (!sub?.trial_started_at) return 0
    const end = new Date(sub.trial_started_at)
    end.setDate(end.getDate() + 7)
    return Math.max(0, Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  }

  return (
    <section className='space-y-8'>
      <div>
        <p className='text-sm font-semibold uppercase tracking-wide text-blue-700'>Conta</p>
        <h1 className='text-2xl font-bold'>Planos e Assinaturas</h1>
        <p className='text-sm text-gray-600'>Gerencie seu plano de acesso ao sistema.</p>
      </div>

      <SubscriptionsClient
        subscription={sub}
        hasAccess={computeHasAccess()}
        trialDaysRemaining={trialDaysRemaining()}
        contactWhatsapp={contactWhatsapp}
        contactEmail={contactEmail}
      />
    </section>
  )
}
