import { cookies } from 'next/headers'
import { AdminRole, AdminUserRow } from '@/lib/types'
import { supabaseRequest } from '@/lib/supabaseAdmin'

const ACCESS_TOKEN_COOKIE = 'sb-access-token'
const REFRESH_TOKEN_COOKIE = 'sb-refresh-token'
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7

type AuthSession = {
  access_token: string
  refresh_token: string
  expires_in?: number
  token_type?: string
  user: SupabaseAuthUser
}

type SupabaseAuthUser = {
  id: string
  email?: string
  user_metadata?: {
    name?: string
    [key: string]: unknown
  }
}

type AuthRequestOptions = {
  method?: string
  body?: unknown
  useServiceRole?: boolean
  accessToken?: string
}

function getSupabaseUrl() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!url) {
    throw new Error('Variável de ambiente SUPABASE_URL ausente')
  }

  return url.replace(/\/$/, '')
}

function getAnonKey() {
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY

  if (!anonKey) {
    throw new Error('Variável de ambiente NEXT_PUBLIC_SUPABASE_ANON_KEY ausente')
  }

  return anonKey
}

function getServiceRoleKey() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error('Variável de ambiente SUPABASE_SERVICE_ROLE_KEY ausente')
  }

  return serviceRoleKey
}

async function authRequest<T>(path: string, options: AuthRequestOptions = {}) {
  const key = options.useServiceRole ? getServiceRoleKey() : getAnonKey()
  const response = await fetch(`${getSupabaseUrl()}/auth/v1/${path}`, {
    method: options.method ?? 'GET',
    headers: {
      apikey: key,
      Authorization: `Bearer ${options.accessToken ?? key}`,
      'Content-Type': 'application/json',
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const rawBody = await response.text()
  const data = rawBody ? JSON.parse(rawBody) : null

  if (!response.ok) {
    const message =
      typeof data?.msg === 'string'
        ? data.msg
        : typeof data?.message === 'string'
        ? data.message
        : `Requisição ao Supabase Auth falhou com status ${response.status}`

    throw new Error(message)
  }

  return data as T
}

export async function signInWithPassword(email: string, password: string) {
  return authRequest<AuthSession>('token?grant_type=password', {
    method: 'POST',
    body: { email, password },
  })
}

export async function signUpWithPassword(
  email: string,
  password: string,
  name: string,
) {
  return authRequest<AuthSession | SupabaseAuthUser>('signup', {
    method: 'POST',
    body: {
      email,
      password,
      data: { name },
    },
  })
}

export async function refreshSession(refreshToken: string) {
  return authRequest<AuthSession>('token?grant_type=refresh_token', {
    method: 'POST',
    body: { refresh_token: refreshToken },
  })
}

async function getUser(accessToken: string) {
  return authRequest<SupabaseAuthUser>('user', { accessToken })
}

export async function setAuthCookies(session: AuthSession) {
  const cookieStore = await cookies()

  cookieStore.set(ACCESS_TOKEN_COOKIE, session.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: session.expires_in ?? 3600,
  })

  cookieStore.set(REFRESH_TOKEN_COOKIE, session.refresh_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ONE_WEEK_SECONDS,
  })
}

export async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete(ACCESS_TOKEN_COOKIE)
  cookieStore.delete(REFRESH_TOKEN_COOKIE)
}

export async function getCurrentAuthUser() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value

  if (accessToken) {
    try {
      return await getUser(accessToken)
    } catch {
      // Try to refresh the session below.
    }
  }

  if (!refreshToken) {
    return null
  }

  try {
    const session = await refreshSession(refreshToken)
    await setAuthCookies(session)
    return session.user
  } catch {
    await clearAuthCookies()
    return null
  }
}

export async function createAuthUser({
  email,
  password,
  name,
}: {
  email: string
  password: string
  name: string
}) {
  return authRequest<SupabaseAuthUser>('admin/users', {
    method: 'POST',
    useServiceRole: true,
    body: {
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    },
  })
}

export async function updateAuthUser(
  id: string,
  updates: { email?: string; password?: string; name?: string },
) {
  const userMetadata = updates.name ? { name: updates.name } : undefined

  return authRequest<SupabaseAuthUser>(`admin/users/${id}`, {
    method: 'PUT',
    useServiceRole: true,
    body: {
      email: updates.email,
      password: updates.password || undefined,
      user_metadata: userMetadata,
    },
  })
}

export async function deleteAuthUser(id: string) {
  return authRequest<null>(`admin/users/${id}`, {
    method: 'DELETE',
    useServiceRole: true,
  })
}

export async function getCurrentAdminProfile() {
  const user = await getCurrentAuthUser()

  if (!user) {
    return null
  }

  const { data: users } = await supabaseRequest<AdminUserRow[]>('admin_users', {
    searchParams: {
      select: 'id,auth_user_id,email,name,role',
      auth_user_id: `eq.${user.id}`,
      limit: 1,
    },
  })

  const profile = users[0]

  if (!profile) {
    return null
  }

  return {
    authUser: user,
    profile,
    role: profile.role as AdminRole,
  }
}
