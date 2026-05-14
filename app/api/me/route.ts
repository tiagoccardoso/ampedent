import authOptions from '@/lib/authOptions'
import { supabaseRequest } from '@/lib/supabaseAdmin'
import { AdminUserRow } from '@/lib/types'
import { getServerSession } from 'next-auth'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (session) {
      const { data: users } = await supabaseRequest<AdminUserRow[]>(
        'admin_users',
        {
          searchParams: {
            select: 'name,role',
            name: `eq.${session?.user?.name}`,
            limit: 1,
          },
        },
      )

      const user = users[0]

      if (!user) {
        throw new Error('Unauthorized')
      }

      return Response.json({
        message: 'user fetched',
        user: user.name,
        role: user.role,
      })
    } else {
      throw new Error('Unauthorized')
    }
  } catch (error) {
    throw error
  }
}
