import { setAuthCookies, signUpWithPassword } from '@/lib/supabaseAuth'
import { supabaseRequest } from '@/lib/supabaseAdmin'
import { AdminUserRow } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return Response.json(
        { message: 'Nome, email e senha são obrigatórios' },
        { status: 400 },
      )
    }

    const normalizedEmail = email.toLowerCase()
    const normalizedName = name.toLowerCase()
    const session = await signUpWithPassword(
      normalizedEmail,
      password,
      normalizedName,
    )

    const authUser = 'user' in session ? session.user : session

    await supabaseRequest<AdminUserRow[]>('admin_users', {
      method: 'POST',
      body: {
        auth_user_id: authUser.id,
        email: normalizedEmail,
        name: normalizedName,
        role: 'admin',
      },
      searchParams: {
        select: 'id,auth_user_id,email,name,role',
      },
      headers: {
        Prefer: 'return=representation',
      },
    })

    const authenticated =
      'access_token' in session && session.access_token && session.refresh_token

    if (authenticated) {
      await setAuthCookies(session)
    }

    return Response.json({
      authenticated,
      message: authenticated
        ? 'Cadastro realizado com sucesso'
        : 'Cadastro realizado. Confirme o email antes de entrar.',
    })
  } catch (error: any) {
    return Response.json(
      { message: error.message ?? 'Não foi possível cadastrar o usuário' },
      { status: 400 },
    )
  }
}
