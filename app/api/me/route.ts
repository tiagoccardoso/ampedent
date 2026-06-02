import { getCurrentAdminProfile } from '@/lib/auth'
import { getUserSubscription } from '@/lib/db'
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

export async function GET() {
  try {
    const admin = await getCurrentAdminProfile()
    if (!admin) return Response.json({ message: 'Não autorizado' }, { status: 401 })

    const sub = await getUserSubscription(admin.profile.id)
    const hasAccess = computeHasAccess(sub)

    return Response.json({
      message: 'Usuário encontrado',
      user: admin.profile.name,
      email: admin.profile.email,
      role: admin.profile.role,
      hasAccess,
      subscription: sub,
    })
  } catch (error) {
    console.error('me.get', error)
    return Response.json({ message: 'Não autorizado' }, { status: 401 })
  }
}
