import { cookies } from 'next/headers'
import crypto from 'node:crypto'
import { supabaseRequest } from '@/lib/supabaseAdmin'
import { AdminRole, AdminUserRow } from '@/lib/types'

const SESSION_COOKIE = 'admin-session'
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7
const HASH_ITERATIONS = 120000
const KEY_LENGTH = 64
const DIGEST = 'sha512'

type SessionPayload = {
  sub: string
  email?: string | null
  name: string
  role: AdminRole
  exp: number
}

function getAuthSecret() {
  const secret = process.env.NEON_AUTH_COOKIE_SECRET ?? process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error('Variável de ambiente NEON_AUTH_COOKIE_SECRET/AUTH_SECRET/NEXTAUTH_SECRET ausente')
  return secret
}

function hashPassword(password: string, salt?: string) {
  const effectiveSalt = salt ?? crypto.randomBytes(16).toString('hex')
  const hash = crypto
    .pbkdf2Sync(password, effectiveSalt, HASH_ITERATIONS, KEY_LENGTH, DIGEST)
    .toString('hex')
  return `${effectiveSalt}:${hash}`
}

function verifyPassword(password: string, passwordHash: string) {
  const [salt, currentHash] = passwordHash.split(':')
  if (!salt || !currentHash) return false
  const candidate = hashPassword(password, salt).split(':')[1]
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(currentHash))
}

function signPayload(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto
    .createHmac('sha256', getAuthSecret())
    .update(body)
    .digest('base64url')
  return `${body}.${sig}`
}

function verifyToken(token: string): SessionPayload | null {
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = crypto
    .createHmac('sha256', getAuthSecret())
    .update(body)
    .digest('base64url')
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload
  if (payload.exp < Math.floor(Date.now() / 1000)) return null
  return payload
}

export async function createUser(email: string, name: string, password: string, role: AdminRole = 'admin') {
  const normalizedEmail = email.toLowerCase().trim()
  const normalizedName = name.trim()

  const { data } = await supabaseRequest<AdminUserRow[]>('admin_users', {
    method: 'POST',
    body: { email: normalizedEmail, name: normalizedName, role, password_hash: hashPassword(password) },
    searchParams: { select: 'id,email,name,role' },
    headers: { Prefer: 'return=representation' },
  })

  if (data?.[0]) return data[0]

  // Alguns gateways podem ignorar `Prefer: return=representation` e devolver 201 sem corpo.
  // Nesses cenários, buscamos o usuário recém-criado para evitar falso negativo no cadastro.
  const fallback = await supabaseRequest<AdminUserRow[]>('admin_users', {
    searchParams: { select: 'id,email,name,role', email: `eq.${normalizedEmail}`, limit: 1 },
  })

  if (fallback.data?.[0]) return fallback.data[0]

  throw new Error('Usuário criado, mas a API de dados não retornou o registro para confirmação')
}

export async function authenticate(email: string, password: string) {
  const { data } = await supabaseRequest<(AdminUserRow & { password_hash?: string | null })[]>('admin_users', {
    searchParams: { select: 'id,email,name,role,password_hash', email: `eq.${email}`, limit: 1 },
  })
  const user = data[0]
  if (!user?.password_hash || !verifyPassword(password, user.password_hash)) return null
  return user
}

export async function setSession(user: { id: string; email?: string | null; name: string; role: AdminRole }) {
  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + ONE_WEEK_SECONDS,
  }
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, signPayload(payload), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ONE_WEEK_SECONDS,
  })
}

export async function clearSession() {
  const cookieStore = await cookies(); cookieStore.delete(SESSION_COOKIE)
}

export async function getCurrentAdminProfile() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  return { profile: { id: payload.sub, email: payload.email, name: payload.name, role: payload.role }, role: payload.role }
}

export async function updateUserPassword(id: string, password: string) {
  await supabaseRequest('admin_users', { method: 'PATCH', body: { password_hash: hashPassword(password) }, searchParams: { id: `eq.${id}` } })
}
