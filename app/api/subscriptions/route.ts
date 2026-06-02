import { getCurrentAdminProfile } from '@/lib/auth'
import { activateTrial, getUserSubscription } from '@/lib/db'
import { UserSubscription } from '@/lib/types'

function computeHasAccess(sub: UserSubscription | null): boolean {
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

function trialDaysRemaining(trialStartedAt: string | null): number {
  if (!trialStartedAt) return 0
  const end = new Date(trialStartedAt)
  end.setDate(end.getDate() + 7)
  const diff = end.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export async function GET() {
  const admin = await getCurrentAdminProfile()
  if (!admin) return Response.json({ message: 'Não autorizado' }, { status: 401 })

  const sub = await getUserSubscription(admin.profile.id)
  const hasAccess = computeHasAccess(sub)

  return Response.json({
    hasAccess,
    trialDaysRemaining: trialDaysRemaining(sub?.trial_started_at ?? null),
    subscription: sub,
  })
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminProfile()
  if (!admin) return Response.json({ message: 'Não autorizado' }, { status: 401 })

  const { action } = await req.json()

  if (action === 'start_trial') {
    const current = await getUserSubscription(admin.profile.id)
    if (current?.trial_started_at) {
      return Response.json({ message: 'Teste grátis já iniciado' }, { status: 409 })
    }
    await activateTrial(admin.profile.id)
    return Response.json({ message: 'Teste grátis ativado com sucesso' })
  }

  return Response.json({ message: 'Ação inválida' }, { status: 400 })
}
