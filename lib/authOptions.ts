import { AdminUserRow } from '@/lib/types'
import { supabaseRequest } from '@/lib/supabaseAdmin'
import bcrypt from 'bcryptjs'
import CredentialsProvider from 'next-auth/providers/credentials'
import { NextAuthOptions } from 'next-auth'

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      id: 'credentials',
      credentials: {
        name: { label: 'Name', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const name = credentials?.name?.toLowerCase()
        const password = credentials?.password

        if (!name || !password) {
          return null
        }

        const { data: users } = await supabaseRequest<AdminUserRow[]>(
          'admin_users',
          {
            searchParams: {
              select: 'id,name,password,role',
              name: `eq.${name}`,
              limit: 1,
            },
          },
        )

        const user = users[0]

        if (user?.password && (await bcrypt.compare(password, user.password))) {
          return {
            id: user.id,
            name: user.name,
          }
        }

        return null
      },
    }),
  ],
}

export default authOptions
