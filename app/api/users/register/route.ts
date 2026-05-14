import { isSuperAdmin } from '@/lib/isSuperAdmin'
import { supabaseRequest } from '@/lib/supabaseAdmin'
import { AdminUserRow } from '@/lib/types'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, password } = body
    const role = await isSuperAdmin()

    if (role === 'superadmin') {
      const { data } = await supabaseRequest<AdminUserRow[]>('admin_users', {
        method: 'POST',
        body: {
          name: name.toLowerCase(),
          password: await bcrypt.hash(password, 10),
          role: 'admin',
        },
        searchParams: {
          select: 'name,role',
        },
        headers: {
          Prefer: 'return=representation',
        },
      })

      const user = data[0]

      return Response.json({
        message: 'New user created',
        name: user?.name,
        role: user?.role,
      })
    }

    throw new Error('Unathorized')
  } catch (error: any) {
    throw new Error(error.message)
  }
}
